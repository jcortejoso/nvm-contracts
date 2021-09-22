/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const BigNumber = require('bignumber.js')

const AaveCreditTemplate = artifacts.require('AaveCreditTemplate')
const NFTLockCondition = artifacts.require('NFT721LockCondition')
const TransferNFTCondition = artifacts.require('TransferNFT721Condition')
const AaveCollateralDeposit = artifacts.require('AaveCollateralDepositCondition')
const AaveBorrowCredit = artifacts.require('AaveBorrowCondition')
const AaveRepayCredit = artifacts.require('AaveRepayCondition')
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const NeverminedToken = artifacts.require('NeverminedToken')
const AaveCreditVault = artifacts.require('AaveCreditVault')
const ERC20Upgradeable = artifacts.require('ERC20Upgradeable')
const TestERC721 = artifacts.require('TestERC721')

const constants = require('../../helpers/constants.js')
const testUtils = require('../../helpers/utils.js')

contract('End to End NFT Collateral Scenario', (accounts) => {
    const delegator = accounts[1]
    const delegatee = accounts[2]
    const lendingPoolAddress = '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe' // Kovan
    const dataProviderAddress = '0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79' // Kovan
    const wethAddress = '0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70' // Kovan
    const collateralAsset = '0xd0A1E359811322d97991E03f863a0C30C2cF029C' // WETH
    const delegatedAsset = '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd' // DAI
    const delegatedAmount = '500000000000000000000' // 500 DAI
    const collateralAmount = '10000000000000000000' // 10 ETH
    const daiProvider = '0xAFD49D613467c0DaBf47B8f5C841089d96Cf7167'
    const agreementFee = '15'

    const owner = accounts[9]
    const deployer = accounts[8]
    const nftLockAddress = accounts[7]
    const didSeed = testUtils.generateId()

    let
        aaveCreditTemplate,
        didRegistry,
        token,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nftLockCondition,
        transferNftCondition,
        aaveCollateralDeposit,
        aaveBorrowCredit,
        aaveRepayCredit,
        erc721,
        nftTokenAddress,
        vaultAddress,
        did,
        sender,
        agreementId,
        agreement

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
            { from: owner }
        )

        transferNftCondition = await TransferNFTCondition.new()

        await transferNftCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            nftLockCondition.address,
            { from: owner }
        )

        aaveCollateralDeposit = await AaveCollateralDeposit.new()

        await aaveCollateralDeposit.initialize(
            delegator,
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
            nftLockCondition.address,
            aaveCollateralDeposit.address,
            aaveBorrowCredit.address,
            aaveRepayCredit.address,
            transferNftCondition.address,
            { from: deployer }
        )

        erc721 = await TestERC721.new()
        await erc721.initialize({ from: owner })
        nftTokenAddress = erc721.address

        // TODO: Use ERC-721 implementation
        // IMPORTANT: Here we give ERC1155 transfer grants to the TransferNFTCondition condition
        //        await didRegistry.setProxyApproval(aaveCreditTemplate.address, true, { from: owner })

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
            await nftLockCondition.hashValues(did, nftLockAddress, 1, nftTokenAddress))

        const conditionIdDeposit = await aaveCollateralDeposit.generateId(
            agreementId,
            await aaveCollateralDeposit.hashValues(did, delegatee, collateralAsset, collateralAmount, delegatedAsset, delegatedAmount))

        const conditionIdBorrow = await aaveBorrowCredit.generateId(
            agreementId,
            await aaveBorrowCredit.hashValues(
                did,
                delegatee,
                delegatedAsset,
                delegatedAmount))

        const conditionIdRepay = await aaveRepayCredit.generateId(
            agreementId,
            await aaveRepayCredit.hashValues(
                did,
                delegatee,
                delegatedAsset,
                delegatedAmount))

        const conditionIdTransfer = await transferNftCondition.generateId(
            agreementId,
            await transferNftCondition.hashValues(did, nftLockAddress, sender, 1, conditionIdRepay, nftTokenAddress))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdLock,
                conditionIdDeposit,
                conditionIdBorrow,
                conditionIdRepay,
                conditionIdTransfer
            ],
            timeLocks: [0, 0, 0, 0, 0],
            timeOuts: [0, 0, 0, 0, 0],
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
        it('Create a credit agreement', async () => {
            const { didRegistry, aaveCreditTemplate } = await setupTest()
            did = await didRegistry.hashDID(didSeed, owner)

            const {
                agreementId: _agreementId,
                agreement: _agreement,
                sender: _sender,
                checksum,
                url
            } = await prepareCreditTemplate({ did: did })
            agreementId = _agreementId
            agreement = _agreement
            sender = _sender

            await didRegistry.registerAttribute(didSeed, checksum, [], url, { from: owner })
            await erc721.mint(did)
            await erc721.approve(nftLockCondition.address, did)

            // Create agreement
            await aaveCreditTemplate.createAgreement(
                agreementId,
                lendingPoolAddress,
                dataProviderAddress,
                wethAddress,
                agreementFee,
                ...Object.values(agreement))

            // Get the vault address for this specific agreement
            vaultAddress = await aaveCreditTemplate.getVaultForAgreement(agreementId)
        })

        it('The borrower locks the NFT', async () => {
            // The borrower locks the NFT in the vault
            await nftLockCondition.fulfill(
                agreementId, did, nftLockAddress, 1, nftTokenAddress
            )
            const { state: stateNftLock } = await conditionStoreManager.getCondition(agreement.conditionIds[0])
            assert.strictEqual(stateNftLock.toNumber(), constants.condition.state.fulfilled)
            assert.strictEqual(nftLockAddress, await erc721.ownerOf(did))
        })

        it('Lender deposits ETH as collateral in Aave and approves delegatee to borrow DAI', async () => {
            // Fullfill the deposit collateral condition
            await aaveCollateralDeposit.fulfill(
                agreementId,
                did,
                vaultAddress,
                delegatee,
                collateralAsset,
                delegatedAsset,
                delegatedAmount,
                collateralAmount,
                {
                    from: delegator,
                    value: collateralAmount
                }
            )
            const { state: stateDeposit } = await conditionStoreManager.getCondition(
                agreement.conditionIds[1])
            assert.strictEqual(stateDeposit.toNumber(), constants.condition.state.fulfilled)

            // Vault instance
            const vault = await AaveCreditVault.at(vaultAddress)

            // Get the actual delegated amount for the delgatee in this specific asset
            const actualAmount = await vault.delegatedAmount(
                delegatee,
                delegatedAsset
            )

            // The delegated borrow amount in the vault should be the same that the
            // Delegegator allowed on deposit
            assert.strictEqual(actualAmount.toString(), delegatedAmount)
        })

        it('Borrower/Delegatee borrows DAI from Aave on behalf of Delegator', async () => {
            const dai = await ERC20Upgradeable.at(delegatedAsset)
            const before = await dai.balanceOf(delegatee)

            // Fullfill the aaveBorrowCredit condition
            // Delegatee borrows DAI from Aave on behalf of Delegator
            await aaveBorrowCredit.fulfill(
                agreementId,
                did,
                vaultAddress,
                delegatedAsset,
                delegatedAmount,
                {
                    from: delegatee
                }
            )
            const { state: stateCredit } = await conditionStoreManager.getCondition(
                agreement.conditionIds[2])
            assert.strictEqual(stateCredit.toNumber(), constants.condition.state.fulfilled)

            const after = await dai.balanceOf(delegatee)
            assert.strictEqual(BigNumber(after).minus(BigNumber(before)).toNumber(), BigNumber(delegatedAmount).toNumber())
        })

        it('Borrower/Delegatee can not get back the NFT without repay the loan', async () => {
            await assert.isRejected(
                transferNftCondition.fulfill(
                    agreementId,
                    did,
                    sender,
                    1,
                    agreement.conditionIds[3],
                    nftTokenAddress,
                    { from: delegatee }
                )
            )
            const { state: stateTransfer } = await conditionStoreManager.getCondition(
                agreement.conditionIds[4])
            assert.strictEqual(stateTransfer.toNumber(), constants.condition.state.unfulfilled)
        })

        it('Borrower/Delegatee repays the loan with DAI', async () => {
            const vault = await AaveCreditVault.at(vaultAddress)
            const totalDebt = await vault.getTotalActualDebt()
            const dai = await ERC20Upgradeable.at(delegatedAsset)
            const allowanceAmount = Number(totalDebt) + (Number(totalDebt) / 10000 * 1)

            // Delegatee allows Nevermined contracts spend DAI to repay the loan
            await dai.approve(aaveRepayCredit.address, allowanceAmount.toString(),
                { from: delegatee })

            // Send some DAI to delegatee to pay the debt + fees
            await dai.transfer(
                delegatee,
                (Number(totalDebt) - Number(delegatedAmount)).toString(),
                { from: daiProvider })

            // Fullfill the aaveRepayCredit condition
            await aaveRepayCredit.fulfill(
                agreementId,
                did,
                vaultAddress,
                delegatedAsset,
                { from: delegatee }
            )
            const { state: stateRepay } = await conditionStoreManager.getCondition(
                agreement.conditionIds[3])
            assert.strictEqual(stateRepay.toNumber(), constants.condition.state.fulfilled)

            const vaultBalancesAfter = await vault.getActualCreditDebt()
            // Compare the vault debt after repayment
            assert.strictEqual(BigNumber(vaultBalancesAfter).toNumber(), 0)
        })

        // it('Borrower/Delegatee get back the NFT', async () => {
        //     transferNftCondition.fulfill(
        //         agreementId,
        //         did,
        //         sender,
        //         1,
        //         agreement.conditionIds[3],
        //         nftTokenAddress,
        //         { from: delegatee }
        //     )

        //     const { state: stateTransfer } = await conditionStoreManager.getCondition(
        //         agreement.conditionIds[4])
        //     assert.strictEqual(stateTransfer.toNumber(), constants.condition.state.fulfilled)
        // })
    })
})
