/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Dispenser = artifacts.require('Dispenser')
const OceanToken = artifacts.require('OceanToken')

contract('Dispenser', (accounts) => {
    const owner = accounts[0]
    const someone = accounts[1]
    let dispenser

    beforeEach(async () => {
        const oceanToken = await OceanToken.new()
        dispenser = await Dispenser.new()
        await dispenser.initialize(oceanToken.address, owner)
    })

    describe('setMaxMintAmount', () => {
        it('Should set the max mint amount from owner', async () => {
            // act
            await dispenser.setMaxMintAmount(1000, { from: owner })
        })

        it('Should fail on setting the max mint amount from someone', async () => {
            // act
            await assert.isRejected(
                dispenser.setMaxMintAmount(1000, { from: someone }),
                'revert'
            )
            assert.equal(false, await dispenser.isOwner({ from: someone }))
        })
    })
})
