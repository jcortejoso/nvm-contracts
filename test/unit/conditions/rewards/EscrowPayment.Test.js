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
const getBalance = require('../../../helpers/getBalance.js')
const testUtils = require('../../../helpers/utils.js')

contract('EscrowPaymentCondition constructor', (accounts) => {
    let epochLibrary
    let conditionStoreManager
    let token
    let lockPaymentCondition
    let escrowPayment
    const createRole = accounts[0]
    const owner = accounts[9]
    const deployer = accounts[8]

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest({
        conditionId = testUtils.generateId(),
        conditionType = testUtils.generateId()
    } = {}) {
        if (!escrowPayment) {
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

            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            const didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)

            token = await NeverminedToken.new()
            await token.initialize(owner, owner)

            lockPaymentCondition = await LockPaymentCondition.new()
            await lockPaymentCondition.initialize(
                owner,
                conditionStoreManager.address,
                token.address,
                didRegistry.address,
                { from: deployer }
            )

            escrowPayment = await EscrowPaymentCondition.new()
            await escrowPayment.initialize(
                owner,
                conditionStoreManager.address,
                token.address,
                { from: deployer }
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

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const lockConditionId = accounts[2]
            const releaseConditionId = accounts[3]
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]

            await assert.isRejected(
                escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    sender,
                    lockConditionId,
                    releaseConditionId),
                constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for account address', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowPayment.address)

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, amounts, receivers)
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

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, amounts, receivers)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            const result = await escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
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

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(escrowPayment.address, totalAmount, { from: sender })
            await token.transfer(escrowPayment.address, totalAmount, { from: sender })

            assert.strictEqual(await getBalance(token, escrowPayment.address), totalAmount)
            await assert.isRejected(
                escrowPayment.fulfill(agreementId, did, amounts, receivers, escrowPayment.address, lockConditionId, releaseConditionId),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('should not fulfill in case of null addresses', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [constants.address.zero]
            const amounts = [10]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowPayment.address)

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, amounts, receivers)
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
                sender,
                lockConditionId,
                releaseConditionId)
            const conditionId = await escrowPayment.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowPayment.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowPayment.address)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockPaymentCondition.address,
                totalAmount,
                { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, amounts, receivers)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            await assert.isRejected(
                escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    lockConditionId,
                    releaseConditionId
                ),
                'Null address is impossible to fulfill'
            )
        })
        it('should not fulfill if the receiver address is Escrow contract address', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [escrowPayment.address]
            const amounts = [10]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowPayment.address)

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, amounts, receivers)
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
                sender,
                lockConditionId,
                releaseConditionId)
            const conditionId = await escrowPayment.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowPayment.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowPayment.address)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockPaymentCondition.address,
                totalAmount,
                { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, amounts, receivers)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            await assert.isRejected(
                escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    lockConditionId,
                    releaseConditionId
                ),
                'Escrow contract can not be a receiver'
            )
        })
    })

    describe('only fulfill conditions once', () => {
        it('do not allow rewards to be fulfilled twice', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const attacker = [accounts[2]]
            const receivers = [escrowPayment.address]
            const amounts = [10]
            const totalAmount = amounts[0]

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, amounts, receivers)
            const conditionLockId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockPaymentCondition.address)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowPayment.address)

            /* simulate a real environment by giving the EscrowReward contract a bunch of tokens: */
            await token.mint(escrowPayment.address, 100, { from: owner })

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            /* fulfill the lock condition */

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockPaymentCondition.address,
                totalAmount,
                { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, amounts, receivers)

            const escrowPaymentBalance = 110

            /* attacker creates escrowPaymentBalance/amount bogus conditions to claim the locked reward: */

            for (let i = 0; i < escrowPaymentBalance / amounts; ++i) {
                let agreementId = (3 + i).toString(16)
                while (agreementId.length < 32 * 2) {
                    agreementId = '0' + agreementId
                }
                const attackerAgreementId = '0x' + agreementId
                const attackerHashValues = await escrowPayment.hashValues(
                    did,
                    amounts,
                    attacker,
                    attacker[0],
                    lockConditionId,
                    releaseConditionId)
                const attackerConditionId = await escrowPayment.generateId(attackerAgreementId, attackerHashValues)

                await conditionStoreManager.createCondition(
                    attackerConditionId,
                    escrowPayment.address)

                /* attacker tries to claim the escrow before the legitimate users: */
                await assert.isRejected(
                    escrowPayment.fulfill(
                        attackerAgreementId,
                        did,
                        amounts,
                        attacker,
                        attacker[0],
                        lockConditionId,
                        releaseConditionId),
                    constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
                )
            }

            /* make sure the EscrowReward contract didn't get drained */
            assert.notStrictEqual(
                (await token.balanceOf(escrowPayment.address)).toNumber(),
                0
            )
        })
    })
})
