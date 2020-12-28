/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashListLibrary = artifacts.require('HashListLibrary')
const HashListLibraryProxy = artifacts.require('HashListLibraryProxy')
const testUtils = require('../../../helpers/utils.js')

contract('HashListLibrary', (accounts) => {
    let hashListLibrary
    let hashListLibraryProxy
    let newAccountAddress
    const owner = accounts[0]

    beforeEach(async () => {
        if (!hashListLibrary) {
            hashListLibrary = await HashListLibrary.new()
            HashListLibraryProxy.link('HashListLibrary', hashListLibrary.address)
            hashListLibraryProxy = await HashListLibraryProxy.new()
            await hashListLibraryProxy.initialize(accounts[0], { from: owner })
        }
        newAccountAddress = testUtils.generateAccount().address
    })

    describe('add', () => {
        it('should add a new value to list', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.methods['add(bytes32)'](
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
                hashListLibraryProxy.methods['add(bytes32)'](
                    newAccountHash,
                    {
                        from: invalidOwner
                    }
                ),
                'Invalid whitelist owner'
            )
        })

        it('should fail if value already exists', async () => {
            const newAccountAddress = testUtils.generateAccount().address
            const newAccountHash = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newAccountHash,
                {
                    from: owner
                }
            )

            // assert
            await assert.isRejected(
                hashListLibraryProxy.methods['add(bytes32)'](
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

    describe('has', () => {
        it('should return true if value exists', async () => {
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashListLibraryProxy.has(
                    newValue
                ),
                true
            )
        })

        it('should return false if value does not exist', async () => {
            const newAccountAddress = testUtils.generateAccount().address
            const value = await hashListLibraryProxy.hash(newAccountAddress)
            // assert
            assert.strictEqual(
                await hashListLibraryProxy.has(value),
                false
            )
        })
    })

    describe('index', () => {
        it('should revert error message if list already indexed', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
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
            const newAccountAddress1 = testUtils.generateAccount().address
            const newAccountAddress2 = testUtils.generateAccount().address

            const values = [
                await hashListLibraryProxy.hash(newAccountAddress1),
                await hashListLibraryProxy.hash(newAccountAddress2)
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

    describe('ownedBy', () => {
        it('should return list owner', async () => {
            assert.strictEqual(
                await hashListLibraryProxy.ownedBy(),
                owner
            )
        })
    })

    describe('remove', () => {
        it('should remove value from list', async () => {
            const newAccountHash = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
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
            const newAccountHash = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
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

    describe('update', () => {
        it('should fail if value does not exist', async () => {
            const newAccountAddress2 = testUtils.generateAccount().address
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            const invalidValue = await hashListLibraryProxy.hash(newAccountAddress2)
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
            const oldValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
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
            const newAccountAddress2 = testUtils.generateAccount().address
            const oldValue = await hashListLibraryProxy.hash(newAccountAddress)
            const newValue = await hashListLibraryProxy.hash(newAccountAddress2)

            await hashListLibraryProxy.methods['add(bytes32)'](
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
            const oldValue = await hashListLibraryProxy.hash(newAccountAddress)
            const invalidOwner = accounts[5]
            await hashListLibraryProxy.methods['add(bytes32)'](
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

    describe('get', () => {
        it('should return value by index', async () => {
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            const length = (await hashListLibraryProxy.all()).length
            assert.strictEqual(
                await hashListLibraryProxy.get(length),
                newValue
            )
        })
    })

    describe('all', () => {
        it('should return all list values', async () => {
            const length = (await hashListLibraryProxy.all()).length
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue, { from: owner })

            assert.strictEqual(
                (await hashListLibraryProxy.all()).length,
                length + 1
            )
        })
    })

    describe('indexOf', () => {
        it('should return index of value in a list', async () => {
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.isAtLeast(
                (await hashListLibraryProxy.indexOf(newValue)).toNumber(),
                1
            )
        })

        it('should fail if value does not exists', async () => {
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await assert.isRejected(
                hashListLibraryProxy.indexOf(newValue),
                'Value does not exist'
            )
        })
    })

    describe('isIndexed', () => {
        it('should return false if not indexed list', async () => {
            const hashListLibraryProxyDummy = await HashListLibraryProxy.new()
            await assert.isRejected(
                hashListLibraryProxyDummy.isIndexed()
            )
        })

        it('should return true if indexed in case of add single element', async () => {
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                await hashListLibraryProxy.isIndexed(),
                true
            )
        })

        it('should return true if indexed using add multiple elements', async () => {
            const values = [
                await hashListLibraryProxy.hash(newAccountAddress),
                await hashListLibraryProxy.hash(newAccountAddress)
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
                await hashListLibraryProxy.isIndexed(),
                true
            )
        })

        it('should fail if not indexed after patch add', async () => {
            const values = [
                await hashListLibraryProxy.hash(newAccountAddress),
                await hashListLibraryProxy.hash(newAccountAddress)
            ]

            await hashListLibraryProxy.methods['add(bytes32[])'](
                values,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashListLibraryProxy.isIndexed(),
                false
            )
        })
    })

    describe('size', () => {
        it('should return size', async () => {
            const newValue = await hashListLibraryProxy.hash(newAccountAddress)
            await hashListLibraryProxy.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.isAtLeast(
                (await hashListLibraryProxy.size()).toNumber(),
                1
            )
        })
    })
})
