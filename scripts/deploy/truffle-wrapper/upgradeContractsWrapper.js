/* global ethers */
const { upgrades } = require('hardhat')
const { argv } = require('yargs')
const { readArtifact, writeArtifact } = require('./artifacts')
const evaluateContracts = require('./evaluateContracts.js')

async function main() {
    const parameters = argv._
    const verbose = true
    const testnet = process.env.TESTNET === 'true'
    const contracts = evaluateContracts({
        contracts: parameters.splice(2),
        verbose,
        testnet
    })

    for (const c of contracts) {
        const afact = readArtifact(c)
        const C = await ethers.getContractFactory(c, { libraries: afact.libraries })
        console.log(`upgrading ${c} at ${afact.address}`)
        const contract = await upgrades.upgradeProxy(afact.address, C, { unsafeAllowLinkedLibraries: true })
        await contract.deployed()
        await writeArtifact(c, contract, afact.libraries)
    }
}

main()
