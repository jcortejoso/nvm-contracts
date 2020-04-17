/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashListLibrary = artifacts.require('HashListLibrary')
const HashListLibraryProxy = artifacts.require('HashListLibraryProxy')

contract('HashListLibrary', (accounts) => {
    let hashListLibrary
    let hashListLibraryProxy
    const owner = accounts[0]

    beforeEach(async () => {
        hashListLibrary = await HashListLibrary.new()
        HashListLibraryProxy.link('HashListLibrary', hashListLibrary.address)
        hashListLibraryProxy = await HashListLibraryProxy.new()
        hashListLibraryProxy.initialize(accounts[0], { from: owner })
    })

    describe('has', () => {
        it('should return true if value exists', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newValue,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashListLibraryProxy.has(
                    newValue
                ),
                true
            )
        })

        it('should return false if value does not exist', async () => {
            const value = await hashListLibraryProxy.hash(accounts[1])
            // assert
            assert.strictEqual(
                await hashListLibraryProxy.has(value),
                false
            )
        })
    })
})
