const testUtils = require('./utils')

const getBalance = async (token, address) => {
    return testUtils.getWeb3().utils.toDecimal(
        await token.balanceOf.call(address)
    )
}

module.exports = getBalance
