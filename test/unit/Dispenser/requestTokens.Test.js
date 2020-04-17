/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const testUtils = require('../../helpers/utils.js')
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Dispenser = artifacts.require('Dispenser')
const OceanToken = artifacts.require('OceanToken')

contract('Dispenser', (accounts) => {
    let dispenser
    let oceanToken

    const deployer = accounts[0]
    const someone = accounts[1]

    beforeEach(async () => {
        // deploy and init ocean token
        oceanToken = await OceanToken.new()
        await oceanToken.initialize(deployer, deployer)

        // deploy and init dispenser
        dispenser = await Dispenser.new()
        await dispenser.initialize(oceanToken.address, deployer)

        // register dispenser as minter in ocean token
        await oceanToken.addMinter(dispenser.address)
    })

    describe('requestTokens', () => {
        it('Should transfer tokens', async () => {
            // act
            await dispenser.requestTokens(
                200,
                { from: someone }
            )

            // assert
            const balance = await oceanToken.balanceOf(someone)
            assert.strictEqual(balance.toNumber(), 200)
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
            const balance = await oceanToken.balanceOf(someone)
            assert.strictEqual(balance.toNumber(), 10)
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
            const balance = await oceanToken.balanceOf(someone)
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
