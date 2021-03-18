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
const AccessCondition = artifacts.require('AccessCondition')

const common = require('./common')

contract('AccessCondition', (accounts) => {
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
            const accessCondition = await AccessCondition.new()

            await accessCondition.methods['initialize(address,address,address)'](
                accounts[0],
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('grant permission', () => {
        it('should DID owner or provider grant permission', async () => {
            const {
                DIDProvider,
                did,
                accessCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]

            await accessCondition.grantPermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            assert.strictEqual(
                await accessCondition.checkPermissions(
                    grantee,
                    documentId
                ),
                true
            )
        })

        it('should fail to grant if not a DID owner or provider', async () => {
            const {
                did,
                accessCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]
            const someone = accounts[7]

            await assert.isRejected(
                accessCondition.grantPermission(
                    grantee,
                    documentId,
                    { from: someone }
                ),
                'Invalid DID owner/provider'
            )
        })
    })
})
