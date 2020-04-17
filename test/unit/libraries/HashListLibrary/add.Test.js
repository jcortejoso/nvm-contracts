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

    describe('add', () => {
        it('should add a new value to list', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newAccountHash,
                {
                    from: owner
                }
            )
            assert.strictEqual(
                await hashListLibraryProxy.has(newAccountHash),
                true
            )
        })

        it('should fail to add if the sender is not the list owner', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            const invalidOwner = accounts[1]
            await assert.isRejected(
                hashListLibraryProxy.add(
                    newAccountHash,
                    {
                        from: invalidOwner
                    }
                ),
                'Invalid whitelist owner'
            )
        })

        it('should fail if value already exists', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            // assert
            await assert.isRejected(
                hashListLibraryProxy.add(
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
                await hashListLibraryProxy.hash(accounts[1]),
                await hashListLibraryProxy.hash(accounts[2])
            ]

            await hashListLibraryProxy.methods['add(bytes32[])'](
                values,
                {
                    from: owner
                }
            )

            await hashListLibraryProxy.index(
                1,
                2,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                await hashListLibraryProxy.has(values[0]) &&
                await hashListLibraryProxy.has(values[1]),
                true
            )
        })
    })
})
