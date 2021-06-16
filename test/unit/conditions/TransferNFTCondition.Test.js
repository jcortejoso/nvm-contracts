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
const NeverminedToken = artifacts.require('NeverminedToken')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const TransferNFTCondition = artifacts.require('TransferNFTCondition')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')
const EscrowPaymentCondition = artifacts.require('EscrowPaymentCondition')
const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('TransferNFT Condition constructor', (accounts) => {
    const createRole = accounts[0]
    const owner = accounts[1]
    const numberNFTs = 2 // NFTs
    const paymentAmounts = [10]
    const paymentReceivers = [accounts[3]]
    const other = accounts[4]
    let token,
        didRegistry,
        didRegistryLibrary,
        epochLibrary,
        templateStoreManager,
        agreementStoreLibrary,
        agreementStoreManager,
        conditionStoreManager,
        lockPaymentCondition,
        escrowCondition,
        transferCondition

    async function setupTest({
        accounts = [],
        conditionId = testUtils.generateId(),
        conditionType = constants.address.dummy,
        rewardAddress = testUtils.generateAccount().address,
        agreementId = testUtils.generateId(),
        didSeed = testUtils.generateId(),
        checksum = testUtils.generateId(),
        url = constants.registry.url,
        registerDID = false,
        DIDProvider = accounts[9]
    } = {}) {
        if (!transferCondition) {
            token = await NeverminedToken.new()
            await token.initialize(owner, owner)

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
                didRegistry.address
            )

            lockPaymentCondition = await LockPaymentCondition.new()

            await lockPaymentCondition.initialize(
                owner,
                conditionStoreManager.address,
                didRegistry.address,
                { from: createRole }
            )

            escrowCondition = await EscrowPaymentCondition.new()
            await escrowCondition.initialize(
                owner,
                conditionStoreManager.address,
                { from: createRole }
            )

            // IMPORTANT: Here we give ERC1155 transfer grants to the TransferNFTCondition condition
            await didRegistry.setProxyApproval(transferCondition.address, true, { from: owner })
        }

        const did = await didRegistry.hashDID(didSeed, accounts[0])

        if (registerDID) {
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, numberNFTs, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, numberNFTs)
            //            await didRegistry.setApprovalForAll(lockNFTCondition.address, true)
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
            lockPaymentCondition,
            escrowCondition
        }
    }

    describe('init fail', () => {
        it('initialization fails if needed contracts are 0', async () => {
            const token = await NeverminedToken.new()
            await token.initialize(owner, owner)

            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            const didRegistry = await DIDRegistry.new()
            didRegistry.initialize(owner)

            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new()

            const templateStoreManager = await TemplateStoreManager.new()
            await templateStoreManager.initialize(
                owner,
                { from: owner }
            )

            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()
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

            const transferCondition = await TransferNFTCondition.new()

            await assert.isRejected(transferCondition.methods['initialize(address,address,address)'](
                owner,
                constants.address.zero,
                agreementStoreManager.address
            ), undefined)
        })
    })

    describe('fulfill correctly', () => {
        it('should fulfill if condition exist', async () => {
            const {
                rewardAddress,
                agreementId,
                did,
                transferCondition,
                conditionStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            const hashValuesPayment = await lockPaymentCondition.hashValues(
                did, escrowCondition.address, token.address, paymentAmounts, paymentReceivers)
            const conditionIdPayment = await lockPaymentCondition.generateId(agreementId, hashValuesPayment)

            await conditionStoreManager.createCondition(
                conditionIdPayment,
                lockPaymentCondition.address)

            await token.mint(accounts[0], 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10)

            await lockPaymentCondition.fulfill(agreementId, did, escrowCondition.address, token.address, paymentAmounts, paymentReceivers)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdPayment)).toNumber(),
                constants.condition.state.fulfilled)

            const hashValues = await transferCondition.hashValues(
                did, rewardAddress, numberNFTs, conditionIdPayment)

            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                transferCondition.address)

            const result = await transferCondition.fulfill(
                agreementId, did, rewardAddress, numberNFTs,
                conditionIdPayment)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._receiver).to.equal(rewardAddress)
            expect(eventArgs._amount.toNumber()).to.equal(numberNFTs)
        })

        it('anyone should be able to fulfill if condition exist', async () => {
            const {
                rewardAddress,
                agreementId,
                did,
                transferCondition,
                conditionStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            const hashValuesPayment = await lockPaymentCondition.hashValues(
                did, escrowCondition.address, token.address, paymentAmounts, paymentReceivers)
            const conditionIdPayment = await lockPaymentCondition.generateId(agreementId, hashValuesPayment)

            await conditionStoreManager.createCondition(
                conditionIdPayment,
                lockPaymentCondition.address)

            await token.mint(accounts[0], 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10)

            await lockPaymentCondition.fulfill(agreementId, did, escrowCondition.address, token.address, paymentAmounts, paymentReceivers)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdPayment)).toNumber(),
                constants.condition.state.fulfilled)

            const hashValues = await transferCondition.hashValues(
                did, rewardAddress, numberNFTs, conditionIdPayment)

            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                transferCondition.address)

            const result = await transferCondition.fulfill(
                agreementId, did, rewardAddress, numberNFTs,
                conditionIdPayment, { from: other })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
            testUtils.assertEmitted(result, 1, 'Fulfilled')
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

            const hashValuesPayment = await lockPaymentCondition.hashValues(
                did, lockPaymentCondition.address, token.address, paymentAmounts, paymentReceivers)
            const conditionIdPayment = await lockPaymentCondition.generateId(agreementId, hashValuesPayment)

            await conditionStoreManager.createCondition(
                conditionIdPayment,
                lockPaymentCondition.address)

            await token.mint(accounts[0], 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10)

            await lockPaymentCondition.fulfill(agreementId, did, lockPaymentCondition.address, token.address, paymentAmounts, paymentReceivers)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdPayment)).toNumber(),
                constants.condition.state.fulfilled)

            const hashValues = await transferCondition.hashValues(
                did, rewardAddress, numberNFTs, conditionIdPayment)

            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                transferCondition.address)

            // Invalid reward address
            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, other, numberNFTs, conditionIdPayment)
            )

            // Invalid conditionId
            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, rewardAddress, numberNFTs, testUtils.generateId())
            )

            // Invalid agreementID
            await assert.isRejected(
                transferCondition.fulfill(testUtils.generateId(), did, rewardAddress, numberNFTs, conditionIdPayment)
            )
        })

        it('should not be able to fulfill the same condition twice if condition exist', async () => {
            const {
                rewardAddress,
                agreementId,
                did,
                transferCondition,
                conditionStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            const hashValuesPayment = await lockPaymentCondition.hashValues(
                did, escrowCondition.address, token.address, paymentAmounts, paymentReceivers)
            const conditionIdPayment = await lockPaymentCondition.generateId(agreementId, hashValuesPayment)

            await conditionStoreManager.createCondition(
                conditionIdPayment,
                lockPaymentCondition.address)

            await token.mint(accounts[0], 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10)

            await lockPaymentCondition.fulfill(agreementId, did, escrowCondition.address, token.address, paymentAmounts, paymentReceivers)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIdPayment)).toNumber(),
                constants.condition.state.fulfilled)

            const hashValues = await transferCondition.hashValues(
                did, rewardAddress, numberNFTs, conditionIdPayment)

            const conditionId = await transferCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                transferCondition.address)

            const result = await transferCondition.fulfill(
                agreementId, did, rewardAddress, numberNFTs,
                conditionIdPayment, { from: other })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
            testUtils.assertEmitted(result, 1, 'Fulfilled')

            // Trying to fulfill the same condition again
            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, rewardAddress, numberNFTs,
                    conditionIdPayment, { from: other })
            )
        })
    })
})
