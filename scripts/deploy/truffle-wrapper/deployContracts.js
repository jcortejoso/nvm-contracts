const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { ethers, upgrades, web3 } = require('hardhat')
const { exportArtifacts, exportLibraryArtifacts } = require('./artifacts')
const { loadWallet } = require('./wallets.js')

async function deployContracts({ contracts: origContracts, verbose, testnet, makeWallet }) {
    const contracts = evaluateContracts({
        contracts: origContracts,
        verbose,
        testnet
    })

    const { roles } = await loadWallet({ makeWallet })

    const DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await DIDRegistryLibrary.deploy()
    const h1 = didRegistryLibrary.deployTransaction.hash
    await didRegistryLibrary.deployed()
    const didRegistryLibraryAddress = (await web3.eth.getTransactionReceipt(h1)).contractAddress
    console.log('registry library', didRegistryLibraryAddress)

    const EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await EpochLibrary.deploy()
    const h2 = epochLibrary.deployTransaction.hash
    await epochLibrary.deployed()
    const epochLibraryAddress = (await web3.eth.getTransactionReceipt(h2)).contractAddress
    console.log('epoch library', epochLibraryAddress)

    const { cache, addressBook, proxies } = await initializeContracts({
        contracts,
        roles,
        network: '',
        didRegistryLibrary: didRegistryLibraryAddress,
        epochLibrary: epochLibraryAddress,
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

    addressBook.DIDRegistryLibrary = didRegistryLibraryAddress
    addressBook.EpochLibrary = epochLibraryAddress
    if (cache.PlonkVerifier) {
        addressBook.PlonkVerifier = proxies.PlonkVerifier
    }
    const libraries = {
        DIDRegistry: { DIDRegistryLibrary: didRegistryLibraryAddress },
        ConditionStoreManager: { EpochLibrary: epochLibraryAddress }
    }
    await exportArtifacts(contracts.filter(a => a !== 'AaveCreditVault'), addressBook, libraries)
    await exportLibraryArtifacts(['EpochLibrary', 'DIDRegistryLibrary'], addressBook)

    if (contracts.indexOf('AaveCreditVault') > -1) {
        await exportLibraryArtifacts(['AaveCreditVault'], addressBook)
    }

    return addressBook
}

module.exports = {
    deployContracts
}
