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

    describe('setMaxAmount', () => {
        it('Should set the max amount from owner', async () => {
            // act
            await dispenser.setMaxAmount(10, { from: owner })
        })

        it('Should fail on setting the max amount from someone', async () => {
            // act
            await assert.isRejected(
                dispenser.setMaxAmount(10, { from: someone }),
                'revert'
            )
            assert.equal(false, await dispenser.isOwner({ from: someone }))
        })
    })
})
