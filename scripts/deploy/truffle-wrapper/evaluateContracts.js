/* eslint-disable no-console */
// List of contracts
// eslint-disable-next-line security/detect-non-literal-require
const contractNames = require(`${process.env.PWD}/contracts.json`)
const { argv } = require('yargs')
const fs = require('fs')

function evaluateContracts({
    contracts,
    testnet,
    verbose
} = {}) {
    if (!contracts || contracts.length === 0) {
        // contracts not supplied, loading from disc
        contracts = contractNames

        // if we are on a testnet, add dispenser
        if (
            (testnet || argv['with-token']) &&
            contracts.indexOf('NeverminedToken') < 0
        ) {
            // deploy the NeverminedTokens if we are in a testnet
            contracts.push('NeverminedToken')
        }

        // if we are on a testnet, add dispenser
        if (testnet && contracts.indexOf('Dispenser') < 0) {
            // deploy the Dispenser if we are in a testnet
            contracts.push('Dispenser')
        }
    }

    // do alias detection
    for (const contract of contracts) {
        const c = contract.split(':')
        if (c.length < 2) continue
        const [original, alias] = c
        const basePath = './build/contracts'
        const src = `${basePath}/${original}.json`
        const dest = `${basePath}/${alias}.json`

        // replace with the alias
        contracts.splice(contracts.indexOf(contract), 1, alias)

        // avoid overriding
        if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest)
            if (verbose) {
                console.log(
                    `Copied contract artifact: '${original}' to '${alias}'`
                )
            }
        }
    }

    if (verbose) {
        console.log(
            `Contracts: '${contracts.join(', ')}'`
        )
    }

    return contracts
}

module.exports = evaluateContracts
