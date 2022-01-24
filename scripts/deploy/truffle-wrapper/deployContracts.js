const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { ethers, upgrades, web3 } = require('hardhat')
const { exportArtifacts, exportLibraryArtifacts } = require('./artifacts')
const { loadWallet } = require('./wallets.js')

async function deployLibrary(name, addresses) {
    if (addresses[name]) {
        console.log(`Contract ${name} found from cache`)
        return addresses[name]
    } else {
        const factory = await ethers.getContractFactory(name)
        const library = await factory.deploy()
        const h1 = library.deployTransaction.hash
        await library.deployed()
        const address = (await web3.eth.getTransactionReceipt(h1)).contractAddress
        addresses[name] = address
        return address
    }
}

async function deployContracts({ contracts: origContracts, verbose, testnet, makeWallet, addresses }) {
    const contracts = evaluateContracts({
        contracts: origContracts,
        verbose,
        testnet
    })

    const { roles } = await loadWallet({ makeWallet })

    const didRegistryLibraryAddress = await deployLibrary('DIDRegistryLibrary', addresses)
    console.log('registry library', didRegistryLibraryAddress)

    const epochLibraryAddress = await deployLibrary('EpochLibrary', addresses)
    console.log('epoch library', epochLibraryAddress)

    const { cache, addressBook, proxies } = await initializeContracts({
        contracts,
        roles,
        network: '',
        didRegistryLibrary: didRegistryLibraryAddress,
        epochLibrary: epochLibraryAddress,
        verbose,
        addresses
    })

    await setupContracts({
        web3,
        addressBook,
        artifacts: cache,
        roles,
        verbose,
        addresses
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
    await exportArtifacts(contracts.filter(a => a !== 'AaveCreditVault' && a !== 'PlonkVerifier'), addressBook, libraries)
    await exportLibraryArtifacts(['EpochLibrary', 'DIDRegistryLibrary'], addressBook)

    if (contracts.indexOf('AaveCreditVault') > -1) {
        await exportLibraryArtifacts(['AaveCreditVault'], addressBook)
    }

    return addressBook
}

module.exports = {
    deployContracts
}
