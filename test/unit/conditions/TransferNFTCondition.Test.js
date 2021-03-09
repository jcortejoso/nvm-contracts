/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const TransferNFTCondition = artifacts.require('TransferNFTCondition')
const NFTLockCondition = artifacts.require('NFTLockCondition')
const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('TransferNFT Condition constructor', (accounts) => {
    const amount = 2

    let didRegistry,
        didRegistryLibrary,
        epochLibrary,
        templateStoreManager,
        agreementStoreLibrary,
        agreementStoreManager,
        conditionStoreManager,
        lockCondition,
        transferCondition

    async function setupTest({
        accounts = [],
        conditionId = testUtils.generateId(),
        conditionType = constants.address.dummy,
        rewardAddress = testUtils.generateAccount().address,
        agreementId = testUtils.generateId(),
        did = testUtils.generateId(),
        checksum = testUtils.generateId(),
        url = constants.registry.url,
        deployer = accounts[8],
        createRole = accounts[0],
        owner = accounts[1],
        registerDID = false,
        DIDProvider = accounts[9]
    } = {}) {
        if (!transferCondition) {
            didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            didRegistry.initialize(owner)

            epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            conditionStoreManager = await ConditionStoreManager.new()

            templateStoreManager = await TemplateStoreManager.new()
            await templateStoreManager.initialize(
                owner,
                { from: owner }
            )

            agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            agreementStoreManager = await AgreementStoreManager.new()
            await agreementStoreManager.methods['initialize(address,address,address,address)'](
                owner,
                conditionStoreManager.address,
                templateStoreManager.address,
                didRegistry.address
            )

            await conditionStoreManager.initialize(
                owner,
                { from: owner }
            )

            await conditionStoreManager.delegateCreateRole(
                createRole,
                { from: owner }
            )

            transferCondition = await TransferNFTCondition.new()

            await transferCondition.methods['initialize(address,address,address)'](
                owner,
                conditionStoreManager.address,
                agreementStoreManager.address
            )

            lockCondition = await NFTLockCondition.new()

            await lockCondition.initialize(
                owner,
                conditionStoreManager.address,
                didRegistry.address
            )
        }

        if (registerDID) {
            await didRegistry.registerMintableDID(
                did, checksum, [], url, amount, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, amount)
            await didRegistry.setApprovalForAll(lockCondition.address, true)
        }

        return {
            owner,
            rewardAddress,
            agreementId,
            did,
            conditionId,
            conditionType,
            DIDProvider,
            didRegistry,
            agreementStoreManager,
            templateStoreManager,
            conditionStoreManager,
            transferCondition,
            lockCondition
        }
    }

    describe('fulfill correctly', () => {
        it('should fulfill if condition exist', async () => {
            const {
                rewardAddress,
                agreementId,
                did,
                transferCondition,
                conditionStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            const hashValuesLock = await lockCondition.hashValues(did, rewardAddress, amount)
            const lockConditionId = await lockCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                lockConditionId,
                lockCondition.address)

            await lockCondition.fulfill(agreementId, did, rewardAddress, amount)
            await lockCondition.grantTransferApproval(transferCondition.address)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(lockConditionId)).toNumber(),
                constants.condition.state.fulfilled)

            const hashValues = await transferCondition.hashValues(did, rewardAddress, amount, lockConditionId)
            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                transferCondition.address)

            const result = await transferCondition.fulfill(agreementId, did, rewardAddress, amount, lockConditionId)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._receiver).to.equal(rewardAddress)
            expect(eventArgs._amount.toNumber()).to.equal(amount)
        })
    })

    describe('trying to fulfill invalid conditions', () => {
        it('should not fulfill if condition does not exist or account is invalid', async () => {
            const {
                rewardAddress,
                agreementId,
                did,
                transferCondition,
                conditionStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            const hashValuesLock = await lockCondition.hashValues(did, rewardAddress, amount)
            const lockConditionId = await lockCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                lockConditionId,
                lockCondition.address)

            await lockCondition.fulfill(agreementId, did, rewardAddress, amount)
            await lockCondition.grantTransferApproval(transferCondition.address)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(lockConditionId)).toNumber(),
                constants.condition.state.fulfilled)

            const hashValues = await transferCondition.hashValues(did, rewardAddress, amount, lockConditionId)
            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                transferCondition.address)

            const other = testUtils.generateAccount().address
            // Invalid user executing the fulfill
            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, rewardAddress, amount, lockConditionId,
                    { from: other })
            )

            // Invalid reward address
            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, other, amount, lockConditionId)
            )

            // Invalid conditionId
            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, rewardAddress, amount, testUtils.generateId())
            )

            // Invalid agreementID
            await assert.isRejected(
                transferCondition.fulfill(testUtils.generateId(), did, rewardAddress, amount, lockConditionId)
            )
        })

    /*
        it('wrong did owner should fail to fulfill if conditions exist', async () => {
            const {
                owner,
                agreementId,
                did,
                agreementStoreManager,
                transferCondition,
                templateStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            const templateId = accounts[7]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await transferCondition.hashValues(did, receiver, amount)
            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: did,
                conditionTypes: [transferCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await transferCondition.fulfill(agreementId, did, receiver, amount, { from: owner })

            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, receiver, amount, { from: accounts[1] })
            )
        })
        */
    })
})
