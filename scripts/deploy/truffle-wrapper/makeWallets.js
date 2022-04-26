const { loadWallet } = require('./wallets')

async function main() {
    const verbose = true

    const { roles } = await loadWallet({makeWallet: true})
    console.log(roles)
}

main()

