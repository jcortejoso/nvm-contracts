/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const NftHolderCondition = artifacts.require('NftHolderCondition')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')
const testUtils = require('../../helpers/utils.js')

contract('NftHolderCondition', (accounts) => {
    const owner = accounts[1]
    createRole = accounts[0]
    const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'
    let didRegistry
    let conditionStoreManager
    let nftHolderCondition

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!didRegistry) {
            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)
        }
        if (!conditionStoreManager) {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(owner, { from: owner })
            await conditionStoreManager.delegateCreateRole(createRole, { from: owner })

            nftHolderCondition = await NftHolderCondition.new()
            await nftHolderCondition.initialize(
                accounts[0],
                conditionStoreManager.address,
                didRegistry.address,
                { from: accounts[0] })
        }
    }

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for account address', async () => {

            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const agreementId = testUtils.generateId()
            const holderAddress = accounts[2]
            const sender = accounts[0]
            const amount = 10

            const hashValues = await nftHolderCondition.hashValues(did, holderAddress, amount)
            const conditionId = await nftHolderCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                nftHolderCondition.address)

            await didRegistry.registerAttribute(did, checksum, [], value, { from: owner })
            await didRegistry.mint(did, 10, { from: owner })
            await didRegistry.safeTransferFrom(
                owner, holderAddress, BigInt(did), 10, '0x', { from: owner })


            const result = await nftHolderCondition.fulfill(agreementId, did, holderAddress, amount)
            const { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._address).to.equal(holderAddress)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._amount.toNumber()).to.equal(amount)
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {

            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const agreementId = testUtils.generateId()
            const holderAddress = accounts[2]
            const sender = accounts[0]
            const amount = 10

            await didRegistry.registerAttribute(did, checksum, [], value, { from: owner })
            await didRegistry.mint(did, 10, { from: owner })
            await didRegistry.safeTransferFrom(
                owner, holderAddress, BigInt(did), 10, '0x', { from: owner })

            await assert.isRejected(
                nftHolderCondition.fulfill(agreementId, did, holderAddress, amount),
                constants.acl.error.invalidUpdateRole
            )
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('out of balance should fail to fulfill if conditions exist', async () => {

            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const agreementId = testUtils.generateId()
            const holderAddress = accounts[2]
            const sender = accounts[0]
            const amount = 10

            const hashValues = await nftHolderCondition.hashValues(did, holderAddress, amount)
            const conditionId = await nftHolderCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                nftHolderCondition.address)

            await didRegistry.registerAttribute(did, checksum, [], value, { from: owner })
            await didRegistry.mint(did, 10, { from: owner })
            await didRegistry.safeTransferFrom(
                owner, holderAddress, BigInt(did), 1, '0x', { from: owner })


            await assert.isRejected(
                 nftHolderCondition.fulfill(agreementId, did, holderAddress, amount),
                constants.condition.nft.error.notEnoughNFTBalance
            )
        })

    })


})
