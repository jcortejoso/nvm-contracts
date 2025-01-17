const { upgrades, ethers } = require('hardhat')
const { readArtifact, updateArtifact, writeArtifact } = require('./artifacts')
const evaluateContracts = require('./evaluateContracts.js')
const { EthersAdapter } = require('@gnosis.pm/safe-core-sdk')
const Safe = require('@gnosis.pm/safe-core-sdk')
const { loadWallet } = require('./wallets')

async function upgradeContracts({ contracts: origContracts, verbose, testnet }) {
    const table = {}
    let contracts = []
    for (const e of origContracts) {
        if (e.match(':')) {
            const [a, b] = e.split(':')
            table[b] = a
            contracts.push(b)
        } else {
            table[e] = e
            contracts.push(e)
        }
    }
    contracts = evaluateContracts({
        contracts,
        verbose,
        testnet
    })

    const taskBook = {}

    const { roles, contractNetworks } = await loadWallet({})

    for (const c of contracts) {
        if (c === 'PlonkVerifier') {
            console.log('Update PlonkVerifier with specific script')
            continue
        }
        if (c === 'AaveCreditVault') {
            console.log('AaveCreditVault not deployed')
            continue
        }
        const afact = readArtifact(c)
        const C = await ethers.getContractFactory(table[c] || c, { libraries: afact.libraries })
        if (verbose) {
            console.log(`upgrading ${c} at ${afact.address}`)
        }
        try {
            const contract = await upgrades.upgradeProxy(afact.address, C, { unsafeAllowLinkedLibraries: true })
            await contract.deployed()
            taskBook[c] = await writeArtifact(c, contract, afact.libraries)
        } catch (e) {
            console.log('Cannot upgrade', e)
            const address = await upgrades.prepareUpgrade(afact.address, C, { unsafeAllowLinkedLibraries: true })
            taskBook[c] = await updateArtifact(c, afact.address, address, afact.libraries)
            const prevAddress = await upgrades.erc1967.getImplementationAddress(afact.address)
            if (address === prevAddress) {
                console.log('Nothing to upgrade')
            } else {
                console.log('Multisig upgrade', address, prevAddress)
                const adminAddress = await upgrades.erc1967.getAdminAddress(afact.address)
                const adminABI = [
                    {
                        inputs: [
                            {
                                name: 'proxy',
                                type: 'address'
                            },
                            {
                                name: 'implementation',
                                type: 'address'
                            }
                        ],
                        name: 'upgrade',
                        stateMutability: 'nonpayable',
                        type: 'function'
                    }
                ]
                const admin = new ethers.Contract(adminAddress, adminABI)
                const tx = await admin.populateTransaction.upgrade(afact.address, address)

                const ethAdapterOwner1 = new EthersAdapter({ ethers, signer: ethers.provider.getSigner(0), contractNetworks })
                const ethAdapterOwner2 = new EthersAdapter({ ethers, signer: ethers.provider.getSigner(1), contractNetworks })
                const safeSdk1 = await Safe.default.create({ ethAdapter: ethAdapterOwner1, safeAddress: roles.upgraderWallet, contractNetworks })
                const safeTx = await safeSdk1.createTransaction({ ...tx, value: 0 })
                const txHash = await safeSdk1.getTransactionHash(safeTx)
                const res1 = await safeSdk1.approveTransactionHash(txHash)
                await res1.transactionResponse?.wait()
                const safeSdk2 = await Safe.default.create({ ethAdapter: ethAdapterOwner2, safeAddress: roles.upgraderWallet, contractNetworks })
                const res2 = await safeSdk2.executeTransaction(safeTx)
                await res2.transactionResponse?.wait()
            }
        }
    }
    return taskBook
}

module.exports = { upgradeContracts }
