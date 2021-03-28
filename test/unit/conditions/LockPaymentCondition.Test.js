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
const NeverminedToken = artifacts.require('NeverminedToken')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')
const testUtils = require('../../helpers/utils.js')

contract('LockPaymentCondition', (accounts) => {
    let epochLibrary
    let conditionStoreManager
    let token
    let lockPaymentCondition
    let didRegistry
    let didRegistryLibrary

    const owner = accounts[1]
    const createRole = accounts[0]
    const checksum = testUtils.generateId()
    const url = 'https://example.com/did/ocean/test-attr-example.txt'

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!conditionStoreManager) {
            didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner, { from: owner })

            epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(owner, { from: owner })

            await conditionStoreManager.delegateCreateRole(
                createRole,
                { from: owner }
            )

            token = await NeverminedToken.new()
            await token.initialize(owner, owner)

            lockPaymentCondition = await LockPaymentCondition.new()

            await lockPaymentCondition.initialize(
                owner,
                conditionStoreManager.address,
                token.address,
                didRegistry.address,
                { from: createRole }
            )
        }
    }

    describe('fulfill condition', () => {
        it('should fulfill if conditions exist and everything is okay', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const rewardAddress = accounts[3]
            const sender = accounts[0]
            const amounts = [10]
            const receivers = [accounts[1]]

            // register DID
            await didRegistry.registerMintableDID(
                did, checksum, [], url, amounts[0], 20, constants.activities.GENERATED, '')

            const hashValues = await lockPaymentCondition.hashValues(did, rewardAddress, amounts, receivers)
            const conditionId = await lockPaymentCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockPaymentCondition.address)

            await token.mint(sender, 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10, { from: sender })

            const result = await lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers)
            const { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
            const rewardBalance = await getBalance(token, rewardAddress)
            assert.strictEqual(rewardBalance, 10)

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(did)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._rewardAddress).to.equal(rewardAddress)
            expect(eventArgs._receivers[0]).to.equal(receivers[0])
            expect(eventArgs._amounts[0].toNumber()).to.equal(amounts[0])
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if DID do not exist', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const rewardAddress = accounts[3]
            const sender = accounts[0]
            const amounts = [10]
            const receivers = [accounts[1]]

            await token.mint(sender, 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10, { from: sender })

            await assert.isRejected(
                lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('should not fulfill if conditions do not exist', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const rewardAddress = accounts[3]
            const sender = accounts[0]
            const amounts = [10]
            const receivers = [accounts[1]]

            await didRegistry.registerMintableDID(
                did, checksum, [], url, amounts[0], 20, constants.activities.GENERATED, '')

            await token.mint(sender, 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10, { from: sender })

            await assert.isRejected(
                lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('out of balance should fail to fulfill if conditions exist', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const rewardAddress = accounts[3]
            const sender = accounts[0]
            const amounts = [10]
            const receivers = [accounts[1]]

            await didRegistry.registerMintableDID(
                did, checksum, [], url, amounts[0], 20, constants.activities.GENERATED, '')

            await token.mint(sender, 5, { from: owner })
            await token.approve(lockPaymentCondition.address, 5, { from: sender })

            const hashValues = await lockPaymentCondition.hashValues(did, rewardAddress, amounts, receivers)
            const conditionId = await lockPaymentCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockPaymentCondition.address)

            await assert.isRejected(
                lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers),
                undefined
            )
        })

        it('right transfer should fail to fulfill if conditions already fulfilled', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const rewardAddress = accounts[3]
            const sender = accounts[0]
            const amounts = [10]
            const receivers = [accounts[1]]

            await didRegistry.registerMintableDID(
                did, checksum, [], url, amounts[0], 20, constants.activities.GENERATED, '')

            await token.mint(sender, 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10, { from: sender })

            const hashValues = await lockPaymentCondition.hashValues(did, rewardAddress, amounts, receivers)
            const conditionId = await lockPaymentCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockPaymentCondition.address
            )

            await token.approve(lockPaymentCondition.address, 10, { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )

            await assert.isRejected(
                lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers),
                undefined
            )

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const rewardAddress = accounts[3]
            const sender = accounts[0]
            const amounts = [10]
            const receivers = [accounts[1]]

            await didRegistry.registerMintableDID(
                did, checksum, [], url, amounts[0], 20, constants.activities.GENERATED, '')

            const hashValues = await lockPaymentCondition.hashValues(did, rewardAddress, amounts, receivers)
            const conditionId = await lockPaymentCondition.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                conditionId,
                lockPaymentCondition.address
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await token.mint(sender, 10, { from: owner })
            await token.approve(lockPaymentCondition.address, 10, { from: sender })

            await assert.isRejected(
                lockPaymentCondition.fulfill(agreementId, did, rewardAddress, amounts, receivers),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})