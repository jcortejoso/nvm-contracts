/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const HashListLibrary = artifacts.require('HashListLibrary')
const HashLists = artifacts.require('HashLists')

contract('HashList', (accounts) => {
    let hashListLibrary
    let hashList
    const owner = accounts[0]

    beforeEach(async () => {
        hashListLibrary = await HashListLibrary.new()
        HashLists.link('HashListLibrary', hashListLibrary.address)
        hashList = await HashLists.new()
        hashList.initialize(owner, { from: owner })
        const newAccountHash = await hashList.hash(accounts[1])
        await hashList.add(
            newAccountHash,
            {
                from: owner
            }
        )
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
})
