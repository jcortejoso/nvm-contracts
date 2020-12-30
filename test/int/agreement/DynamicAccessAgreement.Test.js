/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DynamicAccessTemplate = artifacts.require('DynamicAccessTemplate')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const NftHolderCondition = artifacts.require('NftHolderCondition')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const getBalance = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.ts')

contract('Dynamic Access Template integration test', (accounts) => {
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        dynamicAccessTemplate,
        accessSecretStoreCondition,
        nftHolderCondition,
        escrowReward

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
            accessSecretStoreCondition,
            nftHolderCondition,
            escrowReward
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))

        dynamicAccessTemplate = await DynamicAccessTemplate.new()
        await dynamicAccessTemplate.methods['initialize(address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        accessSecretStoreCondition = await AccessSecretStoreCondition.new()

        await accessSecretStoreCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: owner }
        )

        nftHolderCondition = await NftHolderCondition.new()
        await nftHolderCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        // propose and approve template
        const templateId = dynamicAccessTemplate.address
        await templateStoreManager.proposeTemplate(templateId)
        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            templateId,
            owner
        }
    }

    async function prepareAgreement({
        agreementId = constants.bytes32.one,
        holder = accounts[0],
        receiver = accounts[1],
        nftAmount = 1,
        timeLockAccess = 0,
        timeOutAccess = 0,
        did = constants.did[0],
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes
        const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, await accessSecretStoreCondition.hashValues(did, receiver))
        const conditionIdNft = await nftHolderCondition.generateId(agreementId, await nftHolderCondition.hashValues(did, holder, nftAmount))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdAccess,
                conditionIdNft
            ],
            timeLocks: [timeLockAccess, 0],
            timeOuts: [timeOutAccess, 0],
            consumer: receiver
        }
        return {
            agreementId,
            agreement,
            holder,
            receiver,
            nftAmount,
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
            const { agreementId, agreement, holder, receiver, nftAmount, checksum, url } = await prepareAgreement()

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })

            // Mint and Transfer
            await didRegistry.mint(agreement.did, 10, { from: receiver })
            await didRegistry.safeTransferFrom(
                receiver, holder, BigInt(agreement.did), 10, '0x', { from: receiver })

            // Conditions need to be added to the template
            await assert.isRejected(
                dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                'Arguments have wrong length'
            )

            await dynamicAccessTemplate.addTemplateCondition(accessSecretStoreCondition.address, { from: owner })
            await dynamicAccessTemplate.addTemplateCondition(nftHolderCondition.address, { from: owner })
            const templateConditionTypes = await dynamicAccessTemplate.getConditionTypes()
            assert.strictEqual(2, templateConditionTypes.length)

            // create agreement
            await dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(constants.did[0])

            const conditionTypes = await dynamicAccessTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fulfill nft condition
            const result = await nftHolderCondition.fulfill(agreementId, agreement.did, holder, nftAmount)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

        })
//
//        it('should create escrow agreement and abort after timeout', async () => {
//            const { owner } = await setupTest()
//
//            // prepare: escrow agreement
//            const { agreementId, agreement, holder, receiver, nftAmount, timeOutAccess, checksum, url } = await prepareAgreement({ timeOutAccess: 10 })
//
//            // register DID
//            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })
//
//            // create agreement
//            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))
//
//            // fill up wallet
//            await token.mint(holder, nftAmount, { from: owner })
//
//            // fulfill lock reward
//            await token.approve(lockRewardCondition.address, nftAmount, { from: holder })
//            await lockRewardCondition.fulfill(agreementId, escrowReward.address, nftAmount, { from: holder })
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
//                constants.condition.state.fulfilled)
//
//            // No update since access is not fulfilled yet
//            // refund
//            const result = await escrowReward.fulfill(agreementId, nftAmount, receiver, holder, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
//                constants.condition.state.unfulfilled
//            )
//            assert.strictEqual(result.logs.length, 0)
//
//            // wait: for time out
//            await increaseTime.mineBlocks(timeOutAccess)
//
//            // abort: fulfill access after timeout
//            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
//                constants.condition.state.aborted)
//
//            // refund
//            await escrowReward.fulfill(agreementId, nftAmount, receiver, holder, agreement.conditionIds[1], agreement.conditionIds[0], { from: holder })
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
//                constants.condition.state.fulfilled
//            )
//            assert.strictEqual(await getBalance(token, receiver), 0)
//            assert.strictEqual(await getBalance(token, holder), nftAmount)
//        })
    })

//    describe('create and fulfill escrow agreement with access secret store and timeLock', () => {
//        it('should create escrow agreement and fulfill', async () => {
//            const { owner } = await setupTest()
//
//            // prepare: escrow agreement
//            const { agreementId, agreement, holder, receiver, nftAmount, timeLockAccess, checksum, url } = await prepareAgreement({ timeLockAccess: 10 })
//
//            // register DID
//            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })
//            // fill up wallet
//            await token.mint(holder, nftAmount, { from: owner })
//
//            // create agreement
//            await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))
//
//            // fulfill lock reward
//            await token.approve(lockRewardCondition.address, nftAmount, { from: holder })
//            await lockRewardCondition.fulfill(agreementId, escrowReward.address, nftAmount, { from: holder })
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
//                constants.condition.state.fulfilled)
//            // receiver is a DID owner
//            // expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(false)
//
//            // fail: fulfill access before time lock
//            await assert.isRejected(
//                accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver }),
//                constants.condition.epoch.error.isTimeLocked
//            )
//            // receiver is a DID owner
//            // expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(false)
//
//            // wait: for time lock
//            await increaseTime.mineBlocks(timeLockAccess)
//
//            // execute: fulfill access after time lock
//            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
//                constants.condition.state.fulfilled)
//            expect(await accessSecretStoreCondition.checkPermissions(receiver, agreement.did)).to.equal(true)
//
//            // execute payment
//            await escrowReward.fulfill(
//                agreementId,
//                nftAmount,
//                receiver,
//                holder,
//                agreement.conditionIds[1],
//                agreement.conditionIds[0],
//                { from: receiver }
//            )
//            assert.strictEqual(
//                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
//                constants.condition.state.fulfilled
//            )
//            assert.strictEqual(await getBalance(token, holder), 0)
//            assert.strictEqual(await getBalance(token, receiver), nftAmount)
//        })
//
//        describe('drain escrow reward', () => {
//            it('should create escrow agreement and fulfill', async () => {
//                const { owner } = await setupTest()
//
//                // prepare: escrow agreement
//                const { agreementId, agreement, holder, receiver, nftAmount, checksum, url } = await prepareAgreement()
//
//                // register DID
//                await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })
//
//                // create agreement
//                await escrowAccessSecretStoreTemplate.createAgreement(agreementId, ...Object.values(agreement))
//
//                const { agreementId: agreementId2, agreement: agreement2 } = await prepareAgreement(
//                    { agreementId: constants.bytes32.two }
//                )
//                agreement2.conditionIds[2] = await escrowReward.generateId(
//                    agreementId2,
//                    await escrowReward.hashValues(
//                        nftAmount * 2,
//                        receiver,
//                        holder,
//                        agreement2.conditionIds[1],
//                        agreement2.conditionIds[0]))
//
//                // create agreement2
//                await escrowAccessSecretStoreTemplate.createAgreement(agreementId2, ...Object.values(agreement2))
//
//                // fill up wallet
//                await token.mint(holder, nftAmount * 2, { from: owner })
//
//                // fulfill lock reward
//                await token.approve(lockRewardCondition.address, nftAmount, { from: holder })
//                await lockRewardCondition.fulfill(agreementId, escrowReward.address, nftAmount, { from: holder })
//
//                await token.approve(lockRewardCondition.address, nftAmount, { from: holder })
//                await lockRewardCondition.fulfill(agreementId2, escrowReward.address, nftAmount, { from: holder })
//                // fulfill access
//                await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })
//                await accessSecretStoreCondition.fulfill(agreementId2, agreement2.did, receiver, { from: receiver })
//
//                // get reward
//                await assert.isRejected(
//                    escrowReward.fulfill(agreementId2, nftAmount * 2, receiver, holder, agreement2.conditionIds[1], agreement2.conditionIds[0], { from: receiver }),
//                    constants.condition.reward.escrowReward.error.lockConditionIdDoesNotMatch
//                )
//
//                assert.strictEqual(
//                    (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
//                    constants.condition.state.unfulfilled
//                )
//
//                await escrowReward.fulfill(agreementId, nftAmount, receiver, holder, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
//                assert.strictEqual(
//                    (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
//                    constants.condition.state.fulfilled
//                )
//
//                assert.strictEqual(await getBalance(token, holder), 0)
//                assert.strictEqual(await getBalance(token, lockRewardCondition.address), 0)
//                assert.strictEqual(await getBalance(token, escrowReward.address), nftAmount)
//                assert.strictEqual(await getBalance(token, receiver), nftAmount)
//            })
//        })
//    })
})
