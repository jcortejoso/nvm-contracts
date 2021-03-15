/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTAccessTemplate = artifacts.require('NFTAccessTemplate')
const NFTSalesTemplate = artifacts.require('NFTSalesTemplate')

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
const AccessCondition = artifacts.require('AccessCondition')
const NFTHolderCondition = artifacts.require('NFTHolderCondition')

const constants = require('../../helpers/constants.js')
const getBalance = require('../../helpers/getBalance.js')
const testUtils = require('../../helpers/utils.js')

contract('End to End NFT Scenarios', (accounts) => {
    const royalties = 10 // 10% of royalties in the secondary market
    const cappedAmount = 5
    const did = testUtils.generateId()
    const agreementId = testUtils.generateId()
    const agreementAccessId = testUtils.generateId()
    const agreementId2 = testUtils.generateId()
    const checksum = testUtils.generateId()
    const url = 'https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png'

    const artist = accounts[0]
    const collector1 = accounts[1]
    const collector2 = accounts[2]
    const gallery = accounts[3]

    const owner = accounts[9]
    const deployer = accounts[8]

    // Configuration of First Sale:
    // Artist -> Collector1, the gallery get a cut (25%)
    const numberNFTs = 1
    const nftPrice = 20
    const amounts = [15, 5]
    const receivers = [artist, gallery]

    // Configuration of Sale in secondary market:
    // Collector1 -> Collector2, the artist get 10% royalties
    const numberNFTs2 = 1
    const nftPrice2 = 100
    const amounts2 = [90, 10]
    const receivers2 = [collector1, artist]

    let
        didRegistry,
        token,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nftSalesTemplate,
        nftAccessTemplate,
        nftSalesAgreement,
        nftAccessAgreement,
        lockPaymentCondition,
        transferCondition,
        escrowCondition,
        nftHolderCondition,
        accessCondition

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

        accessCondition = await AccessCondition.new()
        await accessCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: deployer }
        )

        nftHolderCondition = await NFTHolderCondition.new({ from: deployer })
        await nftHolderCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
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
        nftAccessTemplate = await NFTAccessTemplate.new()
        await nftAccessTemplate.methods['initialize(address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            nftHolderCondition.address,
            accessCondition.address,
            { from: deployer }
        )

        // IMPORTANT: Here we give ERC1155 transfer grants to the TransferNFTCondition condition
        await didRegistry.setProxyApproval(transferCondition.address, true, { from: owner })

        await templateStoreManager.proposeTemplate(nftSalesTemplate.address)
        await templateStoreManager.approveTemplate(nftSalesTemplate.address, { from: owner })

        await templateStoreManager.proposeTemplate(nftAccessTemplate.address)
        await templateStoreManager.approveTemplate(nftAccessTemplate.address, { from: owner })

        return {
            didRegistry
        }
    }

    async function prepareNFTAccessAgreement({
        did,
        agreementAccessId = testUtils.generateId(),
        sender = artist,
        receiver = collector1
    } = {}) {
        // construct agreement
        const conditionIdNFTHolder = await nftHolderCondition.generateId(agreementAccessId,
            await nftHolderCondition.hashValues(did, collector1, 1))
        const conditionIdNFTAccess = await accessCondition.generateId(agreementAccessId,
            await accessCondition.hashValues(did, collector1))

        nftAccessAgreement = {
            did: did,
            conditionIds: [
                conditionIdNFTHolder,
                conditionIdNFTAccess
            ],
            timeLocks: [0, 0],
            timeOuts: [0, 0],
            accessConsumer: collector1
        }
        return {
            agreementId,
            nftAccessAgreement
        }
    }

    async function prepareNFTSaleAgreement({
        did,
        agreementId = testUtils.generateId(),
        _amounts = amounts,
        _receivers = receivers,
        _seller = artist,
        _buyer = collector1,
        _numberNFTs = numberNFTs
    } = {}) {
        const conditionIdLockPayment = await lockPaymentCondition.generateId(agreementId,
            await lockPaymentCondition.hashValues(did, escrowCondition.address, _amounts, _receivers))

        const conditionIdTransferNFT = await transferCondition.generateId(agreementId,
            await transferCondition.hashValues(did, _buyer, _numberNFTs, conditionIdLockPayment))

        const conditionIdEscrow = await escrowCondition.generateId(agreementId,
            await escrowCondition.hashValues(did, _amounts, _receivers, escrowCondition.address, conditionIdLockPayment, conditionIdTransferNFT))

        nftSalesAgreement = {
            did: did,
            conditionIds: [
                conditionIdLockPayment,
                conditionIdTransferNFT,
                conditionIdEscrow
            ],
            timeLocks: [0, 0, 0],
            timeOuts: [0, 0, 0],
            accessConsumer: _buyer
        }
        return {
            agreementId,
            nftSalesAgreement
        }
    }

    describe('As an artist I want to register a new artwork', () => {
        it('I want to register a new artwork and tokenize (via NFT). I want to get 10% of royalties', async () => {
            const { didRegistry } = await setupTest()

            await didRegistry.registerMintableDID(
                did, checksum, [], url, cappedAmount, royalties, constants.activities.GENERATED, '', { from: artist })
            await didRegistry.mint(did, 5, { from: artist })
            await didRegistry.setApprovalForAll(transferCondition.address, true, { from: artist })

            const balance = await didRegistry.balanceOf(artist, did)
            assert.strictEqual(5, balance.toNumber())
        })
    })

    describe('As collector I want to buy some art', () => {
        it('I am setting an agreement for buying a NFT', async () => {
            await prepareNFTSaleAgreement({
                did: did,
                agreementId: agreementId,
                _seller: artist,
                _buyer: collector1
            })

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
            const nftAmount = 1
            // Collector1: Create NFT access agreement
            await prepareNFTAccessAgreement({ did: did, agreementAccessId: agreementAccessId })

            // The Collector creates an agreement on-chain for purchasing a specific NFT attached to a DID
            const result = await nftAccessTemplate.createAgreement(
                agreementAccessId, ...Object.values(nftAccessAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            // Collector1: I demonstrate I have the NFT
            await nftHolderCondition.fulfill(
                agreementAccessId, nftAccessAgreement.did, collector1, nftAmount)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(nftAccessAgreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // Artist: I give access to the collector1 to the content
            await accessCondition.fulfill(agreementAccessId, nftAccessAgreement.did, collector1, { from: artist })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(nftAccessAgreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)
        })
    })

    describe('As collector1 I want to sell my NFT to a different collector2 for a higher price', () => {
        it('As collector2 I setup an agreement for buying an NFT to collector1', async () => {
            // Collector2: Create NFT sales agreement
            const { nftSalesAgreement } = await prepareNFTSaleAgreement({
                did: did,
                agreementId: agreementId2,
                _amounts: amounts2,
                _receivers: receivers2,
                _seller: collector1,
                _buyer: collector2,
                _numberNFTs: numberNFTs2
            })

            const result = await nftSalesTemplate.createAgreement(
                agreementId2, ...Object.values(nftSalesAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            // Collector2: Lock the payment
            await token.mint(collector2, nftPrice2, { from: owner })
            await token.approve(lockPaymentCondition.address, nftPrice2, { from: collector2 })
            await token.approve(escrowCondition.address, nftPrice2, { from: collector2 })

            await lockPaymentCondition.fulfill(agreementId2, did, escrowCondition.address, amounts2, receivers2, { from: collector2 })

            const { state } = await conditionStoreManager.getCondition(
                nftSalesAgreement.conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
            const collector1Balance = await getBalance(token, collector2)
            assert.strictEqual(collector1Balance, 0)

            await didRegistry.setApprovalForAll(transferCondition.address, true, { from: artist })
            // Collector1: Transfer the NFT
            await transferCondition.fulfill(
                agreementId2,
                did,
                collector2,
                numberNFTs2,
                escrowCondition.address,
                amounts2,
                receivers2,
                nftSalesAgreement.conditionIds[0],
                { from: collector1 })

            let condition = await conditionStoreManager.getCondition(
                nftSalesAgreement.conditionIds[1])
            assert.strictEqual(condition[1].toNumber(), constants.condition.state.fulfilled)

            const nftBalance = await didRegistry.balanceOf(collector2, did)
            assert.strictEqual(nftBalance.toNumber(), numberNFTs2)

            // Collector1 & Artist: Get the payment
            await escrowCondition.fulfill(
                agreementId2,
                did,
                amounts2,
                receivers2,
                escrowCondition.address,
                nftSalesAgreement.conditionIds[0],
                nftSalesAgreement.conditionIds[1],
                { from: collector1 })

            condition = await conditionStoreManager.getCondition(nftSalesAgreement.conditionIds[2])
            assert.strictEqual(condition[1].toNumber(), constants.condition.state.fulfilled)

            assert.strictEqual(await getBalance(token, collector2), 0)
            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, escrowCondition.address), 0)
            assert.strictEqual(await getBalance(token, receivers2[0]), amounts2[0])
        })

        it('As artist I want to receive royalties for the NFT I created and was sold in the secondary market', async () => {
            // Artist check the balance and has the royalties
            assert.strictEqual(await getBalance(token, artist), amounts[0] + amounts2[1])
        })

        it('A sale without proper royalties can not happen', async () => {
            const agreementIdNoRoyalties = testUtils.generateId()
            const amountsNoRoyalties = [99, 1]
            const receiversNoRoyalties = [collector1, artist]

            // Collector2: Create NFT sales agreement
            const { nftSalesAgreement } = await prepareNFTSaleAgreement({
                did: did,
                agreementId: agreementIdNoRoyalties,
                _amounts: amountsNoRoyalties,
                _receivers: receiversNoRoyalties,
                _seller: collector1,
                _buyer: collector2,
                _numberNFTs: numberNFTs2
            })

            const result = await nftSalesTemplate.createAgreement(
                agreementIdNoRoyalties, ...Object.values(nftSalesAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            // Collector2: Lock the payment
            await token.mint(collector2, nftPrice2, { from: owner })
            await token.approve(lockPaymentCondition.address, nftPrice2, { from: collector2 })
            await token.approve(escrowCondition.address, nftPrice2, { from: collector2 })

            await assert.isRejected(
                lockPaymentCondition.fulfill(agreementId2, did, escrowCondition.address, amountsNoRoyalties, receiversNoRoyalties, { from: collector2 })
            )
        })
    })
})
