/* eslint-disable no-console */
/* global web3 */
const contract = require('truffle-contract')
const BN = require('bignumber.js')

const network = process.env.NETWORK || 'development'
// eslint-disable-next-line security/detect-non-literal-require
const oceanTokenArtifact = require(`../../artifacts/OceanToken.${network}.json`)
const OceanToken = contract({ abi: oceanTokenArtifact.abi })

async function calculate(
    amount
) {
    OceanToken.setProvider(web3.currentProvider)
    const OceanTokenInstance = await OceanToken.at(oceanTokenArtifact.address)
    const decimals = await OceanTokenInstance.decimals()
    const scale = BN(10).exponentiatedBy(decimals)
    const vodka = BN(amount).multipliedBy(scale)

    console.log(`${amount} OceanToken is ${vodka.toFixed()} Vodka`)
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
