/* globals web3 */
const getBalance = async (token, address) => {
    return web3.utils.toDecimal(
        await token.balanceOf.call(address)
    )
}

module.exports = getBalance
