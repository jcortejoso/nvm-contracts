/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const AaveCreditTemplate = artifacts.require('AaveCreditTemplate')
const NFTLockCondition = artifacts.require('NFTLockCondition')
const AaveCollateralDeposit = artifacts.require('AaveCollateralDeposit')
const AaveBorrowCredit = artifacts.require('AaveBorrowCredit')
const AaveRepayCredit = artifacts.require('AaveRepayCredit')
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const NeverminedToken = artifacts.require('NeverminedToken')

const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('End to End NFT Collateral Scenario', (accounts) => {
    const delegator = accounts[1]
    const delegatee = accounts[2]
    const lendingPoolAddress = '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe' //Kovan
    const dataProviderAddres = '0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79' //Kovan
    const wethAddress = '0xd0A1E359811322d97991E03f863a0C30C2cF029C' //Kovan

    const owner = accounts[9]
    const deployer = accounts[8]
    const nftLockAddress = accounts[7]


    let
        didRegistry,
        token,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nftLockCondition,
        aaveCollateralDeposit,
        aaveBorrowCredit,
        aaveRepayCredit

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

        nftLockCondition = await NFTLockCondition.new()

        await nftLockCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        aaveCollateralDeposit = await AaveCollateralDeposit.new()

        await aaveCollateralDeposit.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        aaveBorrowCredit = await AaveBorrowCredit.new()

        await aaveBorrowCredit.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        aaveRepayCredit = await AaveRepayCredit.new()

        await aaveRepayCredit.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        // Setup NFT Collaterall Template
        aaveCreditTemplate = await AaveCreditTemplate.new()
        await aaveCreditTemplate.methods['initialize(address,address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            nftLockCondition.address,
            aaveCollateralDeposit.address,
            aaveBorrowCredit.address,
            aaveRepayCredit.address,
            { from: deployer }
        )

        // IMPORTANT: Here we give ERC1155 transfer grants to the TransferNFTCondition condition
        await didRegistry.setProxyApproval(aaveCreditTemplate.address, true, { from: owner })

        await templateStoreManager.proposeTemplate(aaveCreditTemplate.address)
        await templateStoreManager.approveTemplate(aaveCreditTemplate.address, { from: owner })

        const templateId = aaveCreditTemplate.address

        return {
            didRegistry,
            templateId,
            aaveCreditTemplate
        }
    }

    async function prepareCreditTemplate({
        agreementId = testUtils.generateId(),
        sender = accounts[0],
        timeLockAccess = 0,
        timeOutAccess = 0,
        did = testUtils.generateId(),
        checksum = constants.bytes32.one,
        url = constants.registry.url
    } = {}) {
        // generate IDs from attributes
        const conditionIdLock = await nftLockCondition.generateId(
            agreementId,
            await nftLockCondition.hashValues(did, nftLockAddress, 1))
        const conditionIdDeposit = await aaveCollateralDeposit.generateId(
            agreementId,
            await aaveCollateralDeposit.hashValues(did))
        const conditionIdBorrow = await aaveBorrowCredit.generateId(
            agreementId,
            await aaveBorrowCredit.hashValues(did))
        const conditionIdRepay = await aaveRepayCredit.generateId(
            agreementId,
            await aaveRepayCredit.hashValues(did))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdLock,
                conditionIdDeposit,
                conditionIdBorrow,
                conditionIdRepay
            ],
            timeLocks: [timeLockAccess, 0, 0, 0],
            timeOuts: [timeOutAccess, 0, 0, 0],
            consumer: owner
        }
        return {
            agreementId,
            did,
            agreement,
            sender,
            timeLockAccess,
            timeOutAccess,
            checksum,
            url
        }
    }

    describe('Create a credit NFT collateral agreement', () => {
        it('Should create the agreement', async () => {
            const { didRegistry, aaveCreditTemplate } = await setupTest()
            const { agreementId,
                did,
                agreement,
                checksum,
                url
            } = await prepareCreditTemplate()

            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: owner })

            await aaveCreditTemplate.createAgreement(
                agreementId,
                lendingPoolAddress,
                dataProviderAddres,
                wethAddress,
                ...Object.values(agreement))

            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(did)

            const vaultAddress = await aaveCreditTemplate.getVaultForAgreement(agreementId)

            expect(vaultAddress).to.contains('0x')
        })
    })

})
