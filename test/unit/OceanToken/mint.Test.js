/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const BN = require('bignumber.js')
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const OceanToken = artifacts.require('OceanToken')

contract('OceanToken', (accounts) => {
    let oceanToken

    const owner = accounts[0]
    const minter = accounts[1]
    const someone = accounts[2]

    const cap = BN('1410000000')
    const decimals = 18
    const totalSupply = cap.multipliedBy(BN(10 ** decimals))

    beforeEach('initialize token before each test', async () => {
        oceanToken = await OceanToken.new()
        await oceanToken.methods['initialize(address,address)'](owner, minter)
    })

    describe('mint', () => {
        it('Should not fail on mint if minter calls it', async () => {
            await oceanToken.mint(owner, 1, { from: minter })
        })

        it('Should not fail on mint if owner calls it', async () => {
            await oceanToken.mint(owner, 1, { from: owner })
        })

        it('Should fail to mint more than max value', async () => {
            await assert.isRejected(
                oceanToken.mint(owner, 1, { from: someone })
            )
        })

        it('Should allow the minter to mint max amount', async () => {
            await oceanToken.mint(owner, totalSupply.toFixed(), { from: minter })
        })

        it('Should fail to mint more when max value has already been minted', async () => {
            await oceanToken.mint(owner, totalSupply.toFixed(), { from: minter })
            await assert.isRejected(
                oceanToken.mint(owner, 1, { from: minter })
            )
        })

        it('Should fail to mint more than max value', async () => {
            await assert.isRejected(
                oceanToken.mint(owner, totalSupply.plus(1).toFixed(), { from: minter })
            )
        })

        it('Should fail to mint max value if already minted', async () => {
            await oceanToken.mint(owner, 1, { from: minter })
            await assert.isRejected(
                oceanToken.mint(owner, totalSupply.toFixed(), { from: minter })
            )
        })
    })
})
