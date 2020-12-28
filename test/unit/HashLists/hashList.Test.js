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
    let listId

    const owner = accounts[0]

    beforeEach(async () => {
        if (!hashList) {
            hashListLibrary = await HashListLibrary.new()
            HashLists.link('HashListLibrary', hashListLibrary.address)
            hashList = await HashLists.new()
            await hashList.initialize(accounts[0], { from: owner })
            listId = await hashList.hash(owner)
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

    describe('has', () => {
        it('should return true if value exists', async () => {
            const accountAddress = testUtils.generateAccount().address
            const newValue = await hashList.hash(accountAddress)
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )

            // assert
            assert.strictEqual(
                await hashList.has(
                    newValue
                ),
                true
            )
        })

        it('should return false if value does not exist', async () => {
            const accountAddress = testUtils.generateAccount().address
            const value = await hashList.hash(accountAddress)
            // assert
            assert.strictEqual(
                await hashList.has(value),
                false
            )
        })
    })

    describe('index', () => {
        it('should revert error message if list already indexed', async () => {

        })

        it('should index non-indexed values in list', async () => {

        })
    })

    describe('ownedBy', () => {
        it('should return list owner', async () => {
            assert.strictEqual(
                await hashList.ownedBy(
                    await hashList.hash(owner)
                ),
                owner
            )
        })
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

    describe('get', () => {
        it('should return value by index', async () => {
            const newValue = await hashList.hash(accounts[1])
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            const length = (await hashList.all(listId)).length
            assert.strictEqual(
                await hashList.get(
                    listId,
                    length
                ),
                newValue
            )
        })
    })

    describe('all', () => {
        it('should return all list values', async () => {
            const listId = await hashList.hash(owner)
            const newValue = await hashList.hash(testUtils.generateAccount().address)
            const lengthBefore = (await hashList.all(listId)).length
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                (await hashList.all(listId)).length,
                lengthBefore + 1
            )
        })
    })

    describe('indexOf', () => {
        it('should return index of value in a list', async () => {
            const newValue = await hashList.hash(testUtils.generateAccount().address)
            const lengthBefore = (await hashList.all(listId)).length
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                (await hashList.indexOf(listId, newValue)).toNumber(),
                lengthBefore + 1
            )
        })

        it('should fail if value does not exists', async () => {
            const newValue = await hashList.hash(testUtils.generateAccount().address)
            await assert.isRejected(
                hashList.indexOf(listId, newValue),
                'Value does not exist'
            )
        })
    })

    describe('isIndexed', () => {
        it('should return false if not indexed list', async () => {
            const listId = await hashList.hash(testUtils.generateAccount().address)
            await assert.isRejected(
                hashList.isIndexed(listId)
            )
        })

        it('should return true if indexed in case of add single element', async () => {
            const newValue = await hashList.hash(testUtils.generateAccount().address)
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                await hashList.isIndexed(listId),
                true
            )
        })

        it('should return true if indexed using add multiple elements', async () => {
            const values = [
                await hashList.hash(testUtils.generateAccount().address),
                await hashList.hash(testUtils.generateAccount().address)
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
                await hashList.isIndexed(listId),
                true
            )
        })

        it('should fail if not indexed after patch add', async () => {
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

            // assert
            assert.strictEqual(
                await hashList.isIndexed(listId),
                false
            )
        })
    })

    describe('size', () => {
        it('should return size', async () => {
            const newValue = await hashList.hash(testUtils.generateAccount().address)
            const lengthBefore = (await hashList.all(listId)).length
            await hashList.methods['add(bytes32)'](
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                (await hashList.size(listId)).toNumber(),
                lengthBefore + 1
            )
        })
    })
})
