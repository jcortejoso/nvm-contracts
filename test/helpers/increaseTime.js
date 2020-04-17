const testUtils = require('./utils')
const web3 = testUtils.getWeb3()

// https://stackoverflow.com/a/30452949
const times = x => f => {
    if (x > 0) {
        f()
        times(x - 1)(f)
    }
}

// source: https://michalzalecki.com/ethereum-test-driven-introduction-to-solidity-part-2/
const increaseTimeOnce = function() {
    const id = Date.now()
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [1],
                id: id
            },
            err1 => {
                if (err1) return reject(err1)

                web3.currentProvider.send(
                    {
                        jsonrpc: '2.0',
                        method: 'evm_mine',
                        id: id + 1
                    },
                    (err2, res) => {
                        return err2 ? reject(err2) : resolve(res)
                    }
                )
            }
        )
    })
}

const increaseTime = async (duration) => {
    times(duration)(() => increaseTimeOnce())
}

module.exports = increaseTime
