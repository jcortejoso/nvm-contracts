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
    const other = accounts[2]
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
        it('Should not mint automatically a NFT associated with the DID', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const result = await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            const balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(0, balance.toNumber())
        })

        it('Should not mint or burn a NFTs without previous initialization', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const result = await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.mint(did, 10, { from: owner }),
                'The NFTs needs to be initialized'
            )

            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.burn(did, 1, { from: owner }),
                'The NFTs needs to be initialized'
            )
        })

        it('Should mint and burn NFTs after initialization', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
                did, checksum, [], value,
                {
                    from: owner
                }
            )

            await didRegistry.enableDidNft(did, 20, 0, { from: owner })
            const result = await didRegistry.mint(did, 10, { from: owner })

            testUtils.assertEmitted(
                result,
                1,
                'TransferSingle'
            )

            let balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(10, balance.toNumber())

            await didRegistry.burn(did, 5,
                {
                    from: owner
                }
            )

            balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(5, balance.toNumber())
        })

        it('Should not mint a NFTs over minting cap', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const result = await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            await didRegistry.enableDidNft(did, 5, 0, { from: owner })

            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.mint(did, 10, { from: owner }),
                'The minted request exceeds the cap'
            )

            await didRegistry.mint(did, 5, { from: owner })
            let balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(5, balance.toNumber())

            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.mint(did, 1, { from: owner }),
                'The minted request exceeds the cap'
            )
            assert.strictEqual(5, balance.toNumber())

        })

        it('Should not mint or burn if not DID Owner', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const result = await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            await assert.isRejected(
                // Must not allow to initialize NFTs if not the owner
                didRegistry.enableDidNft(did, 5, 0, { from: other }),
                'Only DID Owner allowed'
            )

            await didRegistry.enableDidNft(did, 5, 0, { from: owner })
            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.mint(did, 1, { from: other }),
                'Only DID Owner allowed'
            )
        })
    })
})
