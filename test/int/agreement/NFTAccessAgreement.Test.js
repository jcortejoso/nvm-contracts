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
        nft,
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
            nft,
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
            nft.address,
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
        initAgreementId = testUtils.generateId(),
        sender = accounts[0],
        receiver = accounts[1],
        nftAmount = 1,
        timeLockAccess = 0,
        timeOutAccess = 0,
        didSeed = testUtils.generateId(),
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        const did = await didRegistry.hashDID(didSeed, sender)
        const agreementId = await agreementStoreManager.agreementId(initAgreementId, sender)
        // generate IDs from attributes
        const conditionIdNFT = await nftHolderCondition.hashValues(did, receiver, nftAmount)
        const conditionIdAccess = await accessCondition.hashValues(did, receiver)

        // construct agreement
        const agreement = {
            initAgreementId,
            did,
            conditionIds: [
                conditionIdNFT,
                conditionIdAccess
            ],
            timeLocks: [0, timeLockAccess],
            timeOuts: [0, timeOutAccess],
            consumer: receiver
        }
        return {
            conditionIds: [
                await nftHolderCondition.generateId(agreementId, conditionIdNFT),
                await accessCondition.generateId(agreementId, conditionIdAccess)
            ],
            agreementId,
            agreement,
            sender,
            did,
            didSeed,
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
            const { agreementId, didSeed, agreement, sender, receiver, nftAmount, checksum, url, conditionIds } = await prepareNFTAccessAgreement({ timeOutAccess: 10 })

            // register DID
            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, 10, 0, constants.activities.GENERATED, '', { from: sender })

            // create agreement
            await nftAccessTemplate.createAgreement(...Object.values(agreement))

            // mint and transfer the nft
            await didRegistry.mint(agreement.did, nftAmount, { from: sender })
            await nft.safeTransferFrom(
                sender, receiver, BigInt(agreement.did), nftAmount, '0x', { from: sender })

            // fulfill nft holder condition
            await nftHolderCondition.fulfill(agreementId, agreement.did, receiver, nftAmount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // No update since access is not fulfilled yet
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIds[1])).toNumber(),
                constants.condition.state.unfulfilled
            )

            // fulfill access
            await accessCondition.methods['fulfill(bytes32,bytes32,address)'](
                agreementId,
                agreement.did,
                receiver,
                { from: sender }
            )
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            const balanceSender = await nft.balanceOf(sender, agreement.did)
            assert.strictEqual(0, balanceSender.toNumber())

            const balanceReceiver = await nft.balanceOf(receiver, agreement.did)
            assert.strictEqual(nftAmount, balanceReceiver.toNumber())
        })
    })
})
