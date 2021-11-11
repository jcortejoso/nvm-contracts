/* global ethers */
const { upgrades } = require('hardhat')
const { readArtifact, writeArtifact } = require('./artifacts')
const evaluateContracts = require('./evaluateContracts.js')

async function upgradeContracts({ contracts: orig_contracts, verbose, testnet }) {
    const table = {}
    let contracts = []
    for (const e of orig_contracts) {
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

    for (const c of contracts) {
        const afact = readArtifact(c)
        const C = await ethers.getContractFactory(table[c] || c, { libraries: afact.libraries })
        if (verbose) {
            console.log(`upgrading ${c} at ${afact.address}`)
        }
        const contract = await upgrades.upgradeProxy(afact.address, C, { unsafeAllowLinkedLibraries: true })
        await contract.deployed()
        taskBook[c] = await writeArtifact(c, contract, afact.libraries)
    }
    return taskBook
}

module.exports = { upgradeContracts }
