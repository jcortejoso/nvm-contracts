/* eslint-env mocha */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')


const StandardRoyalties = artifacts.require('StandardRoyalties')

contract('StandardRoyalties', (accounts) => {
    const owner = accounts[1]
    const other = accounts[2]
    const consumer = accounts[3]
    const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'
    const nftMetadataURL = 'https://nevermined.io/metadata.json'
    let didRegistry
    let didRegistryLibrary
    let didRegistryLibraryProxy
    let royalties

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!didRegistry) {
            didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link(didRegistryLibrary)

            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner, constants.address.zero, constants.address.zero)

            royalties = await StandardRoyalties.new()
            await royalties.initialize(didRegistry.address)

            await didRegistry.registerRoyaltiesChecker(royalties.address)

        }
    }


})
