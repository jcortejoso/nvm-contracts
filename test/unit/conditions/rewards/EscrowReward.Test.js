/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const NeverminedToken = artifacts.require('NeverminedToken')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../../helpers/constants.js')
const getBalance = require('../../../helpers/getBalance.js')
const testUtils = require('../../../helpers/utils.js')

contract('EscrowReward constructor', (accounts) => {
    let epochLibrary
    let conditionStoreManager
    let token
    let lockRewardCondition
    let escrowReward
    const createRole = accounts[0]
    const owner = accounts[1]

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest({
        conditionId = testUtils.generateId(),
        conditionType = testUtils.generateId()
    } = {}) {
        if (!escrowReward) {
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

            token = await NeverminedToken.new()
            await token.initialize(owner, owner)

            lockRewardCondition = await LockRewardCondition.new()
            await lockRewardCondition.initialize(
                owner,
                conditionStoreManager.address,
                token.address,
                { from: owner }
            )

            escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                owner,
                conditionStoreManager.address,
                token.address,
                { from: createRole }
            )
        }

        return {
            escrowReward,
            lockRewardCondition,
            token,
            conditionStoreManager,
            conditionId,
            conditionType,
            createRole,
            owner
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new()
            const token = await NeverminedToken.new()

            const escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                accounts[0],
                conditionStoreManager.address,
                token.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            const agreementId = testUtils.generateId()
            const lockConditionId = accounts[2]
            const releaseConditionId = accounts[3]
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]

            await assert.isRejected(
                escrowReward.fulfill(
                    agreementId,
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
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]
            const totalAmount = amounts[0]

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, totalAmount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowReward.hashValues(
                amounts,
                receivers,
                sender,
                lockConditionId,
                releaseConditionId)

            const conditionId = await escrowReward.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                constants.bytes32.one,
                escrowReward.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowReward.address)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockRewardCondition.address,
                totalAmount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, totalAmount)

            assert.strictEqual(await getBalance(token, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowReward.address), totalAmount)

            const result = await escrowReward.fulfill(
                agreementId,
                amounts,
                receivers,
                sender,
                lockConditionId,
                releaseConditionId)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )

            testUtils.assertEmitted(result, 1, 'Fulfilled')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._conditionId).to.equal(conditionId)
            expect(eventArgs._receivers[0]).to.equal(receivers[0])
            expect(eventArgs._amounts[0].toNumber()).to.equal(amounts[0])

            assert.strictEqual(await getBalance(token, escrowReward.address), 0)
            assert.strictEqual(await getBalance(token, receivers[0]), totalAmount)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(escrowReward.address, totalAmount, { from: sender })
            await token.transfer(escrowReward.address, totalAmount, { from: sender })

            assert.strictEqual(await getBalance(token, escrowReward.address), totalAmount)
            await assert.isRejected(
                escrowReward.fulfill(agreementId, amounts, receivers, sender, lockConditionId, releaseConditionId),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('should not fulfill in case of null addresses', async () => {
            const agreementId = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [constants.address.zero]
            const amounts = [10]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowReward.address)

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, totalAmount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowReward.hashValues(
                amounts,
                receivers,
                sender,
                lockConditionId,
                releaseConditionId)
            const conditionId = await escrowReward.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowReward.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowReward.address)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockRewardCondition.address,
                totalAmount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, totalAmount)

            assert.strictEqual(await getBalance(token, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowReward.address), balanceBefore + totalAmount)

            await assert.isRejected(
                escrowReward.fulfill(
                    agreementId,
                    amounts,
                    receivers,
                    sender,
                    lockConditionId,
                    releaseConditionId
                ),
                'Null address is impossible to fulfill'
            )
        })
        it('should not fulfill if the receiver address is Escrow contract address', async () => {
            const agreementId = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [escrowReward.address]
            const amounts = [10]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowReward.address)

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, totalAmount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowReward.hashValues(
                amounts,
                receivers,
                sender,
                lockConditionId,
                releaseConditionId)
            const conditionId = await escrowReward.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowReward.address)

            await conditionStoreManager.createCondition(
                conditionId,
                escrowReward.address)

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockRewardCondition.address,
                totalAmount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, totalAmount)

            assert.strictEqual(await getBalance(token, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowReward.address), balanceBefore + totalAmount)

            await assert.isRejected(
                escrowReward.fulfill(
                    agreementId,
                    amounts,
                    receivers,
                    sender,
                    lockConditionId,
                    releaseConditionId
                ),
                'EscrowReward contract can not be a receiver'
            )
        })
    })

    describe('only fulfill conditions once', () => {
        it('do not allow rewards to be fulfilled twice', async () => {
            const agreementId = testUtils.generateId()
            const sender = accounts[0]
            const attacker = [accounts[2]]
            const amounts = [10]
            const totalAmount = amounts[0]

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, totalAmount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowReward.address)

            /* simulate a real environment by giving the EscrowReward contract a bunch of tokens: */
            await token.mint(escrowReward.address, 100, { from: owner })

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            /* fulfill the lock condition */

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockRewardCondition.address,
                totalAmount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, totalAmount)

            const escrowRewardBalance = 110

            /* attacker creates escrowRewardBalance/amount bogus conditions to claim the locked reward: */

            for (let i = 0; i < escrowRewardBalance / amounts; ++i) {
                let agreementId = (3 + i).toString(16)
                while (agreementId.length < 32 * 2) {
                    agreementId = '0' + agreementId
                }
                const attackerAgreementId = '0x' + agreementId
                const attackerHashValues = await escrowReward.hashValues(
                    amounts,
                    attacker,
                    attacker[0],
                    lockConditionId,
                    releaseConditionId)
                const attackerConditionId = await escrowReward.generateId(attackerAgreementId, attackerHashValues)

                await conditionStoreManager.createCondition(
                    attackerConditionId,
                    escrowReward.address)

                /* attacker tries to claim the escrow before the legitimate users: */
                await assert.isRejected(
                    escrowReward.fulfill(
                        attackerAgreementId,
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
                (await token.balanceOf(escrowReward.address)).toNumber(),
                0
            )
        })
    })
})
