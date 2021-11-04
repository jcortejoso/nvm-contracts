/* global artifacts, web3 */
const { argv } = require('yargs')
const { deployContracts } = require('@nevermined-io/contract-tools')
const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')

const { ethers, upgrades } = require("hardhat")

async function main() {
    const parameters = argv._
    let verbose = true
    let testnet = true
    const contracts = evaluateContracts({
        contracts: parameters.splice(2),
        verbose,
        testnet,
    })

    let accounts = await web3.eth.getAccounts()
    // console.log(web3.eth.accounts)

    // console.log(contracts)
    let DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await upgrades.deployProxy(DIDRegistryLibrary)
    await didRegistryLibrary.deployed()
    let EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await upgrades.deployProxy(EpochLibrary)
    await epochLibrary.deployed()

    let libs = {
        'DIDRegistryLibrary': didRegistryLibrary.address,
        'EpochLibrary': epochLibrary.address,
    }
/*
    for (let contract of contracts) {
        let libraries = {}
        for (const l of contract[1]) {
            libraries[l] = libs[l]
        }
        let C = await ethers.getContractFactory(contract[0], {libraries})
        const c = await upgrades.deployProxy(C, [], {initializer: false, unsafeAllowLinkedLibraries: true})
        await c.deployed()
        console.log(`${contract[0]}: ${c.address}`)
    }
*/

    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: accounts[2],
        upgraderWallet: accounts[3],
    }

    console.log(roles)
    const addressBook = await initializeContracts({
        contracts,
        roles,
        network: "",
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
