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

    describe('remove', () => {
        it('should remove value from list', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            await hashListLibraryProxy.remove(
                newAccountHash,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                await hashListLibraryProxy.has(
                    newAccountHash
                ),
                false
            )
        })

        it('should fail to remove if value does not exist', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            await hashListLibraryProxy.remove(
                newAccountHash,
                {
                    from: owner
                }
            )

            await assert.isRejected(
                hashListLibraryProxy.remove(
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
