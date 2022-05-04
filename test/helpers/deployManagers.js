/* global artifacts */
const NeverminedConfig = artifacts.require('NeverminedConfig')
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const NeverminedToken = artifacts.require('NeverminedToken')
const NFT = artifacts.require('NFTUpgradeable')

const constants = require('./constants')
const testUtils = require('./utils')

let linked = false

const deployManagers = async function(deployer, owner) {
    const didRegistryLibrary = await DIDRegistryLibrary.new()
    const epochLibrary = await EpochLibrary.new({ from: deployer })
    /*
    if (!linked) {
        await DIDRegistry.link(didRegistryLibrary)

        await ConditionStoreManager.link(epochLibrary)
        linked = true
    }*/

    const token = await testUtils.deploy('NeverminedToken', [owner, owner], deployer)
    // NeverminedToken.new({ from: deployer })
    //await token.initialize(owner, owner)

    // const nvmConfig = await NeverminedConfig.new({ from: deployer })
    // await nvmConfig.initialize(owner, owner, { from: deployer })
    const nvmConfig = await testUtils.deploy('NeverminedConfig', [owner, owner], deployer)

    // const nft = await NFT.new()
    // await nft.initialize('')
    const nft = await testUtils.deploy('NFTUpgradeable', [''], deployer)

    // const didRegistry = await DIDRegistry.new()
    // await didRegistry.initialize(owner, nft.address, constants.address.zero)
    const didRegistry = await testUtils.deploy('DIDRegistry', [owner, nft.address, constants.address.zero], deployer, [didRegistryLibrary])
    await nft.addMinter(didRegistry.address, {from: deployer})
    await nft.setProxyApproval(didRegistry.address, true, {from: deployer})

    /*
    const templateStoreManager = await TemplateStoreManager.new({ from: deployer })
    await templateStoreManager.initialize(
        owner,
        { from: deployer }
    )*/
    const templateStoreManager = await testUtils.deploy('TemplateStoreManager', [owner], deployer)

    /*
    const conditionStoreManager = await ConditionStoreManager.new({ from: deployer })
    await conditionStoreManager.initialize(
        agreementStoreManager.address,
        owner,
        nvmConfig.address,
        { from: deployer }
    )*/

    const conditionStoreManager = await testUtils.deploy(
        'ConditionStoreManager',
        [deployer, owner, nvmConfig.address],
        deployer,
        [epochLibrary]
    )

    /*
    const agreementStoreManager = await AgreementStoreManager.new({ from: deployer })
    await agreementStoreManager.methods['initialize(address,address,address,address)'](
        owner,
        conditionStoreManager.address,
        templateStoreManager.address,
        didRegistry.address,
        { from: deployer }
    )
    */

    const agreementStoreManager = await testUtils.deploy(
        'AgreementStoreManager',
        [owner, conditionStoreManager.address, templateStoreManager.address, didRegistry.address],
        deployer
    )

    await conditionStoreManager.delegateCreateRole(
        agreementStoreManager.address,
        { from: owner }
    )

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
