/* eslint-disable no-console */

async function approveTemplate({
    TemplateStoreManagerInstance,
    roles,
    templateAddress
} = {}) {
    const contractOwner = await TemplateStoreManagerInstance.owner()
    if (contractOwner === roles.deployer) {
        try {
            await TemplateStoreManagerInstance.approveTemplate(
                templateAddress,
                { from: roles.deployer, gas: 100000 }
            )
        } catch (e) {
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

        await TemplateStoreManagerInstance.proposeTemplate(
            templateAddress,
            { from: roles.deployer }
        )

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
        await ContractInstance.transferOwnership(
            roles.ownerWallet,
            { from: roles.deployer }
        )
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
    verbose = true
} = {}) {
    /*
     * -----------------------------------------------------------------------
     * Reset deployer account, because it will be left in a strange state
     * sometimes by zeppelin os
     * -----------------------------------------------------------------------
     */
    await web3.eth.sendTransaction({
        from: roles.deployer,
        to: roles.deployer,
        value: 0,
        nonce: await web3.eth.getTransactionCount(roles.deployer)
    })

    /*
     * -----------------------------------------------------------------------
     * setup deployed contracts
     * -----------------------------------------------------------------------
     */
    if (addressBook.TemplateStoreManager) {
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

        await transferOwnership({
            ContractInstance: TemplateStoreManagerInstance,
            name: 'TemplateStoreManager',
            roles,
            verbose
        })
    }

    if (addressBook.ConditionStoreManager) {
        const ConditionStoreManagerInstance = artifacts.ConditionStoreManager

        if (addressBook.AgreementStoreManager) {
            if (verbose) {
                console.log(
                    `Delegating create role to ${addressBook.AgreementStoreManager}`
                )
            }

            await ConditionStoreManagerInstance.delegateCreateRole(
                addressBook.AgreementStoreManager,
                { from: roles.deployer }
            )
        }

        await transferOwnership({
            ContractInstance: ConditionStoreManagerInstance,
            name: 'ConditionStoreManager',
            roles,
            verbose
        })
    }

    if (addressBook.TransferDIDOwnershipCondition && addressBook.DIDRegistry) {
        const DIDRegistryInstance = artifacts.DIDRegistry

        console.log('TransferDIDOwnershipCondition : ' + addressBook.TransferDIDOwnershipCondition)
        await DIDRegistryInstance.setManager(
            addressBook.TransferDIDOwnershipCondition, { from: roles.deployer })
    }

    if (addressBook.TransferNFTCondition && addressBook.DIDRegistry) {
        const DIDRegistryInstance = artifacts.DIDRegistry

        console.log('TransferNFTCondition : ' + addressBook.TransferNFTCondition)
        await DIDRegistryInstance.setProxyApproval(
            addressBook.TransferNFTCondition, true, { from: roles.deployer })
    }

    if (addressBook.DIDRegistry) {
        const DIDRegistryInstance = artifacts.DIDRegistry

        await transferOwnership({
            ContractInstance: DIDRegistryInstance,
            name: 'DIDRegistry',
            roles,
            verbose
        })
    }

    if (addressBook.NeverminedToken) {
        const token = artifacts.NeverminedToken

        if (addressBook.Dispenser) {
            if (verbose) {
                console.log(
                    `adding dispenser as a minter ${addressBook.Dispenser} from ${roles.deployer}`
                )
            }

            await token.grantRole(
                web3.utils.toHex('minter').padEnd(66, '0'),
                addressBook.Dispenser,
                { from: roles.deployer }
            )
        }

        if (verbose) {
            console.log(
                `Renouncing deployer as initial minter from ${roles.deployer}`
            )
        }

        // await token.renounceMinter({ from: roles.deployer })
        await token.revokeRole(
            web3.utils.toHex('minter').padEnd(66, '0'),
            roles.deployer,
            { from: roles.deployer }
        )
    }
}

module.exports = setupContracts
