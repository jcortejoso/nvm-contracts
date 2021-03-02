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
            args: [roles.ownerWallet],
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
        if (contracts.indexOf('NftHolderCondition') > -1) {
            addressBook.NftHolderCondition = zosCreate({
                contract: 'NftHolderCondition',
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

    if (
        getAddress('ConditionStoreManager') &&
        getAddress('Token')
    ) {
        if (contracts.indexOf('LockRewardCondition') > -1) {
            addressBook.LockRewardCondition = zosCreate({
                contract: 'LockRewardCondition',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('Token')
                ],
                verbose
            })
        }

        if (contracts.indexOf('EscrowReward') > -1) {
            addressBook.EscrowReward = zosCreate({
                contract: 'EscrowReward',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('ConditionStoreManager'),
                    getAddress('Token')
                ],
                verbose
            })
        }
    }

    if (getAddress('ConditionStoreManager') &&
        getAddress('AgreementStoreManager')) {
        if (contracts.indexOf('AccessSecretStoreCondition') > -1) {
            addressBook.AccessSecretStoreCondition = zosCreate({
                contract: 'AccessSecretStoreCondition',
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

    if (getAddress('ConditionStoreManager') &&
        getAddress('AgreementStoreManager')) {
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
        getAddress('AccessSecretStoreCondition') &&
        getAddress('LockRewardCondition') &&
        getAddress('EscrowReward')) {
        if (contracts.indexOf('EscrowAccessSecretStoreTemplate') > -1) {
            addressBook.EscrowAccessSecretStoreTemplate = zosCreate({
                contract: 'EscrowAccessSecretStoreTemplate',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('AccessSecretStoreCondition'),
                    getAddress('LockRewardCondition'),
                    getAddress('EscrowReward')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('DIDRegistry') &&
        getAddress('ComputeExecutionCondition') &&
        getAddress('LockRewardCondition') &&
        getAddress('EscrowReward')) {
        if (contracts.indexOf('EscrowComputeExecutionTemplate') > -1) {
            addressBook.EscrowComputeExecutionTemplate = zosCreate({
                contract: 'EscrowComputeExecutionTemplate',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('ComputeExecutionCondition'),
                    getAddress('LockRewardCondition'),
                    getAddress('EscrowReward')
                ],
                verbose
            })
        }
    }

    if (getAddress('AgreementStoreManager') &&
        getAddress('DIDRegistry') &&
        getAddress('AccessSecretStoreCondition') &&
        getAddress('NftHolderCondition')) {
        if (contracts.indexOf('NFTAccessTemplate') > -1) {
            addressBook.NFTAccessTemplate = zosCreate({
                contract: 'NFTAccessTemplate',
                network,
                args: [
                    roles.ownerWallet,
                    getAddress('AgreementStoreManager'),
                    getAddress('DIDRegistry'),
                    getAddress('NftHolderCondition'),
                    getAddress('AccessSecretStoreCondition')
                ],
                verbose
            })
        }
    }

    return addressBook
}

module.exports = initializeContracts
