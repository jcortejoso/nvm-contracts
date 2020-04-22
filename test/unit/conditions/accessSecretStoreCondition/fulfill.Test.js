/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const DIDRegistry = artifacts.require('DIDRegistry')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')

const constants = require('../../../helpers/constants.js')
const testUtils = require('../../../helpers/utils.js')
const common = require('./common')

contract('AccessSecretStoreCondition constructor', (accounts) => {
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            const conditionStoreManager = await ConditionStoreManager.new()
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()
            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            const didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(accounts[0])
            const accessSecretStoreCondition = await AccessSecretStoreCondition.new()

            await accessSecretStoreCondition.methods['initialize(address,address,address)'](
                accounts[0],
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if condition does not exist', async () => {
            const {
                accessSecretStoreCondition
            } = await common.setupTest({ accounts: accounts })

            const agreementId = constants.bytes32.one
            const documentId = constants.bytes32.one
            const grantee = accounts[1]

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee),
                'Invalid DID owner/provider'
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if condition exist', async () => {
            const {
                did,
                agreementStoreManager,
                conditionStoreManager,
                templateStoreManager,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const documentId = did
            const grantee = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            const result = await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._documentId).to.equal(documentId)
            expect(eventArgs._grantee).to.equal(grantee)
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong did owner should fail to fulfill if conditions exist', async () => {
            const {
                did,
                agreementStoreManager,
                templateStoreManager,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const documentId = did
            const grantee = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
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
                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee, { from: accounts[1] }),
                'Invalid DID owner/provider'
            )
        })

        it('right did owner should fail to fulfill if conditions already fulfilled', async () => {
            const {
                did,
                agreementStoreManager,
                templateStoreManager,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const documentId = did
            const grantee = accounts[1]

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [0],
                timeOuts: [2]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            await assert.isRejected(
                accessSecretStoreCondition.fulfill(agreementId, documentId, grantee),
                constants.condition.state.error.invalidStateTransition
            )
        })
    })

    describe('get access secret store condition', () => {
        it('successful create should get condition and permissions', async () => {
            const {
                did,
                agreementStoreManager,
                conditionStoreManager,
                templateStoreManager,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const documentId = did
            const grantee = accounts[1]
            const timeLock = 10000210
            const timeOut = 234898098

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            const storedCondition = await conditionStoreManager.getCondition(conditionId)
            // TODO - containSubset
            expect(storedCondition.typeRef)
                .to.equal(accessSecretStoreCondition.address)
            expect(storedCondition.timeLock.toNumber())
                .to.equal(timeLock)
            expect(storedCondition.timeOut.toNumber())
                .to.equal(timeOut)
        })
    })
    describe('check permissions', () => {
        it('should grant permission in case of DID provider', async () => {
            const {
                DIDProvider,
                did,
                agreementStoreManager,
                templateStoreManager,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const documentId = did
            const grantee = accounts[1]
            const timeLock = 0
            const timeOut = 234898098

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            assert.strictEqual(
                await accessSecretStoreCondition.checkPermissions(
                    DIDProvider,
                    documentId
                ),
                true
            )
        })
        it('successful create should check permissions', async () => {
            const {
                did,
                agreementStoreManager,
                templateStoreManager,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const agreementId = constants.bytes32.one
            const documentId = did
            const grantee = accounts[1]
            const timeLock = 0
            const timeOut = 234898098

            const templateId = accounts[2]
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const hashValues = await accessSecretStoreCondition.hashValues(documentId, grantee)
            const conditionId = await accessSecretStoreCondition.generateId(agreementId, hashValues)

            const agreement = {
                did: constants.did[0],
                conditionTypes: [accessSecretStoreCondition.address],
                conditionIds: [conditionId],
                timeLocks: [timeLock],
                timeOuts: [timeOut]
            }

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement),
                { from: templateId }
            )

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(false)

            await accessSecretStoreCondition.fulfill(agreementId, documentId, grantee)

            expect(await accessSecretStoreCondition.checkPermissions(grantee, documentId))
                .to.equal(true)
        })
    })
})
