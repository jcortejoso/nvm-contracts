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
        hashListLibraryProxy.initialize(owner, { from: owner })
    })

    describe('ownedBy', () => {
        it('should return list owner', async () => {
            assert.strictEqual(
                await hashListLibraryProxy.ownedBy(),
                owner
            )
        })
    })
})
