/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const deployManagers = require('../../helpers/deployManagers.js')
const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const TransferDIDOwnershipCondition = artifacts.require('TransferDIDOwnershipCondition')
const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('TransferDIDOwnership Condition constructor', (accounts) => {
    const checksum = testUtils.generateId()
    const url = constants.registry.url

    let didRegistry,
        didRegistryLibrary,
        templateStoreManager,
        agreementStoreManager,
        conditionStoreManager,
        transferCondition

    async function setupTest({
        accounts = [],
        conditionId = testUtils.generateId(),
        conditionType = constants.address.dummy,
        did = testUtils.generateId(),
        checksum = testUtils.generateId(),
        value = constants.registry.url,
        deployer = accounts[8],
        owner = accounts[0],
        registerDID = false,
        DIDProvider = accounts[9]
    } = {}) {
        if (!transferCondition) {
            ({
                didRegistry,
                agreementStoreManager,
                conditionStoreManager,
                templateStoreManager
            } = await deployManagers(
                deployer,
                owner
            ))
//            templateStoreManager = await TemplateStoreManager.new()
//            await templateStoreManager.initialize(
//                owner,
//                { from: deployer }
//            )
//            agreementStoreLibrary = await AgreementStoreLibrary.new()
//            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
//            agreementStoreManager = await AgreementStoreManager.new()
//            didRegistryLibrary = await DIDRegistryLibrary.new()
//            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
//            didRegistry = await DIDRegistry.new()
//            await didRegistry.initialize(owner)

            transferCondition = await TransferDIDOwnershipCondition.new({ from: deployer })

            await transferCondition.methods['initialize(address,address,address)'](
                owner,
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: deployer }
            )

        }

        if (registerDID) {
//            await didRegistry.registerAttribute(did, checksum, [DIDProvider], value, {from: owner})
        }

        return {
            owner,
            did,
            conditionId,
            conditionType,
            owner,
            DIDProvider,
            didRegistry,
            agreementStoreManager,
            templateStoreManager,
            conditionStoreManager,
            transferCondition
        }
    }

    describe('trying to fulfill invalid conditions', () => {
        it('should not fulfill if condition does not exist', async () => {
            const {
                transferCondition
            } = await setupTest({ accounts: accounts })

            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const receiver = accounts[1]

            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, receiver, { from: receiver}),
                'Only DID Owner allowed'
            )
        })

        it('should not fulfill if condition does not exist', async () => {
            const {
                transferCondition
            } = await setupTest({ accounts: accounts })

            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const receiver = accounts[1]

            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, receiver),
                'Only DID Owner allowed'
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if condition exist', async () => {
            const {
                owner,
                did,
                agreementStoreManager,
                didRegistry,
                transferCondition,
                conditionStoreManager,
                templateStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            await didRegistry.registerAttribute(did, checksum, [], url, {from: owner})

            const agreementId = testUtils.generateId()
            const receiver = accounts[1]

            const templateId = accounts[6]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await transferCondition.hashValues(did, receiver)
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

            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, receiver, {from: receiver}),
                'Only DID Owner allowed'
            )

            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.owner,
                owner
            )

            assert.strictEqual(didRegistry.address, await agreementStoreManager.getDIDRegistryAddress())
            const result = await transferCondition.fulfill(agreementId, did, receiver, {from: owner})

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._receiver).to.equal(receiver)

        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong did owner should fail to fulfill if conditions exist', async () => {
            const {
                owner,
                did,
                agreementStoreManager,
                didRegistry,
                transferCondition,
                templateStoreManager
            } = await setupTest({ accounts: accounts, registerDID: true })

            await didRegistry.registerAttribute(did, checksum, [], url, {from: owner})

            const agreementId = testUtils.generateId()
            const receiver = accounts[1]

            const templateId = accounts[7]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await transferCondition.hashValues(did, receiver)
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

            const result = await transferCondition.fulfill(agreementId, did, receiver, {from: owner})

            await assert.isRejected(
                transferCondition.fulfill(agreementId, did, receiver, { from: accounts[1] })
            )
        })

    })
})
