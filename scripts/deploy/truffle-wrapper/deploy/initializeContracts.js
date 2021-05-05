/* eslint-disable no-console */
const { zosCreate } = require('@nevermined-io/contract-tools')

async function initializeContracts({
    contracts,
    roles,
    network,
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

    if (contracts.indexOf('DIDRegistry') > -1) {
        addressBook.DIDRegistry = zosCreate({
            contract: 'DIDRegistry',
            network,
            args: [roles.deployer],
            verbose
        })
    }

    // testnet only!
    if (contracts.indexOf('NeverminedToken') > -1) {
        addressBook.NeverminedToken = zosCreate({
            contract: 'NeverminedToken',
            network,
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
        addressBook.Dispenser = zosCreate({
            contract: 'Dispenser',
            network,
            args: [
                getAddress('Token'),
                roles.ownerWallet
            ],
            verbose
        })
    }

    if (contracts.indexOf('ConditionStoreManager') > -1) {
        addressBook.ConditionStoreManager = zosCreate({
            contract: 'ConditionStoreManager',
            network,
            args: [roles.deployer],
            verbose
        })
    }

    if (contracts.indexOf('TemplateStoreManager') > -1) {
        addressBook.TemplateStoreManager = zosCreate({
            contract: 'TemplateStoreManager',
            network,
            args: [roles.deployer],
            verbose
        })
    }

    if (getAddress('ConditionStoreManager')) {
        if (contracts.indexOf('EscrowPaymentCondition') > -1) {
            addressBook.EscrowPaymentCondition = zosCreate({
                contract: 'EscrowPaymentCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('SignCondition') > -1) {
            addressBook.SignCondition = zosCreate({
                contract: 'SignCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('HashLockCondition') > -1) {
            addressBook.HashLockCondition = zosCreate({
                contract: 'HashLockCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('ThresholdCondition') > -1) {
            addressBook.ThresholdCondition = zosCreate({
                contract: 'ThresholdCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager')
                ],
                verbose
            })
        }

        if (contracts.indexOf('WhitelistingCondition') > -1) {
            addressBook.WhitelistingCondition = zosCreate({
                contract: 'WhitelistingCondition',
                network,
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
            addressBook.AgreementStoreManager = zosCreate({
                contract: 'AgreementStoreManager',
                network,
                args: [
                    roles.ownerWallet,
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
            addressBook.LockPaymentCondition = zosCreate({
                contract: 'LockPaymentCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFTHolderCondition') > -1) {
            addressBook.NFTHolderCondition = zosCreate({
                contract: 'NFTHolderCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFTAccessCondition') > -1) {
            addressBook.NFTAccessCondition = zosCreate({
                contract: 'NFTAccessCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('TransferNFTCondition') > -1) {
            addressBook.TransferNFTCondition = zosCreate({
                contract: 'TransferNFTCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('TransferDIDOwnershipCondition') > -1) {
            addressBook.TransferDIDOwnershipCondition = zosCreate({
                contract: 'TransferDIDOwnershipCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
        if (contracts.indexOf('NFTLockCondition') > -1) {
            addressBook.NFTLockCondition = zosCreate({
                contract: 'NFTLockCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('DIDRegistry')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('AgreementStoreManager')) {
        if (contracts.indexOf('AccessCondition') > -1) {
            addressBook.AccessCondition = zosCreate({
                contract: 'AccessCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('AgreementStoreManager')
                ],
                verbose
            })
        }
        if (contracts.indexOf('ComputeExecutionCondition') > -1) {
            addressBook.ComputeExecutionCondition = zosCreate({
                contract: 'ComputeExecutionCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('AgreementStoreManager')
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
            addressBook.AccessTemplate = zosCreate({
                contract: 'AccessTemplate',
                network,
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
        getAddress('ComputeExecutionCondition') &&
        getAddress('LockPaymentCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('EscrowComputeExecutionTemplate') > -1) {
            addressBook.EscrowComputeExecutionTemplate = zosCreate({
                contract: 'EscrowComputeExecutionTemplate',
                network,
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
            addressBook.NFTAccessTemplate = zosCreate({
                contract: 'NFTAccessTemplate',
                network,
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
        getAddress('LockPaymentCondition') &&
        getAddress('TransferNFTCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('NFTSalesTemplate') > -1) {
            addressBook.NFTSalesTemplate = zosCreate({
                contract: 'NFTSalesTemplate',
                network,
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
        getAddress('TransferDIDOwnershipCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('DIDSalesTemplate') > -1) {
            addressBook.DIDSalesTemplate = zosCreate({
                contract: 'DIDSalesTemplate',
                network,
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
        getAddress('LockPaymentCondition') &&
        getAddress('TransferNFTCondition') &&
        getAddress('EscrowPaymentCondition')) {
        if (contracts.indexOf('NFTSalesTemplate') > -1) {
            addressBook.NFTSalesTemplate = zosCreate({
                contract: 'NFTSalesTemplate',
                network,
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

    return addressBook
}

module.exports = initializeContracts
