/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const OceanToken = artifacts.require('OceanToken')

contract('OceanToken', (accounts) => {
    let oceanToken

    const owner = accounts[0]
    const minter = accounts[1]
    const someone = accounts[2]

    describe('initialize', () => {
        beforeEach('create tokens before each test', async () => {
            oceanToken = await OceanToken.new()
        })

        it('Should allow the minter to mint', async () => {
            await oceanToken.methods['initialize(address,address)'](owner, minter)
            await oceanToken.mint(owner, 100, { from: minter })
            await oceanToken.transfer(someone, 100, { from: owner })
        })
    })
})
