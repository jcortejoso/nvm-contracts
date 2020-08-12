/* eslint-disable no-console */
/* global web3 */
const contract = require('truffle-contract')
const BN = require('bignumber.js')

const network = process.env.NETWORK || 'development'
// eslint-disable-next-line security/detect-non-literal-require
const tokenArtifact = require(`../../artifacts/NeverminedToken.${network}.json`)
const Token = contract({ abi: tokenArtifact.abi })

async function calculate(
    amount
) {
    Token.setProvider(web3.currentProvider)
    const TokenInstance = await Token.at(tokenArtifact.address)
    const decimals = await TokenInstance.decimals()
    const scale = BN(10).exponentiatedBy(decimals)
    const vodka = BN(amount).multipliedBy(scale)

    console.log(`${amount} is ${vodka.toFixed()} Vodka`)
}

module.exports = (cb) => {
    const amount = process.argv.splice(4)[0]

    if (!amount) {
        throw new Error('no amount given')
    }

    calculate(amount)
        .then(() => cb())
        .catch(err => cb(err))
}
