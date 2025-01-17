/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const AccessTemplate = artifacts.require('AccessTemplate')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const { getBalance } = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.js')
const testUtils = require('../../helpers/utils')

contract('Access Template integration test', (accounts) => {
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        accessTemplate,
        accessCondition,
        lockPaymentCondition,
        escrowPaymentCondition

    const web3 = global.web3

    async function setupTest({
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        ({
            token,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ));

        ({
            accessCondition,
            lockPaymentCondition,
            escrowPaymentCondition
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))

        accessTemplate = await AccessTemplate.new()
        await accessTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            accessCondition.address,
            lockPaymentCondition.address,
            escrowPaymentCondition.address,
            { from: deployer }
        )

        // propose and approve template
        const templateId = accessTemplate.address
        await templateStoreManager.proposeTemplate(templateId)
        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            templateId,
            owner
        }
    }

    async function prepareEscrowAgreementMultipleEscrow({
        agreementId = testUtils.generateId(),
        sender = accounts[0],
        receivers = [accounts[2], accounts[3]],
        escrowAmounts = [11, 4],
        timeLockAccess = 0,
        timeOutAccess = 0,
        didSeed = testUtils.generateId(),
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        const did = await didRegistry.hashDID(didSeed, receivers[0])
        // generate IDs from attributes
        const conditionIdLock = await lockPaymentCondition.generateId(agreementId,
            await lockPaymentCondition.hashValues(did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers))
        const conditionIdAccess = await accessCondition.generateId(agreementId,
            await accessCondition.hashValues(did, receivers[0]))
        const conditionIdEscrow = await escrowPaymentCondition.generateId(agreementId,
            await escrowPaymentCondition.hashValues(did, escrowAmounts, receivers, escrowPaymentCondition.address, token.address, conditionIdLock, conditionIdAccess))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdAccess,
                conditionIdLock,
                conditionIdEscrow
            ],
            timeLocks: [timeLockAccess, 0, 0],
            timeOuts: [timeOutAccess, 0, 0],
            consumer: sender
        }
        return {
            agreementId,
            did,
            didSeed,
            agreement,
            sender,
            receivers,
            escrowAmounts,
            timeLockAccess,
            timeOutAccess,
            checksum,
            url
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill with multiple reward addresses', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url } = await prepareEscrowAgreementMultipleEscrow()
            const totalAmount = escrowAmounts[0] + escrowAmounts[1]
            const receiver = receivers[0]
            // register DID
            await didRegistry.registerAttribute(didSeed, checksum, [], url, { from: receiver })

            // create agreement
            await accessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(did)

            const conditionTypes = await accessTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fill up wallet
            await token.mint(sender, totalAmount, { from: owner })

            assert.strictEqual(await getBalance(token, sender), totalAmount)
            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, receiver), 0)

            // fulfill lock reward
            await token.approve(lockPaymentCondition.address, totalAmount, { from: sender })
            await lockPaymentCondition.fulfill(agreementId, did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers, { from: sender })

            assert.strictEqual(await getBalance(token, sender), 0)
            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPaymentCondition.address), totalAmount)
            assert.strictEqual(await getBalance(token, receiver), 0)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // get reward
            await escrowPaymentCondition.fulfill(agreementId, did, escrowAmounts, receivers, escrowPaymentCondition.address, token.address, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )

            assert.strictEqual(await getBalance(token, sender), 0)
            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, receivers[0]), escrowAmounts[0])
            assert.strictEqual(await getBalance(token, receivers[1]), escrowAmounts[1])
        })

        it('should create escrow agreement and abort after timeout', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url, timeOutAccess } = await prepareEscrowAgreementMultipleEscrow({ timeOutAccess: 10 })
            const totalAmount = escrowAmounts[0] + escrowAmounts[1]
            const receiver = receivers[0]

            // register DID
            await didRegistry.registerAttribute(didSeed, checksum, [], url, { from: receiver })

            // create agreement
            await accessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // fill up wallet
            await token.mint(sender, totalAmount, { from: owner })

            // fulfill lock reward
            await token.approve(lockPaymentCondition.address, totalAmount, { from: sender })
            await lockPaymentCondition.fulfill(agreementId, did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers, { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // No update since access is not fulfilled yet
            // refund
            await assert.isRejected(
                escrowPaymentCondition.fulfill(agreementId, did, escrowAmounts, receivers, escrowPaymentCondition.address, token.address, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
            )

            // wait: for time out
            await increaseTime.mineBlocks(web3, timeOutAccess)

            // abort: fulfill access after timeout
            await accessCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.aborted)

            // refund
            await escrowPaymentCondition.fulfill(agreementId, did, escrowAmounts, receivers, escrowPaymentCondition.address, token.address, agreement.conditionIds[1], agreement.conditionIds[0], { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(await getBalance(token, receivers[0]), 0)
            assert.strictEqual(await getBalance(token, receivers[1]), 0)
            assert.strictEqual(await getBalance(token, escrowPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, sender), totalAmount)
        })
    })

    describe('create and fulfill escrow agreement with access secret store and timeLock', () => {
        it('should create escrow agreement and fulfill', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url, timeLockAccess } = await prepareEscrowAgreementMultipleEscrow({ timeLockAccess: 10 })
            const totalAmount = escrowAmounts[0] + escrowAmounts[1]
            const receiver = receivers[0]

            // register DID
            await didRegistry.registerAttribute(didSeed, checksum, [], url, { from: receiver })
            // fill up wallet
            await token.mint(sender, totalAmount, { from: owner })

            // create agreement
            await accessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // fulfill lock reward
            await token.approve(lockPaymentCondition.address, totalAmount, { from: sender })
            await lockPaymentCondition.fulfill(agreementId, did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers, { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)
            // receiver is a DID owner

            // fail: fulfill access before time lock
            await assert.isRejected(
                accessCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver }),
                constants.condition.epoch.error.isTimeLocked
            )
            // receiver is a DID owner
            // expect(await accessCondition.checkPermissions(receiver, agreement.did)).to.equal(false)

            // wait: for time lock
            await increaseTime.mineBlocks(web3, timeLockAccess)

            // execute: fulfill access after time lock
            await accessCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)
            expect(await accessCondition.checkPermissions(receiver, agreement.did)).to.equal(true)

            // execute payment
            await escrowPaymentCondition.fulfill(
                agreementId,
                agreement.did,
                escrowAmounts,
                receivers,
                escrowPaymentCondition.address,
                token.address,
                agreement.conditionIds[1],
                agreement.conditionIds[0],
                { from: receiver }
            )
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(await getBalance(token, sender), 0)
            assert.strictEqual(await getBalance(token, receiver), escrowAmounts[0])
        })

        describe('drain escrow reward', () => {
            it('should create escrow agreement and fulfill', async () => {
                const { owner } = await setupTest()

                // prepare: escrow agreement
                const { agreementId, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url } = await prepareEscrowAgreementMultipleEscrow()
                const totalAmount = escrowAmounts[0] + escrowAmounts[1]
                const receiver = receivers[0]

                // register DID
                await didRegistry.registerAttribute(didSeed, checksum, [], url, { from: receiver })

                // create agreement
                await accessTemplate.createAgreement(agreementId, ...Object.values(agreement))

                const { agreementId: agreementId2, agreement: agreement2 } = await prepareEscrowAgreementMultipleEscrow(
                    { agreementId: constants.bytes32.two, didSeed: didSeed }
                )
                const agreement2Amounts = [escrowAmounts[0] * 2, escrowAmounts[1]]
                agreement2.conditionIds[2] = await escrowPaymentCondition.generateId(
                    agreementId2,
                    await escrowPaymentCondition.hashValues(
                        agreement2.did,
                        agreement2Amounts,
                        receivers,
                        escrowPaymentCondition.address,
                        token.address,
                        agreement2.conditionIds[1],
                        agreement2.conditionIds[0]))

                // create agreement2
                await accessTemplate.createAgreement(agreementId2, ...Object.values(agreement2))

                // fill up wallet
                await token.mint(sender, totalAmount * 2, { from: owner })

                // fulfill lock reward
                await token.approve(lockPaymentCondition.address, totalAmount, { from: sender })
                await lockPaymentCondition.fulfill(agreementId, did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers, { from: sender })

                await token.approve(lockPaymentCondition.address, totalAmount * 2, { from: sender })
                await lockPaymentCondition.fulfill(agreementId2, did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers, { from: sender })
                // fulfill access
                await accessCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
                await accessCondition.fulfill(agreementId2, agreement2.did, receiver, { from: receiver })

                // get reward
                await assert.isRejected(
                    escrowPaymentCondition.fulfill(agreementId2, agreement2.did, agreement2Amounts, receivers, token.address, agreement2.conditionIds[1], agreement2.conditionIds[0], { from: receiver })
                )

                assert.strictEqual(
                    (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                    constants.condition.state.unfulfilled
                )

                await escrowPaymentCondition.fulfill(agreementId, agreement.did, escrowAmounts, receivers, escrowPaymentCondition.address, token.address, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
                assert.strictEqual(
                    (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                    constants.condition.state.fulfilled
                )

                assert.strictEqual(await getBalance(token, sender), 0)
                assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
                assert.strictEqual(await getBalance(token, receivers[0]), escrowAmounts[0])
            })
        })
    })
})
