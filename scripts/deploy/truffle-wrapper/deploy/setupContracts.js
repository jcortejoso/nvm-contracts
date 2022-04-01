/* eslint-disable no-console */
const ZeroAddress = '0x0000000000000000000000000000000000000000'

async function approveTemplate({
    TemplateStoreManagerInstance,
    roles,
    templateAddress
} = {}) {
    const contractOwner = await TemplateStoreManagerInstance.owner()
    if (contractOwner === roles.deployer) {
        try {
            const tx = await TemplateStoreManagerInstance.approveTemplate(
                templateAddress,
                { from: roles.deployer, gasLimit: 100000 }
            )
            await tx.wait()
        } catch (e) {
            console.log(e)
            console.log('Approve failed for', templateAddress, roles.deployer, TemplateStoreManagerInstance.address)
        }
    } else {
        // todo: make call to multi sig wallet here instead of warning!
        console.log('=====================================================================================')
        console.log(`WARNING: Template ${templateAddress} could not be approved!`)
        console.log('The deployer is not anymore the owner of the TemplateStoreManager ')
        console.log('=====================================================================================')
    }
}

async function setupTemplate({ verbose, TemplateStoreManagerInstance, templateName, addressBook, roles } = {}) {
    const templateAddress = addressBook[templateName]
    if (templateAddress) {
        if (verbose) {
            console.log(
                `Proposing template ${templateName}: ${templateAddress} from ${roles.deployer}`
            )
        }

        try {
            const tx = await TemplateStoreManagerInstance.proposeTemplate(
                templateAddress,
                { from: roles.deployer }
            )
            await tx.wait()
        } catch (err) {
            console.log(`Warning: template ${templateName} already proposed`)
            console.log(err)
        }

        if (verbose) {
            console.log(
                `Approving template ${templateName}: ${templateAddress} from ${roles.deployer}`
            )
        }

        await approveTemplate({
            TemplateStoreManagerInstance,
            roles,
            templateAddress
        })
    }
}

async function transferOwnership({
    ContractInstance,
    name,
    roles,
    verbose
} = {}) {
    if (verbose) {
        console.log(
            `Transferring ownership of ${name} from ${roles.deployer} to ${roles.ownerWallet}`
        )
    }

    const contractOwner = await ContractInstance.owner()
    if (contractOwner === roles.deployer) {
        const tx = await ContractInstance.transferOwnership(
            roles.ownerWallet,
            { from: roles.deployer }
        )
        await tx.wait()
    } else {
        console.log('=====================================================================================')
        console.log('WARNING: Ownership was not transferred!')
        console.log(`The deployer is not anymore the owner of the ${name} `)
        console.log('=====================================================================================')
    }
}

async function setupContracts({
    web3,
    artifacts,
    addressBook,
    roles,
    verbose = true,
    addresses
} = {}) {
    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */
    if (!addresses.stage) {
        addresses.stage = 0
    }
    if (addressBook.TemplateStoreManager && addresses.stage < 1) {
        const TemplateStoreManagerInstance = artifacts.TemplateStoreManager

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'AccessTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'AccessProofTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'EscrowComputeExecutionTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFTAccessTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFT721AccessTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFTSalesTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFTSalesWithAccessTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFTAccessProofTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFTAccessSwapTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFT721SalesWithAccessTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFT721AccessProofTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFT721AccessSwapTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'NFT721SalesTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'DIDSalesTemplate',
            addressBook,
            roles
        })

        await setupTemplate({
            verbose,
            TemplateStoreManagerInstance,
            templateName: 'AaveCreditTemplate',
            addressBook,
            roles
        })

        await transferOwnership({
            ContractInstance: TemplateStoreManagerInstance,
            name: 'TemplateStoreManager',
            roles,
            verbose
        })
        addresses.stage = 1
    }

    if (addressBook.ConditionStoreManager && addresses.stage < 2) {
        const ConditionStoreManagerInstance = artifacts.ConditionStoreManager

        if (addressBook.AgreementStoreManager) {
            if (verbose) {
                console.log(
                    `Delegating create role to ${addressBook.AgreementStoreManager}`
                )
            }

            const tx = await ConditionStoreManagerInstance.delegateCreateRole(
                addressBook.AgreementStoreManager,
                { from: roles.deployer }
            )
            await tx.wait()
        }

        if (addressBook.EscrowPaymentCondition) {
            if (verbose) {
                console.log(
                    `Linking escrow to condition store manager ${addressBook.EscrowPaymentCondition}`
                )
            }

            const tx = await ConditionStoreManagerInstance.grantProxyRole(
                addressBook.EscrowPaymentCondition,
                { from: roles.deployer }
            )
            await tx.wait()
        }

        await transferOwnership({
            ContractInstance: ConditionStoreManagerInstance,
            name: 'ConditionStoreManager',
            roles,
            verbose
        })
        addresses.stage = 2
    }

    if (addressBook.NFTUpgradeable && addressBook.DIDRegistry && addresses.stage < 3) {
        const NFTInstance = artifacts.NFTUpgradeable

        console.log('Set NFT minter : ' + addressBook.NFTUpgradeable)
        const tx = await NFTInstance.addMinter(
            addressBook.DIDRegistry, { from: roles.deployer })
        await tx.wait()
        const tx2 = await NFTInstance.setProxyApproval(
            addressBook.DIDRegistry, true, { from: roles.deployer })
        await tx2.wait()
        addresses.stage = 3
    }

    if (addressBook.LockPaymentCondition && addressBook.AgreementStoreManager && addresses.stage < 4) {
        console.log('Set lock payment condition proxy : ' + addressBook.LockPaymentCondition)
        const tx = await artifacts.LockPaymentCondition.grantProxyRole(
            addressBook.AgreementStoreManager, { from: roles.deployer })
        await tx.wait()
        addresses.stage = 4
    }

    if (addresses.stage < 5 && addresses.stage < 5) {
        const agreements = [
            'NFTAccessTemplate',
            'NFTSalesTemplate',
            'NFT721AccessTemplate',
            'NFT721SalesTemplate',
            'AaveCreditTemplate',
            'AccessProofTemplate',
            'AccessTemplate',
            'DIDSalesTemplate',
            'DynamicAccessTemplate',
            'EscrowComputeExecutionTemplate'
        ]
        for (const a of agreements) {
            if (addressBook[a] && addressBook.AgreementStoreManager) {
                console.log('Set agreement manager proxy : ' + addressBook[a])
                const tx = await artifacts.AgreementStoreManager.grantProxyRole(
                    addressBook[a], { from: roles.deployer })
                await tx.wait()
            }
        }
        addresses.stage = 5
    }

    if (addressBook.LockPaymentCondition && addresses.stage < 6) {
        await transferOwnership({
            ContractInstance: artifacts.LockPaymentCondition,
            name: 'LockPaymentCondition',
            roles,
            verbose
        })
        addresses.stage = 6
    }

    if (addressBook.AgreementStoreManager && addresses.stage < 7) {
        await transferOwnership({
            ContractInstance: artifacts.AgreementStoreManager,
            name: 'AgreementStoreManager',
            roles,
            verbose
        })
        addresses.stage = 7
    }

    if (addressBook.NFT721Upgradeable && addressBook.DIDRegistry && addresses.stage < 8) {
        const NFT721Instance = artifacts.NFT721Upgradeable

        console.log('Set NFT721 minter : ' + addressBook.NFT721Upgradeable)
        const tx = await NFT721Instance.addMinter(
            addressBook.DIDRegistry, { from: roles.deployer })
        await tx.wait()
        addresses.stage = 8
    }

    if (addressBook.TransferDIDOwnershipCondition && addressBook.DIDRegistry && addresses.stage < 9) {
        const DIDRegistryInstance = artifacts.DIDRegistry

        console.log('TransferDIDOwnershipCondition : ' + addressBook.TransferDIDOwnershipCondition)
        const tx = await DIDRegistryInstance.setManager(
            addressBook.TransferDIDOwnershipCondition, { from: roles.deployer })
        await tx.wait()
        addresses.stage = 9
    }

    if (addressBook.TransferNFTCondition && addressBook.NFTUpgradeable && addresses.stage < 10) {
        const NFTInstance = artifacts.NFTUpgradeable

        console.log('TransferNFTCondition : ' + addressBook.TransferNFTCondition)
        const tx = await NFTInstance.setProxyApproval(
            addressBook.TransferNFTCondition, true, { from: roles.deployer })
        await tx.wait()
        addresses.stage = 10
    }

    if (addressBook.TransferNFTCondition && addressBook.DIDRegistry && addresses.stage < 11) {
        const NFTInstance = artifacts.NFTUpgradeable

        console.log('DIDRegistry : ' + addressBook.DIDRegistry)
        const tx = await NFTInstance.setProxyApproval(
            addressBook.DIDRegistry, true, { from: roles.deployer })
        await tx.wait()
        addresses.stage = 11
    }

    if (addressBook.TransferNFT721Condition && addressBook.NFT721Upgradeable && addresses.stage < 12) {
        const NFT721Instance = artifacts.NFT721Upgradeable

        console.log('TransferNFT721Condition : ' + addressBook.TransferNFT721Condition)
        const tx = await NFT721Instance.setProxyApproval(
            addressBook.TransferNFT721Condition, true, { from: roles.deployer })
        await tx.wait()
        addresses.stage = 12
    }

    if (addressBook.DIDRegistry && addresses.stage < 13) {
        const DIDRegistryInstance = artifacts.DIDRegistry

        await transferOwnership({
            ContractInstance: DIDRegistryInstance,
            name: 'DIDRegistry',
            roles,
            verbose
        })
        addresses.stage = 13
    }

    if (addressBook.NeverminedToken && addresses.stage < 14) {
        const token = artifacts.NeverminedToken

        if (addressBook.Dispenser) {
            if (verbose) {
                console.log(
                    `adding dispenser as a minter ${addressBook.Dispenser} from ${roles.deployer}`
                )
            }

            const tx = await token.grantRole(
                web3.utils.toHex('minter').padEnd(66, '0'),
                addressBook.Dispenser,
                { from: roles.deployer }
            )
            await tx.wait()
        }

        if (verbose) {
            console.log(
                `Renouncing deployer as initial minter from ${roles.deployer}`
            )
        }

        const tx = await token.revokeRole(
            web3.utils.toHex('minter').padEnd(66, '0'),
            roles.deployer,
            { from: roles.deployer }
        )
        await tx.wait()
        addresses.stage = 14
    }

    if (addressBook.NeverminedConfig && addresses.stage < 15) {
        const nvmConfig = artifacts.NeverminedConfig
        console.log('NeverminedConfig : ' + addressBook.NeverminedConfig)

        const configMarketplaceFee = Number(process.env.NVM_MARKETPLACE_FEE || '0')
        const configFeeReceiver = process.env.NVM_RECEIVER_FEE || ZeroAddress

        const isGovernor = await nvmConfig.isGovernor(roles.governorWallet)
        console.log('Is governorWallet NeverminedConfig governor? ' + isGovernor)

        const tx = await nvmConfig.setMarketplaceFees(
            configMarketplaceFee, configFeeReceiver, { from: roles.governorWallet }
        )
        await tx.wait()

        addresses.stage = 15
    }
}

module.exports = setupContracts
