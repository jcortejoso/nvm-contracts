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
        if (!hashList) {
            hashListLibrary = await HashListLibrary.new()
            HashLists.link('HashListLibrary', hashListLibrary.address)
            hashList = await HashLists.new()
            await hashList.initialize(owner, { from: owner })
        }
    })

    describe('update', () => {
        it('should fail if value does not exist', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newValue = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            const invalidValue = await hashList.hash(testUtils.generateAccount().address)
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
            const accountAddress = testUtils.generateAccount().address
            const oldValue = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](
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
            const oldValue = await hashList.hash(testUtils.generateAccount().address)
            const newValue = await hashList.hash(testUtils.generateAccount().address)
            const listId = await hashList.hash(owner)

            await hashList.methods['add(bytes32)'](
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
                    newValue,
                    {
                        from: owner
                    }
                ),
                true
            )
        })

        it('should fail in case of invalid list owner', async () => {
            const oldValue = await hashList.hash(testUtils.generateAccount().address)
            const invalidOwner = testUtils.generateAccount().address
            await hashList.methods['add(bytes32)'](
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
