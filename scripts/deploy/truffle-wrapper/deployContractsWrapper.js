/* global artifacts, web3 */
const { argv } = require('yargs')
const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')

const { ethers, upgrades } = require('hardhat')

async function main() {
    const parameters = argv._
    const verbose = true
    const testnet = true
    const contracts = evaluateContracts({
        contracts: parameters.splice(2),
        verbose,
        testnet
    })

    const accounts = await web3.eth.getAccounts()
    // console.log(web3.eth.accounts)

    // console.log(contracts)
    const DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await upgrades.deployProxy(DIDRegistryLibrary)
    await didRegistryLibrary.deployed()
    const EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await upgrades.deployProxy(EpochLibrary)
    await epochLibrary.deployed()

    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: accounts[2],
        upgraderWallet: accounts[3]
    }

    console.log(roles)
    const addressBook = await initializeContracts({
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

    process.exit(0)
}

main()
