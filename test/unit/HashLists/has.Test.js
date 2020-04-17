/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashListLibrary = artifacts.require('HashListLibrary')
const HashLists = artifacts.require('HashLists')

contract('HashLists', (accounts) => {
    let hashListLibrary
    let hashList
    const owner = accounts[0]

    beforeEach(async () => {
        hashListLibrary = await HashListLibrary.new()
        HashLists.link('HashListLibrary', hashListLibrary.address)
        hashList = await HashLists.new()
        hashList.initialize(accounts[0], { from: owner })
    })

    describe('has', () => {
        it('should return true if value exists', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashList.has(
                    newValue
                ),
                true
            )
        })

        it('should return false if value does not exist', async () => {
            const value = await hashList.hash(accounts[1])
            // assert
            assert.strictEqual(
                await hashList.has(value),
                false
            )
        })
    })
})
