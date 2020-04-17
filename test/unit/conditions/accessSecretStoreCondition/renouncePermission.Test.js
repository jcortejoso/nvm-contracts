/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */
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

const common = require('./common')

contract('AccessSecretStoreCondition', (accounts) => {
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

    describe('renounce permission', () => {
        it('should DID owner or provider renounce permission', async () => {
            const {
                DIDProvider,
                did,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]

            await accessSecretStoreCondition.grantPermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            await accessSecretStoreCondition.renouncePermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            assert.strictEqual(
                await accessSecretStoreCondition.checkPermissions(
                    grantee,
                    documentId
                ),
                false
            )
        })

        it('should fail to renounce if not a DID owner or provider', async () => {
            const {
                DIDProvider,
                did,
                accessSecretStoreCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]
            const someone = accounts[7]

            await accessSecretStoreCondition.grantPermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            await assert.isRejected(
                accessSecretStoreCondition.renouncePermission(
                    grantee,
                    documentId,
                    { from: someone }
                ),
                'Invalid DID owner/provider'
            )

            assert.strictEqual(
                await accessSecretStoreCondition.checkPermissions(
                    grantee,
                    documentId
                ),
                true
            )
        })
    })
})
