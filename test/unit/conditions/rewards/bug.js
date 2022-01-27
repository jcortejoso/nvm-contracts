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
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const NeverminedToken = artifacts.require('NeverminedToken')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')
const EscrowPaymentCondition = artifacts.require('EscrowPaymentCondition')

const constants = require('../../../helpers/constants.js')
const { getBalance, getETHBalance } = require('../../../helpers/getBalance.js')
const testUtils = require('../../../helpers/utils.js')

contract('EscrowPaymentCondition contract', (accounts) => {
    let conditionStoreManager
    let token
    let lockPaymentCondition
    let escrowPayment
    let didRegistry

    const createRole = accounts[0]
    const owner = accounts[9]
    const deployer = accounts[8]
    const checksum = testUtils.generateId()
    const url = 'https://nevermined.io/did/test-attr-example.txt'

    before(async () => {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link(epochLibrary)
        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link(didRegistryLibrary)
    })

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest({
        conditionId = testUtils.generateId(),
        conditionType = testUtils.generateId()
    } = {}) {
        if (!escrowPayment) {
            conditionStoreManager = await ConditionStoreManager.new()
            await conditionStoreManager.initialize(
                owner,
                { from: owner }
            )

            await conditionStoreManager.delegateCreateRole(
                createRole,
                { from: owner }
            )

            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner, constants.address.zero, constants.address.zero)

            token = await NeverminedToken.new()
            await token.initialize(owner, owner)

            lockPaymentCondition = await LockPaymentCondition.new()
            await lockPaymentCondition.initialize(
                owner,
                conditionStoreManager.address,
                didRegistry.address,
                { from: deployer }
            )

            escrowPayment = await EscrowPaymentCondition.new()
            await escrowPayment.initialize(
                owner,
                conditionStoreManager.address,
                { from: deployer }
            )
            await conditionStoreManager.grantProxyRole(
                escrowPayment.address,
                { from: owner }
            )
        }

        return {
            escrowPayment,
            lockPaymentCondition,
            token,
            conditionStoreManager,
            conditionId,
            conditionType,
            createRole,
            owner
        }
    }

    describe('fulfill existing condition', () => {
        it('ERC20: should fulfill if conditions exist for account address', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const receivers2 = [accounts[2]]
            const amounts = [10]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowPayment.address)

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers)
            const conditionLockId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockPaymentCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowPayment.hashValues(
                did,
                amounts,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId)

            const escrowConditionId = await escrowPayment.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                escrowConditionId,
                escrowPayment.address)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockPaymentCondition.address,
                totalAmount,
                { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts, receivers)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            const result = await escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(escrowConditionId)).toNumber(),
                constants.condition.state.fulfilled
            )

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(escrowConditionId)
            expect(eventArgs._receivers[0]).to.equal(receivers[0])
            expect(eventArgs._amounts[0].toNumber()).to.equal(amounts[0])

            assert.strictEqual(await getBalance(token, escrowPayment.address), 0)
            assert.strictEqual(await getBalance(token, receivers[0]), totalAmount)

            const conditionLockId2 = await lockPaymentCondition.generateId(agreementId, await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers2))

            await conditionStoreManager.createCondition(
                conditionLockId2,
                lockPaymentCondition.address)

            const lockConditionId2 = conditionLockId2
            const releaseConditionId2 = conditionLockId2

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockPaymentCondition.address,
                totalAmount,
                { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts, receivers2)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            const escrowConditionId2 = await escrowPayment.generateId(agreementId, await escrowPayment.hashValues(
                did,
                amounts,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId2))

            await conditionStoreManager.createCondition(
                escrowConditionId2,
                escrowPayment.address)

            await escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId2)
            assert.strictEqual(await getBalance(token, escrowPayment.address), 0)
            assert.strictEqual(await getBalance(token, receivers[0]), totalAmount*2)
        })
    })

})
