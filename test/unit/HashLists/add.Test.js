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

    describe('add', () => {
        it('should add a new value to list', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newAccountHash = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](
                newAccountHash,
                {
                    from: owner
                }
            )
            assert.strictEqual(
                await hashList.has(newAccountHash),
                true
            )
        })

        it('should fail if value already exists', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newAccountHash = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](newAccountHash, { from: owner })

            // assert
            await assert.isRejected(
                hashList.methods['add(bytes32)'](newAccountHash, { from: owner }),
                'Value already exists'
            )
        })

        it('should add multiple values at a time', async () => {
            const values = [
                await hashList.hash(accounts[3]),
                await hashList.hash(accounts[4])
            ]

            await hashList.methods['add(bytes32[])'](
                values,
                {
                    from: owner
                }
            )

            await hashList.index(
                1,
                2,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                await hashList.has(values[0]) &&
                await hashList.has(values[1]),
                true
            )
        })
    })
})
