/* global web3 */
const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { ethers, network } = require('hardhat')
const { exportArtifacts } = require('./artifacts')
const { EthersAdapter, Safe, SafeFactory, SafeAccountConfig } = require('@gnosis.pm/safe-core-sdk')
const fs = require('fs')

async function deployContracts({ contracts: origContracts, verbose, testnet, makeWallet }) {
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
    if (makeWallet) {

        const SafeContract = await ethers.getContractFactory('GnosisSafe')
        const safeContract = await SafeContract.deploy()
        await safeContract.deployed()
        const FactoryContract = await ethers.getContractFactory('GnosisSafeProxyFactory')
        const factoryContract = await FactoryContract.deploy()
        await factoryContract.deployed()
        const MultiContract = await ethers.getContractFactory('MultiSend')
        const multiContract = await MultiContract.deploy()
        await multiContract.deployed()

        let param = '0xb63e800d000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000'
        
        const contractNetworks = {
            31337: {
                safeProxyFactoryAddress: factoryContract.address,
                safeMasterCopyAddress: safeContract.address,
                multiSendAddress: multiContract.address
            }
        }

        const ethAdapterOwner1 = new EthersAdapter({ ethers,  signer: ethers.provider.getSigner(0), contractNetworks })
        const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapterOwner1, contractNetworks })
        const safe1 = await safeFactory.deploySafe({
            owners: [accounts[0], accounts[1]],
            threshold: 2
        })
        const safe2 = await safeFactory.deploySafe({
            owners: [accounts[0], accounts[1]],
            threshold: 2
        })
        wallets = [
            {name: "owner", account: safe1.getAddress()},
            {name: "upgrader", account: safe2.getAddress()}
        ]
        fs.writeFileSync(`wallets_${network}.json`, JSON.stringify(wallets, null, 2))
    } else {
        try {
            wallets = JSON.parse(fs.readFileSync(`wallets_${network}.json`))
        } catch (_) {
            console.log('Using default accounts')
        }
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
