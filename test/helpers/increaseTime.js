// https://stackoverflow.com/a/30452949

const times = x => async (f) => {
    if (x > 0) {
        await f()
        await times(x - 1)(f)
    }
}

const mineBlock = async (web3) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: Date.now()
            },
            (error, result) => {
                if (error) {
                    return reject(error)
                }

                resolve(result)
            }
        )
    })
}

const mineBlocks = async (web3, amount) => {
    await times(amount)(async () => await mineBlock(web3))
}

module.exports = {
    mineBlock,
    mineBlocks
}
