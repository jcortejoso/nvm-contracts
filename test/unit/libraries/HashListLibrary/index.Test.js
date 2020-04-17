/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { assert } = chai
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

    describe('index', () => {
        it('should revert error message if list already indexed', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newAccountHash,
                {
                    from: owner
                }
            )

            await assert.isRejected(
                hashListLibraryProxy.index(
                    1,
                    1,
                    {
                        from: owner
                    }
                ),
                'List is already indexed'
            )
        })

        it('should index non-indexed values in list', async () => {
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

            assert.strictEqual(
                await hashListLibraryProxy.isIndexed(),
                false
            )

            await hashListLibraryProxy.index(
                1,
                2,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                await hashListLibraryProxy.isIndexed(),
                true
            )
        })
    })
})
