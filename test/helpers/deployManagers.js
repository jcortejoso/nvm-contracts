/* global artifacts */
const EpochLibrary = artifacts.require('EpochLibrary')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const TestToken = artifacts.require('TestToken')

const deployManagers = async function(deployer, owner) {
    const token = await TestToken.new({ from: deployer })
    await token.initialize(owner, owner)

    const didRegistryLibrary = await DIDRegistryLibrary.new()
    await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
    const didRegistry = await DIDRegistry.new()
    await didRegistry.initialize(owner)

    const epochLibrary = await EpochLibrary.new({ from: deployer })
    await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
    const conditionStoreManager = await ConditionStoreManager.new({ from: deployer })

    const templateStoreManager = await TemplateStoreManager.new({ from: deployer })
    await templateStoreManager.initialize(
        owner,
        { from: deployer }
    )

    const agreementStoreLibrary = await AgreementStoreLibrary.new({ from: deployer })
    await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
    const agreementStoreManager = await AgreementStoreManager.new({ from: deployer })
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

    return {
        token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        deployer,
        owner
    }
}

module.exports = deployManagers
