/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const Math = require('mathjs')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const testUtils = require('../../helpers/utils')

const EpochLibrary = artifacts.require('EpochLibrary')
const EpochLibraryProxy = artifacts.require('EpochLibraryProxy')

contract('EpochLibrary', (accounts) => {
    let epochLibrary
    let epochLibraryProxy

    beforeEach(async () => {
        epochLibrary = await EpochLibrary.new()
        EpochLibraryProxy.link('EpochLibrary', epochLibrary.address)
        epochLibraryProxy = await EpochLibraryProxy.new()
    })

    describe('create', () => {
        it('should fail when timout equals timelock', async () => {
            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), 10, 10),
                'Invalid time margin')
        })

        it('should fail when timout greater timelock', async () => {
            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), 15, 10),
                'Invalid time margin')
        })

        it('should succeed when timelock greater timeout', async () => {
            await assert.isFulfilled(
                epochLibraryProxy.create(testUtils.generateId(), 10, 15)
            )
        })
        it('should not allow Epochs mutability', async () => {
            const Id = testUtils.generateId()
            await epochLibraryProxy.create(Id, 10, 15)
            // assert
            await assert.isRejected(
                epochLibraryProxy.create(Id, 12, 15),
                'Id already exists'
            )
        })
        it('should revert in case of integer overflow', async () => {
            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), -1, 0)
            )
            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), -2, -1)
            )

            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), -2, 1)
            )

            await assert.isRejected(
                epochLibraryProxy.create(testUtils.generateId(), -2, Math.pow(2, 256))
            )
        })
    })
})
