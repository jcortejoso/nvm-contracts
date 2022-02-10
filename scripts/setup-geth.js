const { web3 } = require('hardhat')
const fs = require('fs')

async function main() {
    const from = (await web3.eth.getAccounts())[0]
    const accounts = JSON.parse(fs.readFileSync('./networks/geth/genesis.json')).alloc
    for (const [addr, sum] of Object.entries(accounts)) {
        console.log(addr, sum)
        await web3.eth.sendTransaction({ to: addr, value: sum.balance, from })
    }
}

main()
