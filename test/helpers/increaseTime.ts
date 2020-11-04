// https://stackoverflow.com/a/30452949
const times = (x: number) => async (f: Function) => {
  if (x > 0) {
    await f()
    await times(x - 1)(f)
  }
}

const mineBlock = async () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        id: Date.now(),
      },
      (error: Error, result: any) => {
        if (error) {
          return reject(error)
        }

        resolve(result)
      }
    )
  })
}

const mineBlocks = async (amount: number) => {
  await times(amount)(async () => await mineBlock())
}

module.exports = {
  mineBlock,
  mineBlocks,
}
