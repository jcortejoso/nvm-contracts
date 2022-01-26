/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTSalesTemplate = artifacts.require('NFTSalesWithAccessTemplate')
const NFTHolderCondition = artifacts.require('NFTHolderCondition')
const TransferNFTCondition = artifacts.require('TransferNFTCondition')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils')

const poseidon = require('circomlib').poseidon
const babyJub = require('circomlib').babyJub
const mimcjs = require('circomlib').mimcsponge
const ZqField = require('ffjavascript').ZqField
const Scalar = require('ffjavascript').Scalar
const F = new ZqField(Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617'))
const snarkjs = require('snarkjs')
const { unstringifyBigInts } = require('ffjavascript').utils

const { getBalance } = require('../../helpers/getBalance.js')

contract('NFT Sales with Access Proof Template integration test', (accounts) => {
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
        transferCondition,
        nftSalesTemplate,
        nftSalesAgreement,
        multiEscrowCondition,
        lockPaymentCondition,
        nftHolderCondition,
        accessProofCondition
    const [
        owner,
        deployer,
        artist,
        receiver,
        someone,
        gallery,
        market
    ] = accounts
    const collector1 = receiver

    const numberNFTs = 1
    const nftPrice = 20
    const amounts = [15, 5]
    const receivers = [artist, gallery]

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
            accessProofCondition,
            multiEscrowCondition,
            lockPaymentCondition,
            transferCondition
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
        transferCondition = await TransferNFTCondition.new()
        await transferCondition.initialize(
            owner,
            conditionStoreManager.address,
            nft.address,
            market,
            { from: deployer }
        )
        nftSalesTemplate = await NFTSalesTemplate.new()
        await nftSalesTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            lockPaymentCondition.address,
            transferCondition.address,
            multiEscrowCondition.address,
            accessProofCondition.address,
            { from: deployer }
        )
        await nft.setProxyApproval(transferCondition.address, true, { from: owner })

        await templateStoreManager.proposeTemplate(nftSalesTemplate.address)
        await templateStoreManager.approveTemplate(nftSalesTemplate.address, { from: owner })
    }

    async function prepareAgreement({
        agreementId = testUtils.generateId(),
        receivers,
        amounts,
        timeLockAccess = 0,
        timeOutAccess = 0
    } = {}) {
        const orig1 = 222n
        const orig2 = 333n
        const origHash = poseidon([orig1, orig2])

        const buyerK = 123
        const providerK = 234
        const buyerPub = babyJub.mulPointEscalar(babyJub.Base8, F.e(buyerK))
        const providerPub = babyJub.mulPointEscalar(babyJub.Base8, F.e(providerK))

        const k = babyJub.mulPointEscalar(buyerPub, F.e(providerK))

        const cipher = mimcjs.hash(orig1, orig2, k[0])

        const snarkParams = {
            buyer_x: buyerPub[0],
            buyer_y: buyerPub[1],
            provider_x: providerPub[0],
            provider_y: providerPub[1],
            xL_in: orig1,
            xR_in: orig2,
            cipher_xL_in: cipher.xL,
            cipher_xR_in: cipher.xR,
            provider_k: providerK,
            hash_plain: origHash
        }

        // console.log(snark_params)

        const { proof } = await snarkjs.plonk.fullProve(
            snarkParams,
            'circuits/keytransfer.wasm',
            'circuits/keytransfer.zkey'
        )

        const signals = [
            buyerPub[0],
            buyerPub[1],
            providerPub[0],
            providerPub[1],
            cipher.xL,
            cipher.xR,
            origHash
        ]

        const proofSolidity = (await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(proof), signals))

        const proofData = proofSolidity.split(',')[0]

        const conditionIdLockPayment = await lockPaymentCondition.generateId(agreementId,
            await lockPaymentCondition.hashValues(did, multiEscrowCondition.address, token.address, amounts, receivers))

        const conditionIdTransferNFT = await transferCondition.generateId(agreementId,
            await transferCondition.hashValues(did, artist, receiver, numberNFTs, conditionIdLockPayment))

        const conditionIdAccess = await accessProofCondition.generateId(agreementId,
            await accessProofCondition.hashValues(origHash, buyerPub, providerPub))

        const conditionIdEscrow = await multiEscrowCondition.generateId(agreementId,
            await multiEscrowCondition.hashValues(did, amounts, receivers, multiEscrowCondition.address, token.address, conditionIdLockPayment,
                [conditionIdTransferNFT, conditionIdAccess]))

        nftSalesAgreement = {
            did: did,
            conditionIds: [
                conditionIdLockPayment,
                conditionIdTransferNFT,
                conditionIdEscrow,
                conditionIdAccess
            ],
            timeLocks: [0, 0, 0],
            timeOuts: [0, 0, 0]
        }

        const data = {
            origHash,
            buyerPub,
            providerPub,
            cipher: [cipher.xL, cipher.xR],
            proof: proofData
        }
        return {
            agreementId,
            did,
            data,
            didSeed,
            agreement: nftSalesAgreement,
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
            const { agreementId, data, agreement } = await prepareAgreement({ receivers, amounts })

            // create agreement
            await nftSalesTemplate.createAgreement(agreementId, ...Object.values(agreement))

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

            // lock payment
            await token.mint(collector1, nftPrice, { from: owner })
            await token.approve(lockPaymentCondition.address, nftPrice, { from: collector1 })
            await token.approve(multiEscrowCondition.address, nftPrice, { from: collector1 })

            await lockPaymentCondition.fulfill(agreementId, did, multiEscrowCondition.address, token.address, amounts, receivers, { from: collector1 })

            const { state } = await conditionStoreManager.getCondition(nftSalesAgreement.conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
            const collector1Balance = await getBalance(token, collector1)
            assert.strictEqual(collector1Balance, 0)

            // transfer
            const nftBalanceArtistBefore = await nft.balanceOf(artist, did)
            const nftBalanceCollectorBefore = await nft.balanceOf(collector1, did)

            await nft.setApprovalForAll(transferCondition.address, true, { from: artist })
            await transferCondition.methods['fulfill(bytes32,bytes32,address,uint256,bytes32)'](
                agreementId,
                did,
                collector1,
                numberNFTs,
                nftSalesAgreement.conditionIds[0],
                { from: artist })
            await nft.setApprovalForAll(transferCondition.address, false, { from: artist })

            const { state: state2 } = await conditionStoreManager.getCondition(
                nftSalesAgreement.conditionIds[1])
            assert.strictEqual(state2.toNumber(), constants.condition.state.fulfilled)

            const nftBalanceArtistAfter = await nft.balanceOf(artist, did)
            const nftBalanceCollectorAfter = await nft.balanceOf(collector1, did)

            assert.strictEqual(nftBalanceArtistAfter.toNumber(), nftBalanceArtistBefore.toNumber() - numberNFTs)
            assert.strictEqual(nftBalanceCollectorAfter.toNumber(), nftBalanceCollectorBefore.toNumber() + numberNFTs)

            // fulfill access
            await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: artist })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // escrow
            await multiEscrowCondition.fulfill(
                agreementId,
                did,
                amounts,
                receivers,
                multiEscrowCondition.address,
                token.address,
                nftSalesAgreement.conditionIds[0],
                [nftSalesAgreement.conditionIds[1], nftSalesAgreement.conditionIds[3]],
                { from: artist })

            const { state: state3 } = await conditionStoreManager.getCondition(nftSalesAgreement.conditionIds[2])
            assert.strictEqual(state3.toNumber(), constants.condition.state.fulfilled)

            assert.strictEqual(await getBalance(token, collector1), 0)
            assert.strictEqual(await getBalance(token, lockPaymentCondition.address), 0)
            assert.strictEqual(await getBalance(token, multiEscrowCondition.address), 0)
            assert.strictEqual(await getBalance(token, receivers[0]), amounts[0])
            assert.strictEqual(await getBalance(token, receivers[1]), amounts[1])
        })
    })
})
