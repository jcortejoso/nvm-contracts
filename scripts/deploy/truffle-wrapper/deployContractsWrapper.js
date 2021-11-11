const { argv } = require('yargs')
const { deployContracts } = require('./deployContracts')

async function main() {
    const verbose = true
    const testnet = process.env.TESTNET === 'true'
    await deployContracts({
        contracts: argv._.splice(2),
        verbose,
        makeWallet: true,
        testnet
    })
    process.exit(0)
}

main()
