/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const { getBalance } = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.js')
const testUtils = require('../../helpers/utils')
const SignCondition = artifacts.require('SignCondition')

contract('Stake Agreement integration test', (accounts) => {
    const web3 = global.web3
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        signCondition,
        lockPaymentCondition,
        escrowPaymentCondition

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

        signCondition = await SignCondition.new({ from: deployer })
        await signCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: deployer }
        )

        return {
            deployer,
            owner
        }
    }

    async function approveTemplateAccount(owner, templateAccount) {
        await templateStoreManager.proposeTemplate(templateAccount)
        await templateStoreManager.approveTemplate(templateAccount, { from: owner })
    }

    async function prepareStakeAgreement({
        agreementId = constants.bytes32.one,
        staker = accounts[0],
        stakeAmount = 1000,
        stakePeriod = 5,
        // uses signature as release, could also be hash of secret
        sign = constants.condition.sign.bytes32,
        didSeed = testUtils.generateId(),
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes

        const did = await didRegistry.hashDID(didSeed, accounts[0])
        const conditionIdSign = await signCondition.generateId(agreementId, await signCondition.hashValues(sign.message, sign.publicKey))
        const conditionIdLock = await lockPaymentCondition.generateId(agreementId,
            await lockPaymentCondition.hashValues(did, escrowPaymentCondition.address, token.address, [stakeAmount], [staker]))
        const conditionIdEscrow = await escrowPaymentCondition.generateId(agreementId,
            await escrowPaymentCondition.hashValues(did, [stakeAmount], [staker], escrowPaymentCondition.address, token.address, conditionIdLock, conditionIdSign))

        // construct agreement
        const agreement = {
            did: did,
            conditionTypes: [
                signCondition.address,
                lockPaymentCondition.address,
                escrowPaymentCondition.address
            ],
            conditionIds: [
                conditionIdSign,
                conditionIdLock,
                conditionIdEscrow
            ],
            timeLocks: [stakePeriod, 0, 0],
            timeOuts: [0, 0, 0]
        }
        return {
            agreementId,
            did,
            didSeed,
            agreement,
            stakeAmount,
            staker,
            stakePeriod,
            sign,
            checksum,
            url
        }
    }

    describe('create and fulfill stake agreement', () => {
        it('stake agreement as an escrow with self-sign release', async () => {
            const { owner } = await setupTest()

            const alice = accounts[0]
            // propose and approve account as agreement factory - not for production :)
            await approveTemplateAccount(owner, alice)

            // prepare: stake agreement
            const { agreementId, did, didSeed, stakeAmount, staker, stakePeriod, sign, checksum, url, agreement } = await prepareStakeAgreement()

            // fill up wallet
            await token.mint(alice, stakeAmount, { from: owner })

            // register DID
            await didRegistry.registerAttribute(didSeed, checksum, [], url)

            // create agreement: as approved account - not for production ;)
            await agreementStoreManager.createAgreement(agreementId, ...Object.values(agreement))

            // stake: fulfill lock reward
            await token.approve(lockPaymentCondition.address, stakeAmount, { from: alice })
            await lockPaymentCondition.fulfill(agreementId, did, escrowPaymentCondition.address, token.address, [stakeAmount], [staker])
            assert.strictEqual(await getBalance(token, alice), 0)
            assert.strictEqual(await getBalance(token, escrowPaymentCondition.address), stakeAmount)

            // unstake: fail to fulfill before stake period
            await assert.isRejected(
                signCondition.fulfill(agreementId, sign.message, sign.publicKey, sign.signature),
                constants.condition.epoch.error.isTimeLocked
            )

            // wait: for stake period
            await increaseTime.mineBlocks(web3, stakePeriod)

            // unstake: waited and fulfill after stake period
            await signCondition.fulfill(agreementId, sign.message, sign.publicKey, sign.signature)
            await escrowPaymentCondition.fulfill(agreementId, did, [stakeAmount], [alice], escrowPaymentCondition.address, token.address, agreement.conditionIds[1], agreement.conditionIds[0])
            assert.strictEqual(await getBalance(token, alice), stakeAmount)
            assert.strictEqual(await getBalance(token, escrowPaymentCondition.address), 0)
        })
    })
})
