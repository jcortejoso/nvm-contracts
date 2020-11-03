/* eslint-env mocha */
/* global assert */

const utils = {
  generateId: () => {
    return web3.utils.sha3(Math.random().toString())
  },

  assertEmitted: (result, n, name) => {
    let gotEvents = 0
    for (let i = 0; i < result.logs.length; i++) {
      const ev = result.logs[i]
      if (ev.event === name) {
        gotEvents++
      }
    }
    assert.strictEqual(n, gotEvents, `Event ${name} was not emitted.`)
  },

  getEventArgsFromTx: (txReceipt, eventName) => {
    return txReceipt.logs.filter((log) => {
      return log.event === eventName
    })[0].args
  },
}

module.exports = utils
