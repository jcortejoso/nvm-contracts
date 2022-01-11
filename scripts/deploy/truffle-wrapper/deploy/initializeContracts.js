/* eslint-disable no-console */
const ZeroAddress = '0x0000000000000000000000000000000000000000'
const { ethers, upgrades } = require('hardhat')

async function zosCreate({ contract, args, libraries, verbose, cache }) {
    const C = await ethers.getContractFactory(contract, { libraries })
    const c = await upgrades.deployProxy(C, args, { unsafeAllowLinkedLibraries: true })
    await c.deployed()
    cache[contract] = c
    if (verbose) {
        console.log(`${contract}: ${c.address}`)
    }
    return c.address
}

async function initializeContracts({
    contracts,
    roles,
    didRegistryLibrary,
    epochLibrary,
    verbose = true
} = {}) {
    // Deploy all implementations in the specified network.
    // NOTE: Creates another zos.<network_name>.json file, specific to the network used,
    // which keeps track of deployed addresses, etc.

    // Here we run initialize which replace contract constructors
    // Since each contract initialize function could be different we can not use a loop
    // NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
    // instance=MyContract.at(proxyAddress)
    const addressBook = {}
    const cache = {}

    // WARNING!
    // use this only when deploying a selective portion of the contracts
    // Only use this if you know what you do, otherwise it can break the contracts deployed
    const proxies = {
        // if the application should be deployed with another token set the address here!
        // Token: '0xc778417e063141139fce010982780140aa0cd5ab'
    }

    // returns either the address from the address book or the address of the manual set proxies
    const getAddress = (contract) => {
        return addressBook[contract] || proxies[contract]
    }

    if (contracts.indexOf('NFTUpgradeable') > -1) {
        addressBook.NFTUpgradeable = await zosCreate({
            contract: 'NFTUpgradeable',
            cache,
            args: [''],
            verbose
        })
    }

    if (contracts.indexOf('NFT721Upgradeable') > -1) {
        addressBook.NFT721Upgradeable = await zosCreate({
            contract: 'NFT721Upgradeable',
            cache,
            args: [],
            verbose
        })
    }

    if (contracts.indexOf('DIDRegistry') > -1) {
        addressBook.DIDRegistry = await zosCreate({
            contract: 'DIDRegistry',
            cache,
            args: [roles.deployer, addressBook.NFTUpgradeable || ZeroAddress, addressBook.NFT721Upgradeable || ZeroAddress],
            libraries: { DIDRegistryLibrary: didRegistryLibrary },
            verbose
        })
    }

    // testnet only!
    if (contracts.indexOf('NeverminedToken') > -1) {
        addressBook.NeverminedToken = await zosCreate({
            contract: 'NeverminedToken',
            cache,
            args: [
                roles.ownerWallet,
                roles.deployer
            ],
            verbose
        })

        // propagate the token address it is used somewhere else
        proxies.Token = addressBook.NeverminedToken
    }

    // testnet only!
    if (
        contracts.indexOf('Dispenser') > -1 &&
        getAddress('Token')
    ) {
        addressBook.Dispenser = await zosCreate({
            contract: 'Dispenser',
            cache,
            args: [
                getAddress('Token'),
                roles.ownerWallet
            ],
            verbose
        })
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        addressBook.ConditionStoreManager = await zosCreate({
            contract: 'ConditionStoreManager',
            cache,
            libraries: { EpochLibrary: epochLibrary },
            args: [roles.deployer],
            verbose
        })
    }

    if (contracts.indexOf('PlonkVerifier') > -1) {
        const PlonkVerifier = await ethers.getContractFactory('PlonkVerifier')
        const plonkVerifier = await upgrades.deployProxy(PlonkVerifier)
        await plonkVerifier.deployed()
        cache.PlonkVerifier = plonkVerifier
        proxies.PlonkVerifier = plonkVerifier.address
    }

    if (contracts.indexOf('TemplateStoreManager') > -1) {
        addressBook.TemplateStoreManager = await zosCreate({
            contract: 'TemplateStoreManager',
            cache,
            args: [roles.deployer],
            verbose
        })
    }

    if (getAddress('ConditionStoreManager')) {
        if (contracts.indexOf('EscrowPaymentCondition') > -1) {
            addressBook.EscrowPaymentCondition = await zosCreate({
                contract: 'EscrowPaymentCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('SignCondition') > -1) {
            addressBook.SignCondition = await zosCreate({
                contract: 'SignCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('HashLockCondition') > -1) {
            addressBook.HashLockCondition = await zosCreate({
                contract: 'HashLockCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('ThresholdCondition') > -1) {
            addressBook.ThresholdCondition = await zosCreate({
                contract: 'ThresholdCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('WhitelistingCondition') > -1) {
            addressBook.WhitelistingCondition = await zosCreate({
                contract: 'WhitelistingCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFT721HolderCondition') > -1) {
            addressBook.NFT721HolderCondition = await zosCreate({
                contract: 'NFT721HolderCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFT721HolderCondition') > -1) {
            addressBook.NFT721HolderCondition = await zosCreate({
                contract: 'NFT721HolderCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFT721LockCondition') > -1) {
            addressBook.NFT721LockCondition = await zosCreate({
                contract: 'NFT721LockCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('AaveBorrowCondition') > -1) {
            addressBook.AaveBorrowCondition = await zosCreate({
                contract: 'AaveBorrowCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('AaveCollateralDepositCondition') > -1) {
            addressBook.AaveCollateralDepositCondition = await zosCreate({
                contract: 'AaveCollateralDepositCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('AaveCollateralWithdrawCondition') > -1) {
            addressBook.AaveCollateralWithdrawCondition = await zosCreate({
                contract: 'AaveCollateralWithdrawCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('AaveRepayCondition') > -1) {
            addressBook.AaveRepayCondition = await zosCreate({
                contract: 'AaveRepayCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('TemplateStoreManager') &&
        getAddress('DIDRegistry')) {
        if (contracts.indexOf('AgreementStoreManager') > -1) {
            addressBook.AgreementStoreManager = await zosCreate({
                contract: 'AgreementStoreManager',
                cache,
                args: [
                    roles.deployer,
                    getAddress('ConditionStoreManager'),
                    getAddress('TemplateStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('DIDRegistry')) {
        if (contracts.indexOf('LockPaymentCondition') > -1) {
            addressBook.LockPaymentCondition = await zosCreate({
                contract: 'LockPaymentCondition',
                cache,
                args: [
                    roles.deployer,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('TransferDIDOwnershipCondition') > -1) {
            addressBook.TransferDIDOwnershipCondition = await zosCreate({
                contract: 'TransferDIDOwnershipCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFTAccessCondition') > -1) {
            addressBook.NFTAccessCondition = await zosCreate({
                contract: 'NFTAccessCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (getAddress('PlonkVerifier') && contracts.indexOf('AccessProofCondition') > -1) {
            addressBook.AccessProofCondition = await zosCreate({
                contract: 'AccessProofCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('PlonkVerifier')
                ],
                verbose
            })
        }
    }
    if (getAddress('ConditionStoreManager') &&
        getAddress('NFTUpgradeable')) {
        if (contracts.indexOf('NFTHolderCondition') > -1) {
            addressBook.NFTHolderCondition = await zosCreate({
                contract: 'NFTHolderCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('NFTUpgradeable')
                ],
                verbose
            })
        }
        if (contracts.indexOf('TransferNFTCondition') > -1) {
            addressBook.TransferNFTCondition = await zosCreate({
                contract: 'TransferNFTCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('NFTUpgradeable'),
                    ZeroAddress
                ],
                verbose
            })
        }

        if (contracts.indexOf('NFTLockCondition') > -1) {
            addressBook.NFTLockCondition = await zosCreate({
                contract: 'NFTLockCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('NFTUpgradeable')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('AgreementStoreManager')) {
        if (contracts.indexOf('AccessCondition') > -1) {
            addressBook.AccessCondition = await zosCreate({
                contract: 'AccessCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('AgreementStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('ComputeExecutionCondition') > -1) {
            addressBook.ComputeExecutionCondition = await zosCreate({
                contract: 'ComputeExecutionCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('AgreementStoreManager')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('NFT721Upgradeable') &&
        getAddress('LockPaymentCondition')) {
        if (contracts.indexOf('TransferNFT721Condition') > -1) {
            addressBook.TransferNFT721Condition = await zosCreate({
                contract: 'TransferNFT721Condition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('NFT721Upgradeable'),
                    getAddress('LockPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('LockPaymentCondition')) {
        if (contracts.indexOf('DistributeNFTCollateralCondition') > -1) {
            addressBook.DistributeNFTCollateralCondition = await zosCreate({
                contract: 'DistributeNFTCollateralCondition',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('LockPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('DIDRegistry') &&
        getAddress('AccessCondition') &&
        getAddress('LockPaymentCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('AccessTemplate') > -1) {
            addressBook.AccessTemplate = await zosCreate({
                contract: 'AccessTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('AccessCondition'),
                    getAddress('LockPaymentCondition'),
                    getAddress('EscrowPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('DIDRegistry') &&
        getAddress('AccessProofCondition') &&
        getAddress('LockPaymentCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('AccessProofTemplate') > -1) {
            addressBook.AccessProofTemplate = await zosCreate({
                contract: 'AccessProofTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('AccessProofCondition'),
                    getAddress('LockPaymentCondition'),
                    getAddress('EscrowPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('DIDRegistry') &&
        getAddress('ComputeExecutionCondition') &&
        getAddress('LockPaymentCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('EscrowComputeExecutionTemplate') > -1) {
            addressBook.EscrowComputeExecutionTemplate = await zosCreate({
                contract: 'EscrowComputeExecutionTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('ComputeExecutionCondition'),
                    getAddress('LockPaymentCondition'),
                    getAddress('EscrowPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('NFTAccessCondition') &&
        getAddress('NFTHolderCondition')) {
        if (contracts.indexOf('NFTAccessTemplate') > -1) {
            addressBook.NFTAccessTemplate = await zosCreate({
                contract: 'NFTAccessTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('NFTHolderCondition'),
                    getAddress('NFTAccessCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('NFTAccessCondition') &&
        getAddress('NFT721HolderCondition')) {
        if (contracts.indexOf('NFT721AccessTemplate') > -1) {
            addressBook.NFT721AccessTemplate = await zosCreate({
                contract: 'NFT721AccessTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('NFT721HolderCondition'),
                    getAddress('NFTAccessCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('LockPaymentCondition') &&
        getAddress('TransferNFTCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('NFTSalesTemplate') > -1) {
            addressBook.NFTSalesTemplate = await zosCreate({
                contract: 'NFTSalesTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('LockPaymentCondition'),
                    getAddress('TransferNFTCondition'),
                    getAddress('EscrowPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('LockPaymentCondition') &&
        getAddress('TransferNFT721Condition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('NFT721SalesTemplate') > -1) {
            addressBook.NFT721SalesTemplate = await zosCreate({
                contract: 'NFT721SalesTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('LockPaymentCondition'),
                    getAddress('TransferNFT721Condition'),
                    getAddress('EscrowPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('LockPaymentCondition') &&
        getAddress('TransferDIDOwnershipCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('DIDSalesTemplate') > -1) {
            addressBook.DIDSalesTemplate = await zosCreate({
                contract: 'DIDSalesTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('LockPaymentCondition'),
                    getAddress('TransferDIDOwnershipCondition'),
                    getAddress('EscrowPaymentCondition')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('NFTLockCondition') &&
        getAddress('AaveCollateralDepositCondition') &&
        getAddress('AaveBorrowCondition') &&
        getAddress('AaveRepayCondition') &&
        getAddress('AaveCollateralWithdrawCondition') &&
        getAddress('DistributeNFTCollateralCondition')) {
        if (contracts.indexOf('AaveCreditTemplate') > -1) {
            addressBook.AaveCreditTemplate = await zosCreate({
                contract: 'AaveCreditTemplate',
                cache,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('NFTLockCondition'),
                    getAddress('AaveCollateralDepositCondition'),
                    getAddress('AaveBorrowCondition'),
                    getAddress('AaveRepayCondition'),
                    getAddress('AaveCollateralWithdrawCondition'),
                    getAddress('DistributeNFTCollateralCondition')
                ],
                verbose
            })
        }
    }

    return { cache, addressBook }
}

module.exports = initializeContracts
