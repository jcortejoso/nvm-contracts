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

    describe('update', () => {
        it('should fail if value does not exist', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.add(
                newValue,
                {
                    from: owner
                }
            )
            const invalidValue = await hashList.hash(accounts[3])
            await assert.isRejected(
                hashList.update(
                    invalidValue,
                    newValue,
                    {
                        from: owner
                    }
                ),
                'Value does not exist'
            )
        })

        it('should fail if old value equals new value', async () => {
            const oldValue = await hashList.hash(accounts[1])
            await hashList.add(
                oldValue,
                {
                    from: owner
                }
            )
            await assert.isRejected(
                hashList.update(
                    oldValue,
                    oldValue,
                    {
                        from: owner
                    }
                ),
                'Value already exists'
            )
        })

        it('should update if old value is exists', async () => {
            const oldValue = await hashList.hash(accounts[1])
            const newValue = await hashList.hash(accounts[2])
            const listId = await hashList.hash(owner)

            await hashList.add(
                oldValue,
                {
                    from: owner
                }
            )

            await hashList.update(
                oldValue,
                newValue,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashList.has(
                    listId,
                    newValue
                ),
                true
            )
        })

        it('should fail in case of invalid list owner', async () => {
            const oldValue = await hashList.hash(accounts[1])
            const invalidOwner = accounts[5]
            await hashList.add(
                oldValue,
                {
                    from: owner
                }
            )
            await assert.isRejected(
                hashList.update(
                    oldValue,
                    oldValue,
                    {
                        from: invalidOwner
                    }
                ),
                'Value does not exist'
            )
        })
    })
})
