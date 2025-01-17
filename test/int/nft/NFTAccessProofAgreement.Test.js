/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTAccessProofTemplate = artifacts.require('NFTAccessProofTemplate')
const NFTHolderCondition = artifacts.require('NFTHolderCondition')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils')

const { makeProof } = require('../../helpers/proofHelper')

contract('NFT Access Proof Template integration test', (accounts) => {
    const didSeed = testUtils.generateId()
    const checksum = testUtils.generateId()
    const url = 'https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png'
    const royalties = 10 // 10% of royalties in the secondary market
    const cappedAmount = 5
    let token,
        didRegistry,
        nft,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nftAccessTemplate,
        did,
        nftHolderCondition,
        accessProofCondition
    const [
        owner,
        deployer,
        artist,
        receiver,
        someone
    ] = accounts
    async function setupTest() {
        ({
            token,
            didRegistry,
            nft,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ));

        ({
            accessProofCondition
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))
        nftHolderCondition = await NFTHolderCondition.new({ from: deployer })
        await nftHolderCondition.initialize(
            owner,
            conditionStoreManager.address,
            nft.address,
            { from: deployer }
        )

        nftAccessTemplate = await NFTAccessProofTemplate.new()
        await nftAccessTemplate.methods['initialize(address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            nftHolderCondition.address,
            accessProofCondition.address,
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

    async function prepareAgreement({
        agreementId = testUtils.generateId(),
        sender = accounts[0],
        receivers = [accounts[2], accounts[3]],
        escrowAmounts = [11, 4],
        timeLockAccess = 0,
        timeOutAccess = 0,
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        const orig1 = 222n
        const orig2 = 333n

        const buyerK = 123
        const providerK = 234

        const data = await makeProof(orig1, orig2, buyerK, providerK)
        const { origHash, buyerPub, providerPub } = data

        // construct agreement
        const conditionIdNFTHolder = await nftHolderCondition.generateId(agreementId,
            await nftHolderCondition.hashValues(did, receiver, 1))
        const conditionIdAccess = await accessProofCondition.generateId(agreementId,
            await accessProofCondition.hashValues(origHash, buyerPub, providerPub))

        const agreement = {
            did: did,
            conditionIds: [
                conditionIdNFTHolder,
                conditionIdAccess
            ],
            timeLocks: [0, 0],
            timeOuts: [0, 0],
            accessConsumer: receiver
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
            url,
            buyerK,
            providerPub,
            origHash
        }
    }

    describe('As an artist I want to register a new artwork', () => {
        it('I want to register a new artwork and tokenize (via NFT). I want to get 10% of royalties', async () => {
            await setupTest()

            did = await didRegistry.hashDID(didSeed, artist)

            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, cappedAmount, royalties, constants.activities.GENERATED, '', { from: artist })
            await didRegistry.mint(did, 5, { from: artist })

            const balance = await nft.balanceOf(artist, did)
            assert.strictEqual(5, balance.toNumber())

            await nft.safeTransferFrom(artist, receiver, did, 2, '0x', { from: artist })
        })
    })

    describe('create and fulfill access agreement', function() {
        this.timeout(100000)
        it('should create access agreement', async () => {
            const { agreementId, data, agreement } = await prepareAgreement()

            // create agreement
            await nftAccessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(did)

            const conditionTypes = await nftAccessTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fulfill holder
            await nftHolderCondition.fulfill(
                agreementId, did, receiver, 1, { from: someone })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: artist })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)
        })
    })
})
