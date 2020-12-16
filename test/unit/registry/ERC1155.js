/* eslint-env mocha */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const testUtils = require('../../helpers/utils.js')

contract('DIDRegistry + ERC1155', (accounts) => {
    const owner = accounts[1]
    const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'
    let didRegistry

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!didRegistry) {
            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)
        }
    }

    describe('Register an Asset with a DID', () => {
        it('Should mint automatically a NFT associated with the DID', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
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

        it('Should mint and burn NFTs', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
                did, checksum, [], value,
                {
                    from: owner
                }
            )

            await didRegistry.mint(did, 10,
                {
                    from: owner
                }
            )

            let balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(11, balance.toNumber())

            await didRegistry.burn(did, 5,
                {
                    from: owner
                }
            )

            balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(6, balance.toNumber())
        })
    })
})
