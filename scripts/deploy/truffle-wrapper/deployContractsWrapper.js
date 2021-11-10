/* global artifacts, web3 */
const { argv } = require('yargs')
const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { ethers, network } = require('hardhat')
const { exportArtifacts } = require('./artifacts')

async function main() {
    const parameters = argv._
    const verbose = true
    const testnet = process.env.TESTNET === 'true'
    const contracts = evaluateContracts({
        contracts: parameters.splice(2),
        verbose,
        testnet
    })

    const accounts = await web3.eth.getAccounts()
    const DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await DIDRegistryLibrary.deploy()
    // const didRegistryLibrary = await upgrades.deployProxy(DIDRegistryLibrary)
    await didRegistryLibrary.deployed()
    const EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await EpochLibrary.deploy()
    // const epochLibrary = await upgrades.deployProxy(EpochLibrary)
    await epochLibrary.deployed()

    let wallets = []
    try {
        wallets = JSON.parse(`wallets_${network}.json`)
    } catch (_) {}

    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: accounts[2],
        upgraderWallet: accounts[3]
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
        artifacts,
        addressBook,
        roles,
        verbose
    })

    // contracts.push('DIDRegistryLibrary')
    // contracts.push('EpochLibrary')
    addressBook.DIDRegistryLibrary = didRegistryLibrary.address
    addressBook.EpochLibrary = epochLibrary.address
    addressBook.PlonkVerifier = cache.PlonkVerifier.address
    const libraries = {
        DIDRegistry: { DIDRegistryLibrary: didRegistryLibrary.address },
        ConditionStoreManager: { EpochLibrary: epochLibrary.address }
    }
    await exportArtifacts(contracts, addressBook, libraries)

    process.exit(0)
}

main()
