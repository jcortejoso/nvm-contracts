/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, BigInt */

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
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const NFTAccessCondition = artifacts.require('NFTAccessCondition')
const NFTHolderCondition = artifacts.require('NFTHolderCondition')
const NFT = artifacts.require('NFTUpgradeable')

const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')
const { getETHBalanceBN } = require('../../helpers/getBalance')
const web3Utils = require('web3-utils')

const toEth = (value) => {
    return Number(web3Utils.fromWei(value.toString(10), 'ether'))
}

contract('End to End NFT Scenarios (with Ether)', (accounts) => {
    const royalties = 10 // 10% of royalties in the secondary market
    const cappedAmount = 5
    const didSeed = testUtils.generateId()
    let did
    const agreementId = testUtils.generateId()
    const agreementAccessId = testUtils.generateId()
    const agreementId2 = testUtils.generateId()
    const checksum = testUtils.generateId()
    const url = 'https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png'

    const [
        owner,
        deployer,
        artist,
        collector1,
        collector2,
        gallery,
        market,
        someone
    ] = accounts

    // Configuration of First Sale:
    // Artist -> Collector1, the gallery get a cut (25%)
    const numberNFTs = 1

    let nftPrice = 2
    let amounts = [1.5, 0.5]

    const receivers = [artist, gallery]

    // Configuration of Sale in secondary market:
    // Collector1 -> Collector2, the artist get 10% royalties
    const numberNFTs2 = 1

    let nftPrice2 = 5
    let amounts2 = [4, 1]

    const receivers2 = [collector1, artist]

    before(async () => {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link(epochLibrary)
        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link(didRegistryLibrary)
    })

    let
        didRegistry,
        nft,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nftSalesTemplate,
        nftAccessTemplate,
        lockPaymentCondition,
        transferCondition,
        escrowCondition,
        nftHolderCondition,
        accessCondition

    async function setupTest() {
        nft = await NFT.new()
        await nft.initialize('')

        didRegistry = await DIDRegistry.new()
        await didRegistry.initialize(owner, nft.address, constants.address.zero)
        await nft.addMinter(didRegistry.address)

        conditionStoreManager = await ConditionStoreManager.new()

        templateStoreManager = await TemplateStoreManager.new()
        await templateStoreManager.initialize(owner, { from: deployer })

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
            owner,
            { from: deployer }
        )

        lockPaymentCondition = await LockPaymentCondition.new()
        await lockPaymentCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        transferCondition = await TransferNFTCondition.new()
        await transferCondition.initialize(
            owner,
            conditionStoreManager.address,
            nft.address,
            owner,
            { from: deployer }
        )

        escrowCondition = await EscrowPaymentCondition.new()
        await escrowCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: deployer }
        )

        accessCondition = await NFTAccessCondition.new()
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
        await nft.setProxyApproval(transferCondition.address, true, { from: owner })

        await conditionStoreManager.grantProxyRole(
            escrowCondition.address,
            { from: owner }
        )
        await agreementStoreManager.grantProxyRole(nftSalesTemplate.address, { from: owner })
        await lockPaymentCondition.grantProxyRole(agreementStoreManager.address, { from: owner })

        await templateStoreManager.proposeTemplate(nftSalesTemplate.address)
        await templateStoreManager.approveTemplate(nftSalesTemplate.address, { from: owner })

        await templateStoreManager.proposeTemplate(nftAccessTemplate.address)
        await templateStoreManager.approveTemplate(nftAccessTemplate.address, { from: owner })

        return {
            didRegistry,
            nft
        }
    }

    async function prepareNFTAccessAgreement({
        did,
        agreementAccessId = testUtils.generateId(),
        receiver = collector1
    } = {}) {
        // construct agreement
        const conditionIdNFTHolder = await nftHolderCondition.hashValues(did, receiver, 1)
        const conditionIdNFTAccess = await accessCondition.hashValues(did, receiver)

        const nftAccessAgreement = {
            did: did,
            conditionIds: [
                conditionIdNFTHolder,
                conditionIdNFTAccess
            ],
            timeLocks: [0, 0],
            timeOuts: [0, 0],
            accessConsumer: receiver
        }
        return {
            conditionIds: [
                await nftHolderCondition.generateId(agreementAccessId, conditionIdNFTHolder),
                await accessCondition.generateId(agreementAccessId, conditionIdNFTAccess)
            ],
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
        const conditionIdLockPayment = await lockPaymentCondition.hashValues(did, escrowCondition.address, constants.address.zero, _amounts.map(a => String(a)), _receivers)
        const fullIdLockPayment = await lockPaymentCondition.generateId(agreementId, conditionIdLockPayment)
        const conditionIdTransferNFT = await transferCondition.hashValues(did, _seller, _buyer, _numberNFTs, fullIdLockPayment)
        const fullIdTransferNFT = await transferCondition.generateId(agreementId, conditionIdTransferNFT)

        const conditionIdEscrow = await escrowCondition.hashValues(did, _amounts.map(a => String(a)), _receivers, _buyer, escrowCondition.address, constants.address.zero, fullIdLockPayment, fullIdTransferNFT)
        const fullIdEscrow = await escrowCondition.generateId(agreementId, conditionIdEscrow)

        const nftSalesAgreement = {
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
            conditionIds: [
                fullIdLockPayment,
                fullIdTransferNFT,
                fullIdEscrow
            ],
            agreementId,
            nftSalesAgreement
        }
    }

    before(() => {
        nftPrice = Number(web3Utils.toWei(String(nftPrice), 'ether'))
        amounts = amounts.map(v => Number(web3Utils.toWei(String(v), 'ether')))

        nftPrice2 = web3Utils.toWei(String(nftPrice2), 'ether')
        amounts2 = amounts2.map(v => web3Utils.toWei(String(v), 'ether'))
    })

    describe('As an artist I want to register a new artwork', () => {
        it('I want to register a new artwork and tokenize (via NFT). I want to get 10% of royalties', async () => {
            const { didRegistry, nft } = await setupTest()

            did = await didRegistry.hashDID(didSeed, artist)

            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, cappedAmount, royalties, constants.activities.GENERATED, '', { from: artist })
            await didRegistry.mint(did, 5, { from: artist })
            await nft.setApprovalForAll(transferCondition.address, true, { from: artist })

            const balance = await nft.balanceOf(artist, did)
            assert.strictEqual(5, balance.toNumber())
        })
    })

    describe('As collector I want to buy some art', () => {
        let conditionIds
        it('I am setting an agreement for buying a NFT', async () => {
            const data = await prepareNFTSaleAgreement({
                did: did,
                agreementId: agreementId,
                _seller: artist,
                _buyer: collector1
            })

            conditionIds = data.conditionIds

            // The Collector creates an agreement on-chain for purchasing a specific NFT attached to a DID
            const result = await nftSalesTemplate.createAgreement(
                agreementId, ...Object.values(data.nftSalesAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')
        })

        it('fails because i forgot to add eth "value" to the transactions', async () => {
            await assert.isRejected(
                lockPaymentCondition.fulfill(
                    agreementId, did, escrowCondition.address, constants.address.zero, amounts.map(a => String(a)), receivers,
                    { from: collector1 }
                ),
                'Transaction value does not match amount'
            )
        })

        it('I am locking the payment', async () => {
            const collector1Before = toEth(await getETHBalanceBN(collector1))

            await lockPaymentCondition.fulfill(
                agreementId, did, escrowCondition.address, constants.address.zero, amounts.map(a => String(a)), receivers,
                { from: collector1, value: nftPrice }
            )

            const { state } = await conditionStoreManager.getCondition(conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            assert.closeTo(
                toEth(await getETHBalanceBN(collector1)),
                collector1Before - toEth(nftPrice),
                0.01
            )
        })

        it('The artist can check the payment and transfer the NFT to the collector', async () => {
            const nftBalanceArtistBefore = await nft.balanceOf(artist, did)
            const nftBalanceCollectorBefore = await nft.balanceOf(collector1, did)

            await nft.setApprovalForAll(transferCondition.address, true, { from: artist })
            await transferCondition.methods['fulfill(bytes32,bytes32,address,uint256,bytes32)'](
                agreementId,
                did,
                collector1,
                numberNFTs,
                conditionIds[0],
                { from: artist })
            await nft.setApprovalForAll(transferCondition.address, false, { from: artist })

            const { state } = await conditionStoreManager.getCondition(conditionIds[1])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            const nftBalanceArtistAfter = await nft.balanceOf(artist, did)
            const nftBalanceCollectorAfter = await nft.balanceOf(collector1, did)

            assert.strictEqual(nftBalanceArtistAfter.toNumber(), nftBalanceArtistBefore.toNumber() - numberNFTs)
            assert.strictEqual(nftBalanceCollectorAfter.toNumber(), nftBalanceCollectorBefore.toNumber() + numberNFTs)
        })

        it('The artist ask and receives the payment', async () => {
            const receiver1Before = toEth(await getETHBalanceBN(receivers[0]))
            const receiver2Before = toEth(await getETHBalanceBN(receivers[1]))

            await escrowCondition.fulfill(
                agreementId,
                did,
                amounts.map(a => String(a)),
                receivers,
                collector1,
                escrowCondition.address,
                constants.address.zero,
                conditionIds[0],
                conditionIds[1],
                { from: artist }
            )

            const { state } = await conditionStoreManager.getCondition(conditionIds[2])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            assert.closeTo(
                toEth(await getETHBalanceBN(receivers[0])),
                receiver1Before + toEth(amounts[0]),
                0.01
            )
            assert.closeTo(
                toEth(await getETHBalanceBN(receivers[1])),
                receiver2Before + toEth(amounts[1]),
                0.01
            )
        })
    })

    describe('As artist I want to give exclusive access to the collectors owning a specific NFT', () => {
        it('As collector I want get access to a exclusive service provided by the artist', async () => {
            const nftAmount = 1
            // Collector1: Create NFT access agreement
            const { nftAccessAgreement, conditionIds } = await prepareNFTAccessAgreement({ did: did, agreementAccessId: agreementAccessId })

            // The Collector creates an agreement on-chain for purchasing a specific NFT attached to a DID
            const result = await nftAccessTemplate.createAgreement(
                agreementAccessId, ...Object.values(nftAccessAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            // Collector1: I demonstrate I have the NFT
            await nftHolderCondition.fulfill(
                agreementAccessId, nftAccessAgreement.did, collector1, nftAmount, { from: someone })
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)

            // Artist: I give access to the collector1 to the content
            await accessCondition.methods['fulfill(bytes32,bytes32,address)'](
                agreementAccessId,
                nftAccessAgreement.did,
                collector1,
                { from: artist }
            )

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)
        })
    })

    describe('As collector1 I want to sell my NFT to a different collector2 for a higher price', () => {
        it('As collector2 I setup an agreement for buying an NFT to collector1', async () => {
            // Collector2: Create NFT sales agreement
            const { nftSalesAgreement, conditionIds } = await prepareNFTSaleAgreement({
                did: did,
                agreementId: agreementId2,
                _amounts: amounts2,
                _receivers: receivers2,
                _seller: collector1,
                _buyer: collector2,
                _numberNFTs: numberNFTs2
            })

            const extendedAgreement = {
                ...nftSalesAgreement,
                _idx: 0,
                _receiverAddress: escrowCondition.address,
                _tokenAddress: constants.address.zero,
                _amounts: amounts2,
                _receivers: receivers2
            }

            const collector2Before = toEth(await getETHBalanceBN(collector2))

            const totalAmount = amounts2.reduce((a, b) => a + BigInt(b), 0n)

            const result = await nftSalesTemplate.createAgreementAndPayEscrow(
                agreementId2, ...Object.values(extendedAgreement), { value: totalAmount.toString(), from: collector2 })

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            assert.closeTo(
                toEth(await getETHBalanceBN(collector2)),
                collector2Before - toEth(nftPrice2),
                0.01
            )

            const { state } = await conditionStoreManager.getCondition(conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            // Collector1: Transfer the NFT
            await nft.setApprovalForAll(transferCondition.address, true, { from: collector1 })
            await transferCondition.methods['fulfill(bytes32,bytes32,address,uint256,bytes32)'](
                agreementId2,
                did,
                collector2,
                numberNFTs2,
                conditionIds[0],
                { from: collector1 })
            await nft.setApprovalForAll(transferCondition.address, true, { from: collector1 })

            let condition = await conditionStoreManager.getCondition(conditionIds[1])
            assert.strictEqual(condition[1].toNumber(), constants.condition.state.fulfilled)

            const nftBalance1 = await nft.balanceOf(collector1, did)
            assert.strictEqual(nftBalance1.toNumber(), numberNFTs - numberNFTs2)

            const nftBalance2 = await nft.balanceOf(collector2, did)
            assert.strictEqual(nftBalance2.toNumber(), numberNFTs2)

            const receiver1Before = toEth(await getETHBalanceBN(receivers2[0]))
            const receiver2Before = toEth(await getETHBalanceBN(receivers2[1]))

            // Collector1 & Artist: Get the payment
            await escrowCondition.fulfill(
                agreementId2,
                did,
                amounts2.map(a => String(a)),
                receivers2,
                collector2,
                escrowCondition.address,
                constants.address.zero,
                conditionIds[0],
                conditionIds[1],
                { from: collector1 })

            condition = await conditionStoreManager.getCondition(conditionIds[2])
            assert.strictEqual(condition[1].toNumber(), constants.condition.state.fulfilled)

            assert.closeTo(
                toEth(await getETHBalanceBN(receivers2[0])),
                receiver1Before + toEth(amounts2[0]),
                0.01
            )
            assert.closeTo(
                toEth(await getETHBalanceBN(receivers2[1])),
                receiver2Before + toEth(amounts2[1]),
                0.01
            )
        })

        it('As artist I want to receive royalties for the NFT I created and was sold in the secondary market', async () => {
            // Artist check the balance and has the royalties
            // todo
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
            await assert.isRejected(
                lockPaymentCondition.fulfill(
                    agreementId2, did, escrowCondition.address, constants.address.zero, amountsNoRoyalties, receiversNoRoyalties,
                    { from: collector2 }
                )
            )
        })
    })

    describe('As market I want to be able to transfer nfts and release rewards on behalf of the artist', () => {
        let conditionIds
        it('Artist registers a new artwork and tokenize (via NFT)', async () => {
            const { didRegistry, nft } = await setupTest()

            did = await didRegistry.hashDID(didSeed, artist)

            await didRegistry.registerMintableDID(
                didSeed, checksum, [], url, cappedAmount, royalties, constants.activities.GENERATED, '', { from: artist })
            await didRegistry.mint(did, 5, { from: artist })
            await nft.setApprovalForAll(transferCondition.address, true, { from: artist })

            const balance = await nft.balanceOf(artist, did)
            assert.strictEqual(5, balance.toNumber())
        })

        it('Collector sets an agreement for buying a NFT', async () => {
            const data = await prepareNFTSaleAgreement({
                did: did,
                agreementId: agreementId,
                _seller: artist,
                _buyer: collector1
            })
            conditionIds = data.conditionIds

            // The Collector creates an agreement on-chain for purchasing a specific NFT attached to a DID
            const result = await nftSalesTemplate.createAgreement(
                agreementId, ...Object.values(data.nftSalesAgreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')
        })

        it('fails because i forgot to add eth "value" to the transactions', async () => {
            await assert.isRejected(
                lockPaymentCondition.fulfill(
                    agreementId, did, escrowCondition.address, constants.address.zero, amounts.map(a => String(a)), receivers,
                    { from: collector1 }
                ),
                'Transaction value does not match amount'
            )
        })

        it('Collector locks the payment', async () => {
            const collector1Before = toEth(await getETHBalanceBN(collector1))

            await lockPaymentCondition.fulfill(
                agreementId, did, escrowCondition.address, constants.address.zero, amounts.map(a => String(a)), receivers,
                { from: collector1, value: nftPrice }
            )

            const { state } = await conditionStoreManager.getCondition(conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            assert.closeTo(
                toEth(await getETHBalanceBN(collector1)),
                collector1Before - toEth(nftPrice),
                0.01
            )
        })

        it('The market can check the payment and can transfer the NFT to the collector', async () => {
            const nftBalanceArtistBefore = await nft.balanceOf(artist, did)
            const nftBalanceCollectorBefore = await nft.balanceOf(collector1, did)

            await nft.setApprovalForAll(market, true, { from: artist })
            await transferCondition.fulfillForDelegate(
                agreementId,
                did,
                artist,
                collector1,
                numberNFTs,
                conditionIds[0],
                { from: market }
            )

            const { state } = await conditionStoreManager.getCondition(conditionIds[1])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            const nftBalanceArtistAfter = await nft.balanceOf(artist, did)
            const nftBalanceCollectorAfter = await nft.balanceOf(collector1, did)

            assert.strictEqual(nftBalanceArtistAfter.toNumber(), nftBalanceArtistBefore.toNumber() - numberNFTs)
            assert.strictEqual(nftBalanceCollectorAfter.toNumber(), nftBalanceCollectorBefore.toNumber() + numberNFTs)
        })

        it('The market can release the payment to the artist', async () => {
            const receiver1Before = toEth(await getETHBalanceBN(receivers[0]))
            const receiver2Before = toEth(await getETHBalanceBN(receivers[1]))

            await escrowCondition.fulfill(
                agreementId,
                did,
                amounts.map(a => String(a)),
                receivers,
                collector1,
                escrowCondition.address,
                constants.address.zero,
                conditionIds[0],
                conditionIds[1],
                { from: market }
            )

            const { state } = await conditionStoreManager.getCondition(conditionIds[2])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            assert.closeTo(
                toEth(await getETHBalanceBN(receivers[0])),
                receiver1Before + toEth(amounts[0]),
                0.01
            )

            assert.closeTo(
                toEth(await getETHBalanceBN(receivers[1])),
                receiver2Before + toEth(amounts[1]),
                0.01
            )
        })
    })
})
