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
const NFTLockCondition = artifacts.require('NFTLockCondition')

const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('NFTLockCondition', (accounts) => {
    let epochLibrary
    let conditionStoreManager
    let didRegistry
    let didRegistryLibrary
    let lockCondition

    const owner = accounts[1]
    const createRole = accounts[0]
    const url = constants.registry.url
    const checksum = constants.bytes32.one
    const amount = 10

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!didRegistry) {
            didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)
        }
        if (!conditionStoreManager) {
            epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(
                owner,
                { from: owner }
            )

            await conditionStoreManager.delegateCreateRole(
                createRole,
                { from: owner }
            )

            lockCondition = await NFTLockCondition.new()

            await lockCondition.initialize(
                owner,
                conditionStoreManager.address,
                didRegistry.address,
                { from: createRole }
            )
        }
    }

    describe('fulfill correctly', () => {
        it('should fulfill if conditions exist for account address', async () => {
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])

            const agreementId = testUtils.generateId()
            const rewardAddress = testUtils.generateAccount().address

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amount, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, amount)
            await didRegistry.setApprovalForAll(lockCondition.address, true)

            const hashValues = await lockCondition.hashValues(did, rewardAddress, amount)
            const conditionId = await lockCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockCondition.address)

            const result = await lockCondition.fulfill(agreementId, did, rewardAddress, amount)
            const { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
            const nftBalance = await didRegistry.balanceOf(lockCondition.address, did)
            assert.strictEqual(nftBalance.toNumber(), amount)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._rewardAddress).to.equal(rewardAddress)
            expect(eventArgs._amount.toNumber()).to.equal(amount)
        })
    })

    describe('trying to fulfill but is invalid', () => {
        it('should not fulfill if conditions do not exist', async () => {
            const agreementId = testUtils.generateId()
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])

            const rewardAddress = accounts[2]

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amount, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, amount)
            await didRegistry.setApprovalForAll(lockCondition.address, true)

            await assert.isRejected(
                lockCondition.fulfill(agreementId, did, rewardAddress, amount),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('out of balance should fail to fulfill', async () => {
            const agreementId = testUtils.generateId()
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])

            const rewardAddress = accounts[2]

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amount, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, amount)
            await didRegistry.setApprovalForAll(lockCondition.address, true)

            const hashValues = await lockCondition.hashValues(did, rewardAddress, amount)
            const conditionId = await lockCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockCondition.address)

            await assert.isRejected(
                lockCondition.fulfill(agreementId, did, rewardAddress, amount + 1),
                undefined
            )
        })

        it('right transfer should fail to fulfill if conditions already fulfilled', async () => {
            const agreementId = testUtils.generateId()
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])

            const rewardAddress = accounts[2]

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amount, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, amount)
            await didRegistry.setApprovalForAll(lockCondition.address, true)

            const hashValues = await lockCondition.hashValues(did, rewardAddress, amount)
            const conditionId = await lockCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockCondition.address
            )

            await lockCondition.fulfill(agreementId, did, rewardAddress, amount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )

            await assert.isRejected(
                lockCondition.fulfill(agreementId, did, rewardAddress, amount),
                undefined
            )

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const agreementId = testUtils.generateId()
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])

            const rewardAddress = accounts[2]

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amount, 0, constants.activities.GENERATED, '')
            await didRegistry.mint(did, amount)
            await didRegistry.setApprovalForAll(lockCondition.address, true)

            const hashValues = await lockCondition.hashValues(did, rewardAddress, amount)
            const conditionId = await lockCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockCondition.address
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await assert.isRejected(
                lockCondition.fulfill(agreementId, did, rewardAddress, amount),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
