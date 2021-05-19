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

contract('EscrowPaymentCondition constructor', (accounts) => {
    let epochLibrary
    let conditionStoreManager
    let token
    let lockPaymentCondition
    let escrowPayment
    let didRegistry
    let didRegistryLibrary

    const createRole = accounts[0]
    const owner = accounts[9]
    const deployer = accounts[8]
    const checksum = testUtils.generateId()
    const url = 'https://nevermined.io/did/test-attr-example.txt'

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

            didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)

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

    describe('init failure', () => {
        it('needed contract addresses cannot be 0', async () => {
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

            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            const didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)

            const token = await NeverminedToken.new()
            await token.initialize(owner, owner)

            const lockPaymentCondition = await LockPaymentCondition.new()
            await lockPaymentCondition.initialize(
                owner,
                conditionStoreManager.address,
                didRegistry.address,
                { from: deployer }
            )

            const escrowPayment = await EscrowPaymentCondition.new()
            await assert.isRejected(escrowPayment.initialize(
                owner,
                '0x0000000000000000000000000000000000000000',
                { from: deployer }
            ), undefined)
        })
    })

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
                    token.address,
                    lockConditionId,
                    releaseConditionId),
                constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('ERC20: should fulfill if conditions exist for account address', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
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

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(escrowPayment.address, totalAmount, { from: sender })
            await token.transfer(escrowPayment.address, totalAmount, { from: sender })

            assert.strictEqual(await getBalance(token, escrowPayment.address), totalAmount)
            await assert.isRejected(
                escrowPayment.fulfill(agreementId, did, amounts, receivers, escrowPayment.address, token.address, lockConditionId, releaseConditionId),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('ETH: should fulfill if conditions exist for account address', async () => {
            const sender = accounts[0]
            const agreementId = testUtils.generateId()
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])
            const totalAmount = 500000000000
            const amounts = [totalAmount]
            const receivers = [accounts[1]]

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amounts[0], 0, constants.activities.GENERATED, '')

            const hashValuesLock = await lockPaymentCondition.hashValues(
                did, escrowPayment.address, constants.address.zero, amounts, receivers)
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
                constants.address.zero,
                lockConditionId,
                releaseConditionId)

            const escrowConditionId = await escrowPayment.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                escrowConditionId,
                escrowPayment.address)

            const balanceSenderBefore = await getETHBalance(sender)
            const balanceContractBefore = await getETHBalance(escrowPayment.address)
            const balanceReceiverBefore = await getETHBalance(receivers[0])

            //            console.log('Balance Sender Before: ' + balanceSenderBefore)
            //            console.log('Balance Contract Before: ' + balanceContractBefore)
            //            console.log('Balance Receiver Before: ' + balanceReceiverBefore)

            assert.isAtLeast(balanceSenderBefore, totalAmount)

            await lockPaymentCondition.fulfill(
                agreementId, did, escrowPayment.address, constants.address.zero, amounts, receivers,
                { from: sender, value: totalAmount })

            const balanceSenderAfterLock = await getETHBalance(sender)
            const balanceContractAfterLock = await getETHBalance(escrowPayment.address)
            // const balanceReceiverAfterLock = await getETHBalance(receivers[0])

            // console.log('Balance Sender Lock: ' + balanceSenderAfterLock)
            // console.log('Balance Contract Lock: ' + balanceContractAfterLock)
            // console.log('Balance Receiver Lock: ' + balanceReceiverAfterLock)

            assert.isAtMost(balanceSenderAfterLock, balanceSenderBefore - totalAmount)
            assert.isAtLeast(balanceContractAfterLock, balanceContractBefore + totalAmount)

            const result = await escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
                constants.address.zero,
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

            const balanceSenderAfterEscrow = await getETHBalance(sender)
            const balanceContractAfterEscrow = await getETHBalance(escrowPayment.address)
            const balanceReceiverAfterEscrow = await getETHBalance(receivers[0])

            // console.log('Balance Sender Escrow: ' + balanceSenderAfterEscrow)
            // console.log('Balance Contract Escrow: ' + balanceContractAfterEscrow)
            // console.log('Balance Receiver Escrow: ' + balanceReceiverAfterEscrow)

            assert.isAtMost(balanceSenderAfterEscrow, balanceSenderBefore - totalAmount)
            assert.isAtMost(balanceContractAfterEscrow, balanceContractBefore)
            assert.isAtLeast(balanceReceiverAfterEscrow, balanceReceiverBefore + totalAmount)
            await assert.isRejected(
                escrowPayment.fulfill(agreementId, did, amounts, receivers, escrowPayment.address, constants.address.zero, lockConditionId, releaseConditionId),
                undefined
            )
        })

        it('ETH: fail if escrow is receiver', async () => {
            const agreementId = testUtils.generateId()
            const didSeed = testUtils.generateId()
            const did = await didRegistry.hashDID(didSeed, accounts[0])
            const totalAmount = 500000000000
            const sender = accounts[0]
            const amounts = [totalAmount]
            const receivers = [escrowPayment.address]

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, amounts[0], 0, constants.activities.GENERATED, '')

            const hashValuesLock = await lockPaymentCondition.hashValues(
                did, escrowPayment.address, constants.address.zero, amounts, receivers)
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
                constants.address.zero,
                lockConditionId,
                releaseConditionId)

            const escrowConditionId = await escrowPayment.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                escrowConditionId,
                escrowPayment.address)

            const balanceSenderBefore = await getETHBalance(sender)
            const balanceContractBefore = await getETHBalance(escrowPayment.address)

            assert.isAtLeast(balanceSenderBefore, totalAmount)

            await lockPaymentCondition.fulfill(
                agreementId, did, escrowPayment.address, constants.address.zero, amounts, receivers,
                { from: sender, value: totalAmount })

            const balanceSenderAfterLock = await getETHBalance(sender)
            const balanceContractAfterLock = await getETHBalance(escrowPayment.address)

            assert.isAtMost(balanceSenderAfterLock, balanceSenderBefore - totalAmount)
            assert.isAtLeast(balanceContractAfterLock, balanceContractBefore + totalAmount)

            await assert.isRejected(
                escrowPayment.fulfill(agreementId, did, amounts, receivers, escrowPayment.address, constants.address.zero, lockConditionId, releaseConditionId),
                undefined
            )
        })

        it('receiver and amount lists need to have same length', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const receivers = [accounts[1]]
            const amounts = [10]
            const amounts2 = [10, 20]

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers)
            const conditionLockId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockPaymentCondition.address)

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            await assert.isRejected(escrowPayment.hashValues(
                did,
                amounts2,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId),
            undefined)
        })

        it('lock condition not fulfilled', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const receivers = [accounts[1]]
            const amounts = [10]

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

            await assert.isRejected(escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId),
            'LockCondition needs to be Fulfilled')
        })

        it('release condition not fulfilled', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]
            const receivers2 = [accounts[5]]
            const amounts2 = [20]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowPayment.address)

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers)
            const lockConditionId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                lockConditionId,
                lockPaymentCondition.address)

            const hashValuesLock2 = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts2, receivers2)
            const releaseConditionId = await lockPaymentCondition.generateId(agreementId, hashValuesLock2)

            await conditionStoreManager.createCondition(
                releaseConditionId,
                lockPaymentCondition.address)

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

            await escrowPayment.fulfill(
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
                constants.condition.state.unfulfilled
            )

            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)
        })

        it('ERC20: release condition aborted', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]
            const receivers2 = [accounts[5]]
            const amounts2 = [20]
            const totalAmount = amounts[0]
            const balanceBefore = await getBalance(token, escrowPayment.address)

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers)
            const lockConditionId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                lockConditionId,
                lockPaymentCondition.address)

            const hashValuesLock2 = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts2, receivers2)
            const releaseConditionId = await lockPaymentCondition.generateId(agreementId, hashValuesLock2)

            await conditionStoreManager.createCondition(
                releaseConditionId,
                lockPaymentCondition.address,
                1,
                2,
                sender
            )

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

            // abort release
            await lockPaymentCondition.abortByTimeOut(releaseConditionId)

            await escrowPayment.fulfill(
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

            assert.strictEqual(await getBalance(token, sender), totalAmount)
        })

        it('ETH: release condition aborted', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [1000000000000]
            const receivers2 = [accounts[5]]
            const amounts2 = [20]
            const totalAmount = amounts[0]

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, constants.address.zero, amounts, receivers)
            const lockConditionId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                lockConditionId,
                lockPaymentCondition.address
            )

            const hashValuesLock2 = await lockPaymentCondition.hashValues(did, escrowPayment.address, constants.address.zero, amounts2, receivers2)
            const releaseConditionId = await lockPaymentCondition.generateId(agreementId, hashValuesLock2)

            await conditionStoreManager.createCondition(
                releaseConditionId,
                lockPaymentCondition.address,
                1,
                2,
                sender
            )

            const hashValues = await escrowPayment.hashValues(
                did,
                amounts,
                receivers,
                escrowPayment.address,
                constants.address.zero,
                lockConditionId,
                releaseConditionId)

            const escrowConditionId = await escrowPayment.generateId(agreementId, hashValues)

            await conditionStoreManager.createCondition(
                escrowConditionId,
                escrowPayment.address
            )

            const balanceBefore = await getETHBalance(sender)
            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, constants.address.zero, amounts, receivers,
                { from: sender, value: totalAmount, gasPrice: 0 })

            // abort release
            await lockPaymentCondition.abortByTimeOut(releaseConditionId, { from: sender, gasPrice: 0 })

            await escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
                constants.address.zero,
                lockConditionId,
                releaseConditionId, { from: sender, gasPrice: 0 })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(escrowConditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(
                await getETHBalance(sender),
                balanceBefore
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
                sender,
                token.address,
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

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts, receivers)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            await assert.isRejected(
                escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    releaseConditionId
                ),
                'ERC20: transfer to the zero address'
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
                sender,
                token.address,
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

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts, receivers)

            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

            await assert.isRejected(
                escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    token.address,
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

            const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers)
            const conditionLockId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)

            await conditionStoreManager.createCondition(
                conditionLockId,
                lockPaymentCondition.address)

            await conditionStoreManager.createCondition(
                testUtils.generateId(),
                escrowPayment.address)

            /* simulate a real environment by giving the EscrowPayment contract a bunch of tokens: */
            await token.mint(escrowPayment.address, 100, { from: owner })

            const lockConditionId = conditionLockId
            const releaseConditionId = conditionLockId

            /* fulfill the lock condition */

            await token.mint(sender, totalAmount, { from: owner })
            await token.approve(
                lockPaymentCondition.address,
                totalAmount,
                { from: sender })

            await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts, receivers)

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
                    token.address,
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
                        token.address,
                        lockConditionId,
                        releaseConditionId),
                    constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
                )
            }

            /* make sure the EscrowPayment contract didn't get drained */
            assert.notStrictEqual(
                (await token.balanceOf(escrowPayment.address)).toNumber(),
                0
            )
        })

        it('ERC20: should bit fulfill if was already fulfilled', async () => {
            const agreementId = testUtils.generateId()
            const did = testUtils.generateId()
            const sender = accounts[0]
            const receivers = [accounts[1]]
            const amounts = [10]
            const totalAmount = amounts[0]

            const balanceContractBefore = await getBalance(token, escrowPayment.address)
            const balanceReceiverBefore = await getBalance(token, receivers[0])

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
            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceContractBefore + totalAmount)

            await escrowPayment.fulfill(
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

            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceContractBefore)
            assert.strictEqual(await getBalance(token, receivers[0]), balanceReceiverBefore + totalAmount)

            await assert.isRejected(escrowPayment.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowPayment.address,
                token.address,
                lockConditionId,
                releaseConditionId)
            )

            assert.strictEqual(await getBalance(token, escrowPayment.address), balanceContractBefore)
            assert.strictEqual(await getBalance(token, receivers[0]), balanceReceiverBefore + totalAmount)
        })
    })
})
