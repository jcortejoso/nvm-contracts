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

    describe('get', () => {
        it('should return value by index', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newValue,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                await hashListLibraryProxy.get(1),
                newValue
            )
        })
    })

    describe('all', () => {
        it('should return all list values', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newValue,
                {
                    from: owner
                }
            )

            assert.strictEqual(
                (await hashListLibraryProxy.all()).length,
                1
            )
        })
    })

    describe('indexOf', () => {
        it('should return index of value in a list', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                (await hashListLibraryProxy.indexOf(newValue)).toNumber(),
                1
            )
        })

        it('should fail if value does not exists', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await assert.isRejected(
                hashListLibraryProxy.indexOf(newValue),
                'Value does not exist'
            )
        })
    })

    describe('isIndexed', () => {
        it('should return false if not indexed list', async () => {
            await assert.isRejected(
                hashListLibraryProxy.isIndexed()
            )
        })

        it('should return true if indexed in case of add single element', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
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
                await hashListLibraryProxy.isIndexed(),
                true
            )
        })

        it('should fail if not indexed after patch add', async () => {
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

            // assert
            assert.strictEqual(
                await hashListLibraryProxy.isIndexed(),
                false
            )
        })
    })

    describe('size', () => {
        it('should return size', async () => {
            const newValue = await hashListLibraryProxy.hash(accounts[1])
            await hashListLibraryProxy.add(
                newValue,
                {
                    from: owner
                }
            )
            // assert
            assert.strictEqual(
                (await hashListLibraryProxy.size()).toNumber(),
                1
            )
        })
    })
})
