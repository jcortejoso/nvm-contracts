/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const OceanToken = artifacts.require('OceanToken')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../../helpers/constants.js')
const getBalance = require('../../../helpers/getBalance.js')
const testUtils = require('../../../helpers/utils.js')

contract('EscrowReward constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        owner = accounts[1]
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: owner }
        )

        await conditionStoreManager.delegateCreateRole(
            createRole,
            { from: owner }
        )

        const oceanToken = await OceanToken.new()
        await oceanToken.initialize(owner, owner)

        const lockRewardCondition = await LockRewardCondition.new()
        await lockRewardCondition.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: owner }
        )

        const escrowReward = await EscrowReward.new()
        await escrowReward.initialize(
            owner,
            conditionStoreManager.address,
            oceanToken.address,
            { from: createRole }
        )

        return {
            escrowReward,
            lockRewardCondition,
            oceanToken,
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
            const oceanToken = await OceanToken.new()

            const escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                accounts[0],
                conditionStoreManager.address,
                oceanToken.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist', async () => {
            await setupTest()
            const { escrowReward } = await setupTest()

            const agreementId = constants.bytes32.one
            const lockConditionId = accounts[2]
            const releaseConditionId = accounts[3]
            const sender = accounts[0]
            const receiver = accounts[1]
            const amount = 10

            await assert.isRejected(
                escrowReward.fulfill(
                    agreementId,
                    amount,
                    receiver,
                    sender,
                    lockConditionId,
                    releaseConditionId),
                constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for account address', async () => {
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            const agreementId = constants.bytes32.one
            const sender = accounts[0]
            const receiver = accounts[1]
            const amount = 10

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowReward.hashValues(
                amount,
                receiver,
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

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)

            const result = await escrowReward.fulfill(
                agreementId,
                amount,
                receiver,
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
            expect(eventArgs._receiver).to.equal(receiver)
            expect(eventArgs._amount.toNumber()).to.equal(amount)

            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), amount)

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(escrowReward.address, amount, { from: sender })
            await oceanToken.transfer(escrowReward.address, amount, { from: sender })

            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)
            await assert.isRejected(
                escrowReward.fulfill(agreementId, amount, receiver, sender, lockConditionId, releaseConditionId),
                constants.condition.state.error.invalidStateTransition
            )
        })
        it('should not fulfill in case of null addresses', async () => {
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            const agreementId = constants.bytes32.one
            const sender = accounts[0]
            const receiver = constants.address.zero
            const amount = 10

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowReward.hashValues(
                amount,
                receiver,
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

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)

            await assert.isRejected(
                escrowReward.fulfill(
                    agreementId,
                    amount,
                    receiver,
                    sender,
                    lockConditionId,
                    releaseConditionId
                ),
                'Null address is impossible to fulfill'
            )
        })
        it('should not fulfill if the receiver address is Escrow contract address', async () => {
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            const agreementId = constants.bytes32.one
            const sender = accounts[0]
            const receiver = escrowReward.address
            const amount = 10

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            const hashValues = await escrowReward.hashValues(
                amount,
                receiver,
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

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), amount)

            await assert.isRejected(
                escrowReward.fulfill(
                    agreementId,
                    amount,
                    receiver,
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
            const {
                escrowReward,
                lockRewardCondition,
                oceanToken,
                conditionStoreManager,
                owner
            } = await setupTest()

            const agreementId = constants.bytes32.one
            const sender = accounts[0]
            const attacker = accounts[2]
            const amount = 10

            const hashValuesLock = await lockRewardCondition.hashValues(escrowReward.address, amount)
            const conditionLockId = await lockRewardCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockRewardCondition.address)

            await conditionStoreManager.createCondition(
                constants.bytes32.one,
                escrowReward.address)

            /* simulate a real environment by giving the EscrowReward contract a bunch of tokens: */
            await oceanToken.mint(escrowReward.address, 100, { from: owner })

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            /* fulfill the lock condition */

            await oceanToken.mint(sender, amount, { from: owner })
            await oceanToken.approve(
                lockRewardCondition.address,
                amount,
                { from: sender })

            await lockRewardCondition.fulfill(agreementId, escrowReward.address, amount)

            const escrowRewardBalance = 110

            /* attacker creates escrowRewardBalance/amount bogus conditions to claim the locked reward: */

            for (let i = 0; i < escrowRewardBalance / amount; ++i) {
                let agreementId = (3 + i).toString(16)
                while (agreementId.length < 32 * 2) {
                    agreementId = '0' + agreementId
                }
                const attackerAgreementId = '0x' + agreementId
                const attackerHashValues = await escrowReward.hashValues(
                    amount,
                    attacker,
                    attacker,
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
                        amount,
                        attacker,
                        attacker,
                        lockConditionId,
                        releaseConditionId),
                    constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
                )
            }

            /* make sure the EscrowReward contract didn't get drained */
            assert.notStrictEqual(
                (await oceanToken.balanceOf(escrowReward.address)).toNumber(),
                0
            )
        })
    })
})
