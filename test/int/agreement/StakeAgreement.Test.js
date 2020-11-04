/* eslint-env mocha */
/* eslint-disable no-console */
/* global contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const getBalance = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.ts')

contract('Stake Agreement integration test', (accounts) => {
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        signCondition,
        lockRewardCondition,
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
            signCondition,
            lockRewardCondition,
            escrowReward
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))

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
        did = constants.did[0],
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes

        const conditionIdSign = await signCondition.generateId(agreementId, await signCondition.hashValues(sign.message, sign.publicKey))
        const conditionIdLock = await lockRewardCondition.generateId(agreementId, await lockRewardCondition.hashValues(escrowReward.address, stakeAmount))
        const conditionIdEscrow = await escrowReward.generateId(agreementId, await escrowReward.hashValues(stakeAmount, staker, staker, conditionIdLock, conditionIdSign))

        // construct agreement
        const agreement = {
            did: did,
            conditionTypes: [
                signCondition.address,
                lockRewardCondition.address,
                escrowReward.address
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
            agreement,
            stakeAmount,
            stakePeriod,
            sign,
            checksum,
            url
        }
    }

    describe('create and fulfill stake agreement [ @skip-on-coverage ]', () => {
        it('stake agreement as an escrow with self-sign release', async () => {
            const { owner } = await setupTest()

            const alice = accounts[0]
            // propose and approve account as agreement factory - not for production :)
            await approveTemplateAccount(owner, alice)

            // prepare: stake agreement
            const { agreementId, stakeAmount, stakePeriod, sign, checksum, url, agreement } = await prepareStakeAgreement()

            // fill up wallet
            await token.mint(alice, stakeAmount, { from: owner })

            // register DID
            await didRegistry.registerAttribute(agreement.did, checksum, [], url)

            // create agreement: as approved account - not for production ;)
            await agreementStoreManager.createAgreement(agreementId, ...Object.values(agreement))

            // stake: fulfill lock reward
            await token.approve(lockRewardCondition.address, stakeAmount, { from: alice })
            await lockRewardCondition.fulfill(agreementId, escrowReward.address, stakeAmount)
            assert.strictEqual(await getBalance(token, alice), 0)
            assert.strictEqual(await getBalance(token, escrowReward.address), stakeAmount)

            // unstake: fail to fulfill before stake period
            await assert.isRejected(
                signCondition.fulfill(agreementId, sign.message, sign.publicKey, sign.signature),
                constants.condition.epoch.error.isTimeLocked
            )

            // wait: for stake period
            await increaseTime.mineBlocks(stakePeriod)

            // unstake: waited and fulfill after stake period
            await signCondition.fulfill(agreementId, sign.message, sign.publicKey, sign.signature)
            await escrowReward.fulfill(agreementId, stakeAmount, alice, alice, agreement.conditionIds[1], agreement.conditionIds[0])
            assert.strictEqual(await getBalance(token, alice), stakeAmount)
            assert.strictEqual(await getBalance(token, escrowReward.address), 0)
        })
    })
})
