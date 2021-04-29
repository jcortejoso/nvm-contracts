/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, BigInt */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTAccessTemplate = artifacts.require('NFTAccessTemplate')

const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const NFTHolderCondition = artifacts.require('NFTHolderCondition')
const NFTAccessCondition = artifacts.require('NFTAccessCondition')

contract('NFT Access integration test', (accounts) => {
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nftAccessTemplate,
        accessCondition,
        nftHolderCondition

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
            accessCondition
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))

        accessCondition = await NFTAccessCondition.new({ from: deployer })
        await accessCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        nftHolderCondition = await NFTHolderCondition.new({ from: deployer })
        await nftHolderCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        nftAccessTemplate = await NFTAccessTemplate.new()
        await nftAccessTemplate.methods['initialize(address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            nftHolderCondition.address,
            accessCondition.address,
            { from: deployer }
        )

        // propose and approve template
        const templateId = nftAccessTemplate.address
        await templateStoreManager.proposeTemplate(templateId)
        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            templateId,
            owner
        }
    }

    async function prepareNFTAccessAgreement({
        agreementId = testUtils.generateId(),
        sender = accounts[0],
        receiver = accounts[1],
        nftAmount = 1,
        timeLockAccess = 0,
        timeOutAccess = 0,
        did = testUtils.generateId(),
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes
        const conditionIdNFT = await nftHolderCondition.generateId(agreementId,
            await nftHolderCondition.hashValues(did, receiver, nftAmount))
        const conditionIdAccess = await accessCondition.generateId(agreementId,
            await accessCondition.hashValues(did, receiver))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdNFT,
                conditionIdAccess
            ],
            timeLocks: [0, timeLockAccess],
            timeOuts: [0, timeOutAccess],
            consumer: receiver
        }
        return {
            agreementId,
            agreement,
            sender,
            receiver,
            nftAmount,
            timeLockAccess,
            timeOutAccess,
            checksum,
            url
        }
    }

    describe('Create and fulfill NFT Agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            await setupTest()

            // prepare: nft agreement
            const { agreementId, agreement, sender, receiver, nftAmount, checksum, url } = await prepareNFTAccessAgreement({ timeOutAccess: 10 })

            // register DID
            await didRegistry.registerMintableDID(
                agreement.did, checksum, [], url, 10, 0, constants.activities.GENERATED, '', { from: sender })

            // create agreement
            await nftAccessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // mint and transfer the nft
            await didRegistry.mint(agreement.did, nftAmount, { from: sender })
            await didRegistry.safeTransferFrom(
                sender, receiver, BigInt(agreement.did), nftAmount, '0x', { from: sender })

            // fulfill nft holder condition
            await nftHolderCondition.fulfill(agreementId, agreement.did, receiver, nftAmount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // No update since access is not fulfilled yet
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.unfulfilled
            )

            // fulfill access
            await accessCondition.fulfill(agreementId, agreement.did, receiver, { from: sender })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            const balanceSender = await didRegistry.balanceOf(sender, agreement.did)
            assert.strictEqual(0, balanceSender.toNumber())

            const balanceReceiver = await didRegistry.balanceOf(receiver, agreement.did)
            assert.strictEqual(nftAmount, balanceReceiver.toNumber())
        })
    })
})
