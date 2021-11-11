/* global web3 */
const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { ethers, network } = require('hardhat')
const { exportArtifacts } = require('./artifacts')

async function deployContracts({ contracts: origContracts, verbose, testnet }) {
    const contracts = evaluateContracts({
        contracts: origContracts,
        verbose,
        testnet
    })

    const accounts = await web3.eth.getAccounts()
    const DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await DIDRegistryLibrary.deploy()
    await didRegistryLibrary.deployed()
    const EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await EpochLibrary.deploy()
    await epochLibrary.deployed()

    let wallets = []
    try {
        wallets = JSON.parse(`wallets_${network}.json`)
    } catch (_) {
        console.log('Using default accounts')
    }

    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: (wallets.find(a => a.name === 'owner') || { account: accounts[2] }).account,
        upgraderWallet: (wallets.find(a => a.name === 'upgrader') || { account: accounts[3] }).account
    }

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

    // contracts.push('DIDRegistryLibrary')
    // contracts.push('EpochLibrary')
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
