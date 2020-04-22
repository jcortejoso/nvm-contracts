/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EscrowAccessSecretStoreTemplate = artifacts.require('EscrowAccessSecretStoreTemplate')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const getBalance = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.js')

contract('Escrow Access Secret Store integration test', (accounts) => {
    let oceanToken,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        escrowAccessSecretStoreTemplate,
        accessSecretStoreCondition,
        lockRewardCondition,
        escrowReward

    async function setupTest({
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        ({
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ));

        ({
            accessSecretStoreCondition,
            lockRewardCondition,
            escrowReward
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            oceanToken
        ))

        escrowAccessSecretStoreTemplate = await EscrowAccessSecretStoreTemplate.new()
        await escrowAccessSecretStoreTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            accessSecretStoreCondition.address,
            lockRewardCondition.address,
            escrowReward.address,
            { from: deployer }
        )

        // propose and approve template
        const templateId = escrowAccessSecretStoreTemplate.address
        await templateStoreManager.proposeTemplate(templateId)
        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            templateId,
            owner
        }
    }

    async function prepareEscrowAgreement({
        agreementId = constants.bytes32.one,
        sender = accounts[0],
        receiver = accounts[1],
        escrowAmount = 10,
        timeLockAccess = 0,
        timeOutAccess = 0,
        did = constants.did[0],
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes
        const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, await accessSecretStoreCondition.hashValues(did, receiver))
        const conditionIdLock = await lockRewardCondition.generateId(agreementId, await lockRewardCondition.hashValues(escrowReward.address, escrowAmount))
        const conditionIdEscrow = await escrowReward.generateId(agreementId, await escrowReward.hashValues(escrowAmount, receiver, sender, conditionIdLock, conditionIdAccess))

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
            consumer: receiver
        }
        return {
            agreementId,
            agreement,
            sender,
            receiver,
            escrowAmount,
            timeLockAccess,
            timeOutAccess,
            checksum,
            url
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, sender, receiver, escrowAmount, checksum, url } = await prepareEscrowAgreement()

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })

            // create agreement
            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(constants.did[0])

            const conditionTypes = await escrowAccessSecretStoreTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fill up wallet
            await oceanToken.mint(sender, escrowAmount, { from: owner })

            assert.strictEqual(await getBalance(oceanToken, sender), escrowAmount)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)

            // fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount, { from: sender })

            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), escrowAmount)
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // get reward
            await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )

            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
            assert.strictEqual(await getBalance(oceanToken, escrowReward.address), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), escrowAmount)
        })

        it('should create escrow agreement and abort after timeout', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, sender, receiver, escrowAmount, timeOutAccess, checksum, url } = await prepareEscrowAgreement({ timeOutAccess: 10 })

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })

            // create agreement
            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // fill up wallet
            await oceanToken.mint(sender, escrowAmount, { from: owner })

            // fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount, { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // No update since access is not fulfilled yet
            // refund
            const result = await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.unfulfilled
            )
            assert.strictEqual(result.logs.length, 0)

            // wait: for time out
            await increaseTime(timeOutAccess)

            // abort: fulfill access after timeout
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.aborted)

            // refund
            await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0], { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(await getBalance(oceanToken, receiver), 0)
            assert.strictEqual(await getBalance(oceanToken, sender), escrowAmount)
        })
    })

    describe('create and fulfill escrow agreement with access secret store and timeLock', () => {
        it('should create escrow agreement and fulfill', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, sender, receiver, escrowAmount, timeLockAccess, checksum, url } = await prepareEscrowAgreement({ timeLockAccess: 10 })

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })
            // fill up wallet
            await oceanToken.mint(sender, escrowAmount, { from: owner })

            // create agreement
            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // fulfill lock reward
            await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount, { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)
            // receiver is a DID owner
            // expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(false)

            // fail: fulfill access before time lock
            await assert.isRejected(
                accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver }),
                constants.condition.epoch.error.isTimeLocked
            )
            // receiver is a DID owner
            // expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(false)

            // wait: for time lock
            await increaseTime(timeLockAccess)

            // execute: fulfill access after time lock
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)
            expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(true)

            // execute payment
            await escrowReward.fulfill(
                agreementId,
                escrowAmount,
                receiver,
                sender,
                agreement.conditionIds[1],
                agreement.conditionIds[0],
                { from: receiver }
            )
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled
            )
            assert.strictEqual(await getBalance(oceanToken, sender), 0)
            assert.strictEqual(await getBalance(oceanToken, receiver), escrowAmount)
        })

        describe('drain escrow reward', () => {
            it('should create escrow agreement and fulfill', async () => {
                const { owner } = await setupTest()

                // prepare: escrow agreement
                const { agreementId, agreement, sender, receiver, escrowAmount, checksum, url } = await prepareEscrowAgreement()

                // register DID
                await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })

                // create agreement
                await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))

                const { agreementId: agreementId2, agreement: agreement2 } = await prepareEscrowAgreement(
                    { agreementId: constants.bytes32.two }
                )
                agreement2.conditionIds[2] = await escrowReward.generateId(
                    agreementId2,
                    await escrowReward.hashValues(
                        escrowAmount * 2,
                        receiver,
                        sender,
                        agreement2.conditionIds[1],
                        agreement2.conditionIds[0]))

                // create agreement2
                await escrowAccessSecretStoreTemplate.createAgreement(agreementId2, ...Object.values(agreement2))

                // fill up wallet
                await oceanToken.mint(sender, escrowAmount * 2, { from: owner })

                // fulfill lock reward
                await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
                await lockRewardCondition.fulfill(agreementId, escrowReward.address, escrowAmount, { from: sender })

                await oceanToken.approve(lockRewardCondition.address, escrowAmount, { from: sender })
                await lockRewardCondition.fulfill(agreementId2, escrowReward.address, escrowAmount, { from: sender })
                // fulfill access
                await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
                await accessSecretStoreCondition.fulfill(agreementId2, agreement2.did, receiver, { from: receiver })

                // get reward
                await assert.isRejected(
                    escrowReward.fulfill(agreementId2, escrowAmount * 2, receiver, sender, agreement2.conditionIds[1], agreement2.conditionIds[0], { from: receiver }),
                    constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
                )

                assert.strictEqual(
                    (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                    constants.condition.state.unfulfilled
                )

                await escrowReward.fulfill(agreementId, escrowAmount, receiver, sender, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
                assert.strictEqual(
                    (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                    constants.condition.state.fulfilled
                )

                assert.strictEqual(await getBalance(oceanToken, sender), 0)
                assert.strictEqual(await getBalance(oceanToken, lockRewardCondition.address), 0)
                assert.strictEqual(await getBalance(oceanToken, escrowReward.address), escrowAmount)
                assert.strictEqual(await getBalance(oceanToken, receiver), escrowAmount)
            })
        })
    })
})
