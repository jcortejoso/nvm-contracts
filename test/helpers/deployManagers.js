/* global artifacts */
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')

const constants = require('./constants')
const testUtils = require('./utils')

const deployManagers = async function(deployer, owner) {
    const didRegistryLibrary = await DIDRegistryLibrary.new()
    const epochLibrary = await EpochLibrary.new({ from: deployer })

    const token = await testUtils.deploy('NeverminedToken', [owner, owner], deployer)
    const nvmConfig = await testUtils.deploy('NeverminedConfig', [owner, owner], deployer)
    const nft = await testUtils.deploy('NFTUpgradeable', [''], deployer)

    const didRegistry = await testUtils.deploy('DIDRegistry', [owner, nft.address, constants.address.zero], deployer, [didRegistryLibrary])

    const templateStoreManager = await testUtils.deploy('TemplateStoreManager', [owner], deployer)

    const conditionStoreManager = await testUtils.deploy(
        'ConditionStoreManager',
        [deployer, owner, nvmConfig.address],
        deployer,
        [epochLibrary]
    )

    const agreementStoreManager = await testUtils.deploy(
        'AgreementStoreManager',
        [owner, conditionStoreManager.address, templateStoreManager.address, didRegistry.address],
        deployer
    )

    if (testUtils.deploying) {
        await nft.addMinter(didRegistry.address, { from: deployer })
        await nft.setProxyApproval(didRegistry.address, true, { from: deployer })
        await conditionStoreManager.delegateCreateRole(
            agreementStoreManager.address,
            { from: owner }
        )
    }

    return {
        token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        nft,
        deployer,
        owner
    }
}

module.exports = deployManagers
