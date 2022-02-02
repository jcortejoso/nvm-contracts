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
const NFTMarkedLockCondition = artifacts.require('NFTMarkedLockCondition')
const NFT721MarkedLockCondition = artifacts.require('NFT721MarkedLockCondition')
const EscrowPaymentCondition = artifacts.require('MultiEscrowPaymentCondition')
const NFTEscrowPaymentCondition = artifacts.require('NFTEscrowPaymentCondition')
const NFT721EscrowPaymentCondition = artifacts.require('NFT721EscrowPaymentCondition')

const constants = require('../../../helpers/constants.js')
const { getBalance } = require('../../../helpers/getBalance.js')
const testUtils = require('../../../helpers/utils.js')

function tokenWrapper(contract) {
    contract.hashWrap = (did, escrowPaymentAddress, tokenAddress, amounts, receivers) => {
        return contract.hashValues(did, escrowPaymentAddress, tokenAddress, amounts, receivers)
    }
    contract.fulfillWrap = (agreementId, did, escrowPaymentAddress, tokenAddress, amounts, receivers) => {
        return contract.fulfill(agreementId, did, escrowPaymentAddress, tokenAddress, amounts, receivers)
    }
    return contract
}

function nftWrapper(contract) {
    contract.hashWrap = (did, escrowPaymentAddress, tokenAddress, amounts, receivers) => {
        return contract.hashValues(did, escrowPaymentAddress, amounts[0], receivers[0], tokenAddress)
    }
    contract.fulfillWrap = (agreementId, did, escrowPaymentAddress, tokenAddress, amounts, receivers) => {
        return lockPaymentCondition.fulfill(agreementId, did, escrowPaymentAddress, amounts[0], receivers[0], tokenAddress)
    }
    return contract
}

function testMultiEscrow(EscrowPaymentCondition, LockPaymentCondition, nft) {
    contract('MultiEscrowPaymentCondition contract', (accounts) => {

        const single = nft ? (a => a[0]) : (a => a)

        function tokenLockHash(lockPaymentCondition, did, escrowPaymentAddress, tokenAddress, amounts, receivers) {
            return lockPaymentCondition.hashValues(did, escrowPaymentAddress, tokenAddress, amounts, receivers)
        }
        function nftLockHash(lockPaymentCondition, did, escrowPaymentAddress, tokenAddress, amounts, receivers) {
            return lockPaymentCondition.hashValues(did, escrowPaymentAddress, amounts[0], receivers[0], tokenAddress)
        }
        const lockHash = nft ? nftLockHash : tokenLockHash

        function tokenLockFulfill(lockPaymentCondition, agreementId, did, escrowPaymentAddress, tokenAddress, amounts, receivers) {
            return lockPaymentCondition.fulfill(agreementId, did, escrowPaymentAddress, tokenAddress, amounts, receivers)
        }
        function nftLockFulfill(lockPaymentCondition, agreementId, did, escrowPaymentAddress, tokenAddress, amounts, receivers) {
            return lockPaymentCondition.fulfill(agreementId, did, escrowPaymentAddress, amounts[0], receivers[0], tokenAddress)
        }
        const lockFulfill = nft ? nftLockFulfill : tokenLockFulfill

        let conditionStoreManager
        let token
        let lockPaymentCondition
        let escrowPayment
        let didRegistry

        const createRole = accounts[0]
        const owner = accounts[9]
        const deployer = accounts[8]

        before(async () => {
            if (!nft) {
                const epochLibrary = await EpochLibrary.new()
                await ConditionStoreManager.link(epochLibrary)
                const didRegistryLibrary = await DIDRegistryLibrary.new()
                await DIDRegistry.link(didRegistryLibrary)
            }
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
                if (nft) {
                    await lockPaymentCondition.initialize(
                        owner,
                        conditionStoreManager.address,
                        { from: deployer }
                    )
                } else {
                    await lockPaymentCondition.initialize(
                        owner,
                        conditionStoreManager.address,
                        didRegistry.address,
                        { from: deployer }
                    )
                }

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

        describe('fulfill with two release conditions', () => {
            it('should fulfill if both are fulfilled', async () => {
                const agreementId = testUtils.generateId()
                const did = testUtils.generateId()
                const sender = accounts[0]
                const receivers = [accounts[1]]
                const amounts = [10]
                const receivers2 = [accounts[2]]
                const amounts2 = [12]
                const totalAmount = amounts[0] + amounts2[0]
                const balanceBefore = await getBalance(token, escrowPayment.address)

                const hashValuesLock = await lockHash(lockPaymentCondition, did, escrowPayment.address, token.address, amounts, receivers)
                const conditionLockId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)
                const hashValuesLock2 = await lockHash(lockPaymentCondition, did, escrowPayment.address, token.address, amounts2, receivers2)
                const conditionLockId2 = await lockPaymentCondition.generateId(agreementId, hashValuesLock2)

                await conditionStoreManager.createCondition(
                    conditionLockId,
                    lockPaymentCondition.address)

                await conditionStoreManager.createCondition(
                    conditionLockId2,
                    lockPaymentCondition.address)

                const lockConditionId = conditionLockId

                const hashValues = await escrowPayment.hashValues(
                    did,
                    single(amounts),
                    single(receivers),
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])

                const escrowConditionId = await escrowPayment.generateId(agreementId, hashValues)

                await conditionStoreManager.createCondition(
                    escrowConditionId,
                    escrowPayment.address)

                await token.mint(sender, totalAmount, { from: owner })
                await token.approve(
                    lockPaymentCondition.address,
                    totalAmount,
                    { from: sender })

                await assert.isRejected(escrowPayment.fulfill(
                    agreementId,
                    did,
                    single(amounts),
                    single(receivers),
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])
                )

                await lockFulfill(lockPaymentCondition, agreementId, did, escrowPayment.address, token.address, amounts, receivers)

                await assert.isRejected(escrowPayment.fulfill(
                    agreementId,
                    did,
                    single(amounts),
                    single(receivers),
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])
                )

                await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts2, receivers2)

                assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
                assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + totalAmount)

                const result = await escrowPayment.fulfill(
                    agreementId,
                    did,
                    single(amounts),
                    single(receivers),
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])

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

                assert.strictEqual(await getBalance(token, escrowPayment.address), amounts2[0])
                assert.strictEqual(await getBalance(token, receivers[0]), amounts[0])
            })

            it('should cancel if conditions were aborted', async () => {
                const agreementId = testUtils.generateId()
                const did = testUtils.generateId()
                const sender = accounts[0]
                const receivers = [accounts[1]]
                const amounts = [10]
                const receivers2 = [accounts[2]]
                const amounts2 = [12]
                const totalAmount = amounts[0] + amounts2[0]
                const balanceBefore = await getBalance(token, escrowPayment.address)
                const senderBefore = await getBalance(token, sender)
                const receiverBefore = await getBalance(token, receivers[0])

                const hashValuesLock = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts, receivers)
                const conditionLockId = await lockPaymentCondition.generateId(agreementId, hashValuesLock)
                const hashValuesLock2 = await lockPaymentCondition.hashValues(did, escrowPayment.address, token.address, amounts2, receivers2)
                const conditionLockId2 = await lockPaymentCondition.generateId(agreementId, hashValuesLock2)

                await conditionStoreManager.createCondition(
                    conditionLockId,
                    lockPaymentCondition.address)

                await conditionStoreManager.createCondition(
                    conditionLockId2,
                    lockPaymentCondition.address,
                    1,
                    2,
                    sender
                )

                const lockConditionId = conditionLockId

                const hashValues = await escrowPayment.hashValues(
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])

                const escrowConditionId = await escrowPayment.generateId(agreementId, hashValues)

                await conditionStoreManager.createCondition(
                    escrowConditionId,
                    escrowPayment.address)

                await token.mint(sender, totalAmount, { from: owner })
                await token.approve(
                    lockPaymentCondition.address,
                    totalAmount,
                    { from: sender })

                await assert.isRejected(escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])
                )

                await lockPaymentCondition.fulfill(agreementId, did, escrowPayment.address, token.address, amounts, receivers)

                await assert.isRejected(escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])
                )

                await lockPaymentCondition.abortByTimeOut(conditionLockId2)

                assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
                assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore + amounts[0])

                const result = await escrowPayment.fulfill(
                    agreementId,
                    did,
                    amounts,
                    receivers,
                    escrowPayment.address,
                    token.address,
                    lockConditionId,
                    [conditionLockId, conditionLockId2])

                assert.strictEqual(
                    (await conditionStoreManager.getConditionState(escrowConditionId)).toNumber(),
                    constants.condition.state.fulfilled
                )

                testUtils.assertEmitted(result, 1, 'Fulfilled')
                const eventArgs = testUtils.getEventArgsFromTx(result, 'Fulfilled')
                expect(eventArgs._agreementId).to.equal(agreementId)
                expect(eventArgs._conditionId).to.equal(escrowConditionId)
                expect(eventArgs._receivers[0]).to.equal(sender)
                expect(eventArgs._amounts[0].toNumber()).to.equal(amounts[0])

                assert.strictEqual(await getBalance(token, escrowPayment.address), balanceBefore)
                assert.strictEqual(await getBalance(token, receivers[0]), receiverBefore)
                assert.strictEqual(await getBalance(token, sender), senderBefore + totalAmount)
            })
        })
    })
}

testMultiEscrow(EscrowPaymentCondition, LockPaymentCondition, false)
testMultiEscrow(NFTEscrowPaymentCondition, NFTMarkedLockCondition, true)
testMultiEscrow(NFT721EscrowPaymentCondition, NFT721MarkedLockCondition, true)

