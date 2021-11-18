const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { ethers, upgrades, web3 } = require('hardhat')
const { exportArtifacts } = require('./artifacts')
const { loadWallet } = require('./wallets.js')

async function deployContracts({ contracts: origContracts, verbose, testnet, makeWallet }) {
    const contracts = evaluateContracts({
        contracts: origContracts,
        verbose,
        testnet
    })

    const DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await DIDRegistryLibrary.deploy()
    await didRegistryLibrary.deployed()
    const EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await EpochLibrary.deploy()
    await epochLibrary.deployed()

    const { roles } = await loadWallet({ makeWallet })

    const { cache, addressBook } = await initializeContracts({
        contracts,
        roles,
        network: '',
        didRegistryLibrary: didRegistryLibrary.address,
        epochLibrary: epochLibrary.address,
        verbose
    })

    await setupContracts({
        web3,
        addressBook,
        artifacts: cache,
        roles,
        verbose
    })

    // Move proxy admin to upgrader wallet
    await upgrades.admin.transferProxyAdminOwnership(roles.upgraderWallet)

    addressBook.DIDRegistryLibrary = didRegistryLibrary.address
    addressBook.EpochLibrary = epochLibrary.address
    if (cache.PlonkVerifier) {
        addressBook.PlonkVerifier = cache.PlonkVerifier.address
    }
    const libraries = {
        DIDRegistry: { DIDRegistryLibrary: didRegistryLibrary.address },
        ConditionStoreManager: { EpochLibrary: epochLibrary.address }
    }
    await exportArtifacts(contracts, addressBook, libraries)
    return addressBook
}

module.exports = {
    deployContracts
}
