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

    describe('add', () => {
        it('should add a new value to list', async () => {
            const newAccountHash = await hashList.hash(accounts[1])
            await hashList.add(
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
            const newAccountHash = await hashList.hash(accounts[1])
            await hashList.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            // assert
            await assert.isRejected(
                hashList.add(
                    newAccountHash,
                    {
                        from: owner
                    }
                ),
                'Value already exists'
            )
        })

        it('should add multiple values at a time', async () => {
            const values = [
                await hashList.hash(accounts[1]),
                await hashList.hash(accounts[2])
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
