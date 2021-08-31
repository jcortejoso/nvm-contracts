/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const AccessProofTemplate = artifacts.require('AccessProofTemplate')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const { getBalance } = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.ts')
const testUtils = require('../../helpers/utils')

const poseidon = require("circomlib").poseidon
const babyJub = require("circomlib").babyJub
const mimcjs = require("circomlib").mimcsponge
const ZqField = require("ffjavascript").ZqField;
const Scalar = require("ffjavascript").Scalar;
const F = new ZqField(Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617"));
const snarkjs = require("snarkjs");

function randomBytes32() {
    let rnd = ''
    for (let i = 0; i < 64; i++) {
        rnd += (Math.floor(Math.random() * 1000) % 16).toString(16)
    }
    return '0x' + rnd
}

contract('Access Template integration test', (accounts) => {
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        accessTemplate,
        accessProofCondition,
        lockPaymentCondition,
        escrowPaymentCondition,
        disputeManager

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
            accessProofCondition,
            lockPaymentCondition,
            escrowPaymentCondition,
            disputeManager
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))

        accessTemplate = await AccessProofTemplate.new()
        await accessTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            accessProofCondition.address,
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
        const orig1 = 222n
        const orig2 = 333n
        const origHash = poseidon([orig1, orig2])

        const did = await didRegistry.hashDID(didSeed, receivers[0])

        const buyer_k = 123
        const provider_k = 234
        const buyer_pub = babyJub.mulPointEscalar(babyJub.Base8, F.e(buyer_k));
        const provider_pub = babyJub.mulPointEscalar(babyJub.Base8, F.e(provider_k));

        console.log("public keys", buyer_pub, provider_pub)

        const k = babyJub.mulPointEscalar(buyer_pub, F.e(provider_k));
        const k2 = babyJub.mulPointEscalar(provider_pub, F.e(buyer_k));

        console.log("encryption key", k)
        console.log("encryption key check", k2)

        const cipher = mimcjs.hash(orig1,orig2,k[0]);

        const snark_params = {
            buyer_x: "0x" + buyer_pub[0].toString(16),
            buyer_y: "0x" + buyer_pub[1].toString(16),
            provider_x: "0x" + provider_pub[0].toString(16),
            provider_y: "0x" + provider_pub[1].toString(16),
            provider_k: "0x" + provider_k.toString(16),
            xL_in: "0x" + orig1.toString(16),
            xR_in: "0x" + orig2.toString(16),
            cipher_xL_in: "0x" + cipher.xL.toString(16),
            cipher_xR_in: "0x" + cipher.xR.toString(16),
            hash_plain: "0x" + origHash.toString(16),
        }
/*
        const snark_params = {
            buyer_x: buyer_pub[0].toString(),
            buyer_y: buyer_pub[1].toString(),
            provider_x: provider_pub[0].toString(),
            provider_y: provider_pub[1].toString(),
            provider_k: provider_k.toString(),
            xL_in: orig1.toString(),
            xR_in: orig2.toString(),
            cipher_xL_in: cipher.xL.toString(),
            cipher_xR_in: cipher.xR.toString(),
            hash_plain: origHash.toString(),
        }
        const snark_params = {
            buyer_x: buyer_pub[0],
            buyer_y: buyer_pub[1],
            provider_x: provider_pub[0],
            provider_y: provider_pub[1],
            xL_in: orig1,
            xR_in: orig2,
            cipher_xL_in: cipher.xL,
            cipher_xR_in: cipher.xR,
            provider_k: provider_k,
            hash_plain: origHash,
        }
*/
        console.log(snark_params)

        const { proof, publicSignals } = await snarkjs.plonk.fullProve(
            snark_params,
            "circuits/keytransfer.wasm",
            "circuits/keytransfer.zkey"
        );

        const proof_solidity = (await snarkjs.plonk.exportSolidityCallData(proof, publicSignals))

        const proof_data = proof_solidity.split(",")[0]
        console.log("Proof: ");
        console.log(proof_solidity, proof_data);
        console.log(proof)

        // generate IDs from attributes
        const conditionIdLock = await lockPaymentCondition.generateId(agreementId,
            await lockPaymentCondition.hashValues(did, escrowPaymentCondition.address, token.address, escrowAmounts, receivers))
        const conditionIdAccess = await accessProofCondition.generateId(agreementId,
            await accessProofCondition.hashValues(origHash, buyer_pub, provider_pub))
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
        const data = {
            origHash,
            buyer_pub,
            provider_pub,
            cipher: [cipher.xL, cipher.xR],
            proof: proof_data,
        }
        return {
            agreementId,
            did,
            data,
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
        it.only('should create escrow agreement and fulfill with multiple reward addresses', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, data, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url } = await prepareEscrowAgreementMultipleEscrow()
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
            // await disputeManager.setAccepted(...Object.values(data))
            await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: receiver })

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
            const { agreementId, data, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url, timeOutAccess } = await prepareEscrowAgreementMultipleEscrow({ timeOutAccess: 10 })
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
            const result = await escrowPaymentCondition.fulfill(agreementId, did, escrowAmounts, receivers, escrowPaymentCondition.address, token.address, agreement.conditionIds[1], agreement.conditionIds[0], { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.unfulfilled
            )
            assert.strictEqual(result.logs.length, 0)

            // wait: for time out
            await increaseTime.mineBlocks(timeOutAccess)

            // abort: fulfill access after timeout
            await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: receiver })
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
            const { agreementId, data, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url, timeLockAccess } = await prepareEscrowAgreementMultipleEscrow({ timeLockAccess: 10 })
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
                accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: receiver }),
                constants.condition.epoch.error.isTimeLocked
            )
            // receiver is a DID owner
            // expect(await accessCondition.checkPermissions(receiver, agreement.did)).to.equal(false)

            // wait: for time lock
            await increaseTime.mineBlocks(timeLockAccess)

            // execute: fulfill access after time lock
            await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: receiver })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)
            // expect(await accessCondition.checkPermissions(receiver, agreement.did)).to.equal(true)

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
                const { agreementId, data, did, didSeed, agreement, sender, receivers, escrowAmounts, checksum, url } = await prepareEscrowAgreementMultipleEscrow()
                const totalAmount = escrowAmounts[0] + escrowAmounts[1]
                const receiver = receivers[0]

                // register DID
                await didRegistry.registerAttribute(didSeed, checksum, [], url, { from: receiver })

                // create agreement
                await accessTemplate.createAgreement(agreementId, ...Object.values(agreement))

                const { agreementId: agreementId2, agreement: agreement2, data: data2 } = await prepareEscrowAgreementMultipleEscrow(
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
                await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: receiver })
                await accessProofCondition.fulfill(agreementId2, ...Object.values(data2), { from: receiver })

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
