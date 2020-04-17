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

    describe('update', () => {
        it('should fail if value does not exist', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newValue,
                {
                    from: owner
                }
            )
            const invalidValue = await hashListLibraryProxy.hash(accounts[3])
            await assert.isRejected(
                hashListLibraryProxy.update(
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
            const oldValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                oldValue,
                {
                    from: owner
                }
            )
            await assert.isRejected(
                hashListLibraryProxy.update(
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
            const oldValue = await hashListLibraryProxy.hash(accounts[1])
            const newValue = await hashListLibraryProxy.hash(accounts[2])

            await hashListLibraryProxy.add(
                oldValue,
                {
                    from: owner
                }
            )

            await hashListLibraryProxy.update(
                oldValue,
                newValue,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashListLibraryProxy.has(newValue),
                true
            )
        })

        it('should fail in case of invalid list owner', async () => {
            const oldValue = await hashListLibraryProxy.hash(accounts[1])
            const invalidOwner = accounts[5]
            await hashListLibraryProxy.add(
                oldValue,
                {
                    from: owner
                }
            )
            await assert.isRejected(
                hashListLibraryProxy.update(
                    oldValue,
                    oldValue,
                    {
                        from: invalidOwner
                    }
                ),
                'Invalid whitelist owner'
            )
        })
    })
})
