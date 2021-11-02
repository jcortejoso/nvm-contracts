/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const BigNumber = require('bignumber.js')
const web3 = require('web3')
const testUtils = require('../../helpers/utils.js')
// @ts-ignore
const chai = require('chai')
// @ts-ignore
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Dispenser = artifacts.require('Dispenser')
const NeverminedToken = artifacts.require('NeverminedToken')

contract('Dispenser', (accounts) => {
    let dispenser
    let token

    const deployer = accounts[0]
    const someone = accounts[1]

    beforeEach(async () => {
        // deploy and init ocean token
        token = await NeverminedToken.new()
        await token.initialize(deployer, deployer)

        // deploy and init dispenser
        dispenser = await Dispenser.new()
        await dispenser.initialize(token.address, deployer)

        // register dispenser as minter in ocean token
        await token.grantRole(web3.utils.toHex('minter'), dispenser.address)
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await dispenser.requestTokens(
                200,
                { from: someone }
            )

            // assert
            const balance = new BigNumber(await token.balanceOf(someone))
            assert.strictEqual(balance.dividedBy(10 ** 18).toNumber(), 200)
        })

        it('Should not transfer frequently', async () => {
            // arrange
            await dispenser.setMinPeriod(10)
            await dispenser.setMaxAmount(10)
            await dispenser.requestTokens(
                10,
                { from: someone }
            )

            // act
            const result = await dispenser.requestTokens(
                10,
                { from: someone }
            )

            // assert
            const balance = new BigNumber(await token.balanceOf(someone))
            assert.strictEqual(balance.dividedBy(10 ** 18).toNumber(), 10)
            testUtils.assertEmitted(result, 1, 'RequestFrequencyExceeded')
        })

        it('Should not transfer more than max amount', async () => {
            // arrange
            await dispenser.setMinPeriod(2)
            await dispenser.setMaxAmount(10)

            // act
            const result = await dispenser.requestTokens(
                11,
                { from: someone }
            )

            // assert
            const balance = await token.balanceOf(someone)
            assert.strictEqual(balance.toNumber(), 0)
            testUtils.assertEmitted(result, 1, 'RequestLimitExceeded')
        })

        it('Should not mint more than max amount', async () => {
            // act
            await assert.isRejected(
                dispenser.requestTokens(
                    1000 * 10 ** 10,
                    { from: someone }
                ),
                'Exceeded maxMintAmount'
            )
        })
    })
})
