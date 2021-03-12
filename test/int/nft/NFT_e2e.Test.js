/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTAccessTemplate = artifacts.require('NFTAccessTemplate')
const NFTSalesTemplate = artifacts.require('NFTSalesTemplate')
const NFTLockCondition = artifacts.require('NFTLockCondition')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')
const TransferNFTCondition = artifacts.require('TransferNFTCondition')
const EscrowPaymentCondition = artifacts.require('EscrowPaymentCondition')
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const NeverminedToken = artifacts.require('NeverminedToken')

const constants = require('../../helpers/constants.js')
// const deployManagers = require('../../helpers/deployManagers.js')
const getBalance = require('../../helpers/getBalance.js')
const testUtils = require('../../helpers/utils.js')

contract('End to End NFT Scenarios', (accounts) => {
    const royalties = 10 // 10% of royalties in the secondary market
    const cappedAmount = 5
    const did = testUtils.generateId()
    const agreementId = testUtils.generateId()
    const checksum = testUtils.generateId()
    const url = 'https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png'

    const artist = accounts[0]
    const collector1 = accounts[1]
    //    const collector2 = accounts[2]
    const gallery = accounts[3]
    //    const auctionHouse = accounts[4]

    const owner = accounts[9]
    const deployer = accounts[8]

    const numberNFTs = 1
    const nftPrice = 20
    const amounts = [15, 5]
    const receivers = [artist, gallery]

    let
        didRegistry,
        token,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        //        //        escrowAccessSecretStoreTemplate,
        nftSalesTemplate,
        nftAccessTemplate,
        nftSalesAgreement,
        nftAccessAgreement,
        //        //        accessSecretStoreCondition,
        lockNFTCondition,
        lockPaymentCondition,
        transferCondition,
        escrowCondition
    //        did

    async function setupTest() {
        token = await NeverminedToken.new()
        await token.initialize(owner, owner)

        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
        didRegistry = await DIDRegistry.new()
        await didRegistry.initialize(owner)

        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        conditionStoreManager = await ConditionStoreManager.new()

        templateStoreManager = await TemplateStoreManager.new()
        await templateStoreManager.initialize(owner, { from: deployer })

        const agreementStoreLibrary = await AgreementStoreLibrary.new()
        await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
        agreementStoreManager = await AgreementStoreManager.new()
        await agreementStoreManager.methods['initialize(address,address,address,address)'](
            owner,
            conditionStoreManager.address,
            templateStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        await conditionStoreManager.initialize(
            agreementStoreManager.address,
            { from: deployer }
        )

        lockPaymentCondition = await LockPaymentCondition.new()
        await lockPaymentCondition.initialize(
            owner,
            conditionStoreManager.address,
            token.address,
            didRegistry.address,
            { from: deployer }
        )

        transferCondition = await TransferNFTCondition.new()
        await transferCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: deployer }
        )

        escrowCondition = await EscrowPaymentCondition.new()
        await escrowCondition.initialize(
            owner,
            conditionStoreManager.address,
            token.address,
            { from: deployer }
        )

        nftSalesTemplate = await NFTSalesTemplate.new()
        await nftSalesTemplate.methods['initialize(address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            lockPaymentCondition.address,
            transferCondition.address,
            escrowCondition.address,
            { from: deployer }
        )

        // Setup NFT Access Template
        const contractType = templateStoreManager.address
        nftAccessTemplate = await NFTAccessTemplate.new()
        await nftAccessTemplate.methods['initialize(address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            contractType,
            contractType,
            { from: deployer }
        )

        // TODO: Setup DID Transfer Template

        await templateStoreManager.proposeTemplate(nftSalesTemplate.address)
        await templateStoreManager.approveTemplate(nftSalesTemplate.address, { from: owner })

        await templateStoreManager.proposeTemplate(nftAccessTemplate.address)
        await templateStoreManager.approveTemplate(nftAccessTemplate.address, { from: owner })

        return {
            didRegistry
        }
    }

    async function prepareNFTAccessAgreement({
        agreementId = testUtils.generateId(),
        conditionIds = [
            constants.bytes32.one,
            constants.bytes32.two
        ],
        timeLocks = [0, 0],
        timeOuts = [0, 0],
        sender = accounts[0],
        receiver = accounts[1],
        did = testUtils.generateId()
    } = {}) {
        // construct agreement
        const nftAccessAgreement = {
            did,
            conditionIds,
            timeLocks,
            timeOuts,
            accessConsumer: receiver
        }
        return {
            agreementId,
            nftAccessAgreement
        }
    }

    async function prepareNFTSaleAgreement({
        did,
        agreementId = testUtils.generateId(),
        sender = artist,
        receiver = collector1
    } = {}) {
        const conditionIdLockPayment = await lockPaymentCondition.generateId(agreementId,
            await lockPaymentCondition.hashValues(did, escrowCondition.address, amounts, receivers))

        const conditionIdTransferNFT = await transferCondition.generateId(agreementId,
            await transferCondition.hashValues(did, collector1, numberNFTs, conditionIdLockPayment))

        const conditionIdEscrow = await escrowCondition.generateId(agreementId,
            await escrowCondition.hashValues(did, amounts, receivers, escrowCondition.address, conditionIdLockPayment, conditionIdTransferNFT))

        nftSalesAgreement = {
            did: did,
            conditionIds: [
                conditionIdLockPayment,
                conditionIdTransferNFT,
                conditionIdEscrow
            ],
            timeLocks: [0, 0, 0],
            timeOuts: [0, 0, 0],
            accessConsumer: collector1
        }
        return {
            agreementId,
            nftSalesAgreement
        }
    }

    /**
  * Artist register a new Asset (Royalties 10%, Mint 5 NFTs capped)
  * Collector 1 buy an NFT for 20 tokens. No royalties. Artist get paid. Collector get the NFT
  * Collector 1 can get access to an exclusive service provided by the artist showing the NFT buyed for the DID
  * Collector 1 sell the NFT for 50 tokens to Collector 2. 10% (royalties) go to the original creator (5 tokens).

*/

    describe('As an artist I want to register a new artwork', () => {
        it('I want to register a new artwork and tokenize (via NFT). I want to get 10% of royalties', async () => {
            const { didRegistry } = await setupTest()

            await didRegistry.registerMintableDID(
                did, checksum, [], url, cappedAmount, royalties, constants.activities.GENERATED, '', { from: artist })
            await didRegistry.mint(did, 5, { from: artist })
            await didRegistry.setApprovalForAll(transferCondition.address, true, {from: artist})

            const balance = await didRegistry.balanceOf(artist, did)
            assert.strictEqual(5, balance.toNumber())
        })

    })

    describe('As collector I want to buy some art', () => {
        it('I am setting an agreement for buying a NFT', async () => {
            await prepareNFTSaleAgreement({ did: did, agreementId: agreementId })

            // The Collector creates an agreement on-chain for purchasing a specific NFT attached to a DID
            const result = await nftSalesTemplate.createAgreement(
                agreementId, ...Object.values(nftSalesAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')
        })

        it('I am locking the payment', async () => {

            await token.mint(collector1, nftPrice, { from: owner })
            await token.approve(lockPaymentCondition.address, nftPrice, { from: collector1 })
            await token.approve(escrowCondition.address, nftPrice, { from: collector1 })

            await lockPaymentCondition.fulfill(agreementId, did, escrowCondition.address, amounts, receivers, { from: collector1 })

            const { state } = await conditionStoreManager.getCondition(nftSalesAgreement.conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
            const collector1Balance = await getBalance(token, collector1)
            assert.strictEqual(collector1Balance, 0)

        })

        it('The artist can check the payment and transfer the NFT to the collector', async () => {

            await transferCondition.fulfill(
                agreementId,
                did,
                collector1,
                numberNFTs,
                escrowCondition.address,
                amounts,
                receivers,
                nftSalesAgreement.conditionIds[0],
                { from: artist })

            const { state } = await conditionStoreManager.getCondition(
                nftSalesAgreement.conditionIds[1])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            const nftBalance = await didRegistry.balanceOf(collector1, did)
            assert.strictEqual(nftBalance.toNumber(), numberNFTs)

        })

        it('The artist ask and receives the payment', async () => {

            await escrowCondition.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                escrowCondition.address,
                nftSalesAgreement.conditionIds[0],
                nftSalesAgreement.conditionIds[1],
                { from: artist })

            const { state } = await conditionStoreManager.getCondition(nftSalesAgreement.conditionIds[2])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            assert.strictEqual(await getBalance(token, collector1), 0)
            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowCondition.address), 0)
            assert.strictEqual(await getBalance(token, receivers[0]), amounts[0])
            assert.strictEqual(await getBalance(token, receivers[1]), amounts[1])

        })
    })


    describe('As artist I want to give exclusive access to the collectors owning a specific NFT', () => {

        it('As collector I want get access to a exclusive service provided by the artist', async () => {

            // Collector1: Create NFT access agreement

            // Collector1: I demonstrate I have the NFT

            // Artist: I give access to the collector1 to the content

        })

    })


    describe('As collector1 I want to sell my NFT to a different collector2 for a higher price', () => {

        it('As collector2 I setup an agreement for buying an NFT to collector1', async () => {
            // Collector2: Create NFT sales agreement

            // Collector2: Lock the payment

            // Collector1: Transfer the NFT

            // Collector1: Get the payment
        })

        it('As artist I want to receive royalties for the NFT I created and was sold in the secondary market', async () => {
            // Artist check the balance and has the royalties

        })
    })

})
