/* eslint-env mocha */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const testUtils = require('../../helpers/utils.js')

contract('DIDRegistry + ERC1155', (accounts) => {
    const owner = accounts[1]

    async function setupTest() {
        const didRegistryLibrary = await DIDRegistryLibrary.new()
        await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
        const didRegistry = await DIDRegistry.new()
        await didRegistry.initialize(owner)
        const common = await Common.new()

        return {
            common,
            didRegistry
        }
    }

    describe('Register an Asset with a DID', () => {
        it('Should mint a NFT associated with the DID', async () => {
            const { didRegistry } = await setupTest()
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'
            const result = await didRegistry.registerAttribute(
                did, checksum, [], value,
                {
                    from: owner
                }
            )

            testUtils.assertEmitted(
                result,
                1,
                'TransferSingle'
            )

            const balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(1, balance.toNumber())
        })
    })
})
