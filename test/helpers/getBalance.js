const BigNumber = require('bignumber.js')
/* globals web3 */

const getBalance = async (token, address) => {
    return web3.utils.toDecimal(
        await token.balanceOf.call(address)
    )
}

const getETHBalance = async (address) => {
    return web3.eth.getBalance(address, 'latest')
        .then((balance) => {
            return new BigNumber(balance).toNumber()
        })
}

module.exports = { getBalance, getETHBalance }
