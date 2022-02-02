/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTAccessSwapTemplate = artifacts.require('NFTAccessSwapTemplate')
const NFTMarkedLockCondition = artifacts.require('NFTMarkedLockCondition')
const NFTEscrowCondition = artifacts.require('NFTEscrowPaymentCondition')

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
        did,
        nftTemplate,
        nftAgreement,
        escrowCondition,
        lockPaymentCondition,
        accessProofCondition
    const [
        owner,
        deployer,
        artist,
        receiver
    ] = accounts
    const collector1 = receiver

    const numberNFTs = 1
    const amount = 1

    async function setupTest() {
        ({
            didRegistry,
            nft,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ))

        token = nft;

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
        escrowCondition = await NFTEscrowCondition.new({ from: deployer })
        await escrowCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: deployer }
        )
        lockPaymentCondition = await NFTMarkedLockCondition.new()
        await lockPaymentCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: deployer }
        )
        nftTemplate = await NFTAccessSwapTemplate.new()
        await nftTemplate.methods['initialize(address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            lockPaymentCondition.address,
            escrowCondition.address,
            accessProofCondition.address,
            { from: deployer }
        )

        await templateStoreManager.proposeTemplate(nftTemplate.address)
        await templateStoreManager.approveTemplate(nftTemplate.address, { from: owner })
    }

    async function prepareAgreement({
        agreementId = testUtils.generateId(),
        receiver,
        amount,
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
            await lockPaymentCondition.hashValues(did, escrowCondition.address, amount, receiver, token.address))

        const conditionIdAccess = await accessProofCondition.generateId(agreementId,
            await accessProofCondition.hashValues(origHash, buyerPub, providerPub))

        const conditionIdEscrow = await escrowCondition.generateId(agreementId,
            await escrowCondition.hashValues(did, amount, receiver, escrowCondition.address, token.address, conditionIdLockPayment,
                [conditionIdAccess]))

        nftAgreement = {
            did: did,
            conditionIds: [
                conditionIdLockPayment,
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
            agreement: nftAgreement,
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
        })
    })

    describe('create and fulfill access agreement', function() {
        this.timeout(100000)
        it('should create access agreement', async () => {
            const { agreementId, data, agreement } = await prepareAgreement({ receiver, amount })

            // create agreement
            await nftTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(did)

            const conditionTypes = await nftTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // lock payment
            const nftBalanceArtistBefore = await nft.balanceOf(artist, did)
            const nftBalanceCollectorBefore = await nft.balanceOf(collector1, did)

            await nft.setApprovalForAll(lockPaymentCondition.address, true, { from: artist })
            await lockPaymentCondition.fulfill(agreementId, did, escrowCondition.address, amount, receiver, token.address, { from: artist })

            const { state } = await conditionStoreManager.getCondition(nftAgreement.conditionIds[0])
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)

            // fulfill access
            await accessProofCondition.fulfill(agreementId, ...Object.values(data), { from: collector1 })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[2])).toNumber(),
                constants.condition.state.fulfilled)

            // escrow
            await escrowCondition.fulfill(
                agreementId,
                did,
                amount,
                receiver,
                escrowCondition.address,
                token.address,
                nftAgreement.conditionIds[0],
                [nftAgreement.conditionIds[2]],
                { from: collector1 })

            const { state: state3 } = await conditionStoreManager.getCondition(nftAgreement.conditionIds[1])
            assert.strictEqual(state3.toNumber(), constants.condition.state.fulfilled)

            const nftBalanceArtistAfter = await nft.balanceOf(artist, did)
            const nftBalanceCollectorAfter = await nft.balanceOf(collector1, did)

            assert.strictEqual(nftBalanceArtistAfter.toNumber(), nftBalanceArtistBefore.toNumber() - numberNFTs)
            assert.strictEqual(nftBalanceCollectorAfter.toNumber(), nftBalanceCollectorBefore.toNumber() + numberNFTs)
        })
    })
})
