const { hardhatArguments, web3, ethers } = require('hardhat')
const network = hardhatArguments.network || 'hardhat'
const { EthersAdapter, SafeFactory } = require('@gnosis.pm/safe-core-sdk')
const fs = require('fs')

async function loadWallet({ makeWallet }) {
    const accounts = await web3.eth.getAccounts()
    console.log('Account', accounts)
    let wallets = [
        { name: 'owner', account: accounts[0] },
        { name: 'upgrader', account: accounts[0] }
    ]
    let contractNetworks = {}
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

        const chainId = await web3.eth.getChainId()

        contractNetworks[chainId] = {
            safeProxyFactoryAddress: factoryContract.address,
            safeMasterCopyAddress: safeContract.address,
            multiSendAddress: multiContract.address
        }

        const ethAdapterOwner1 = new EthersAdapter({ ethers, signer: ethers.provider.getSigner(0), contractNetworks })
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
            { name: 'owner', account: safe1.getAddress() },
            { name: 'upgrader', account: safe2.getAddress() }
        ]
        fs.writeFileSync(`wallets_${network}.json`, JSON.stringify({ wallets, contractNetworks }, null, 2))
    } else {
        try {
            const a = JSON.parse(fs.readFileSync(`wallets_${network}.json`))
            wallets = a.wallets
            contractNetworks = a.contractNetworks
        } catch (_) {
            console.log('Using default accounts')
        }
    }

    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: (wallets.find(a => a.name === 'owner') || { account: accounts[0] }).account,
        upgraderWallet: (wallets.find(a => a.name === 'upgrader') || { account: accounts[1] }).account,
        contractNetworks
    }
    return { roles, contractNetworks }
}

module.exports = {
    loadWallet
}
