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

contract('HashList', (accounts) => {
    let hashListLibrary
    let hashList
    const owner = accounts[0]

    beforeEach(async () => {
        if (!hashList) {
            hashListLibrary = await HashListLibrary.new()
            HashLists.link('HashListLibrary', hashListLibrary.address)
            hashList = await HashLists.new()
            await hashList.initialize(accounts[0], { from: owner })
        }
    })

    describe('remove', () => {
        it('should remove value from list', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newAccountHash = await hashList.hash(accountAddress)
            const listId = await hashList.hash(owner)
            await hashList.methods['add(bytes32)'](
                newAccountHash,
                {
                    from: owner
                }
            )

            await hashList.remove(
                newAccountHash,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                await hashList.has(
                    listId,
                    newAccountHash,
                    {
                        from: owner
                    }
                ),
                false
            )
        })

        it('should fail to remove if value does not exist', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newAccountHash = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](
                newAccountHash,
                {
                    from: owner
                }
            )

            await hashList.remove(
                newAccountHash,
                {
                    from: owner
                }
            )

            await assert.isRejected(
                hashList.remove(
                    newAccountHash,
                    {
                        from: owner
                    }
                ),
                'Failed to remove element from list'
            )
        })
    })
})
