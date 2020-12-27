/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashListLibrary = artifacts.require('HashListLibrary')
const HashLists = artifacts.require('HashLists')

const testUtils = require('../../helpers/utils.js')

contract('HashLists', (accounts) => {
    let hashListLibrary
    let hashList
    const owner = accounts[0]

    beforeEach(async () => {
        if (!hashList)  {
            hashListLibrary = await HashListLibrary.new()
            HashLists.link('HashListLibrary', hashListLibrary.address)
            hashList = await HashLists.new()
            await hashList.initialize(accounts[0], { from: owner })
        }
    })

    describe('has', () => {
        it('should return true if value exists', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newValue = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](
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
            const accountAddress = testUtils.generateAccount().address
            const value = await hashList.hash(accountAddress)
            // assert
            assert.strictEqual(
                await hashList.has(value),
                false
            )
        })
    })
})
