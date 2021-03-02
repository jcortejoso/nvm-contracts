/* eslint-env mocha */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistryLibraryProxy = artifacts.require('DIDRegistryLibraryProxy')
const DIDRegistry = artifacts.require('DIDRegistry')
const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')

contract('Mintable DIDRegistry', (accounts) => {
    const owner = accounts[1]
    const other = accounts[2]
    const consumer = accounts[3]
    const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'
    let didRegistry
    let didRegistryLibrary
    let didRegistryLibraryProxy

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!didRegistry) {
            didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistryLibraryProxy.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistryLibraryProxy = await DIDRegistryLibraryProxy.new()

            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)

            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)
        }
    }

    describe('Register an Asset with a DID', () => {
        it('A Mintable DID can be found in the regular DIDRegistry', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            const storedDIDRegister = await didRegistry.getDIDRegister(did)

            assert.strictEqual(
                value,
                storedDIDRegister.url
            )
            assert.strictEqual(
                owner,
                storedDIDRegister.owner
            )
        })

        it('Should not mint automatically a NFT associated with the DID', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            const balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(0, balance.toNumber())
        })

        it('Should not mint or burn a NFTs without previous initialization', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
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

            await didRegistry.enableDidNft(did, 20, 0, false, { from: owner })
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

        it('Should initialize the NFT in the registration', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerMintableDID(
                did, checksum, [], value, 10, 0, constants.activities.GENERATED, '', { from: owner })

            await didRegistry.mint(did, 10, { from: owner })

            const balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(10, balance.toNumber())
        })

        it('Should mint if is not capped', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            await didRegistry.enableDidNft(did, 0, 0, false, { from: owner })
            await didRegistry.mint(did, 100, { from: owner })

            const balance = await didRegistry.balanceOf(owner, did)
            assert.strictEqual(100, balance.toNumber())
        })

        it('Should not mint a NFTs over minting cap', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            await didRegistry.enableDidNft(did, 5, 0, false, { from: owner })

            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.mint(did, 10, { from: owner }),
                'The minted request exceeds the cap'
            )

            await didRegistry.mint(did, 5, { from: owner })
            const balance = await didRegistry.balanceOf(owner, did)
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
            await didRegistry.registerAttribute(
                did, checksum, [], value, { from: owner })

            await assert.isRejected(
                // Must not allow to initialize NFTs if not the owner
                didRegistry.enableDidNft(did, 5, 0, false, { from: other }),
                'Only DID Owner allowed'
            )

            await didRegistry.enableDidNft(did, 5, 0, false, { from: owner })
            await assert.isRejected(
                // Must not allow to mint tokens without previous initialization
                didRegistry.mint(did, 1, { from: other }),
                'Only DID Owner allowed'
            )
        })

        it('Checks the royalties are right', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()

            await didRegistryLibraryProxy.update(did, checksum, value, { from: owner })
            await didRegistryLibraryProxy.initializeNftConfig(did, 3, 10, { from: owner })

            assert.isOk( // MUST BE TRUE. It's the creator selling the DID
                await didRegistryLibraryProxy.areRoyaltiesValid(did, [5], [other]))

            await didRegistryLibraryProxy.updateDIDOwner(did, other, { from: owner })

            const storedDIDRegister = await didRegistryLibraryProxy.getDIDInfo(did)

            assert.strictEqual(storedDIDRegister.owner, other)
            assert.strictEqual(storedDIDRegister.creator, owner)
            assert.strictEqual(Number(storedDIDRegister.royalties), 10)

            assert.isNotOk( // MUST BE FALSE. Royalties for original creator are too low
                await didRegistryLibraryProxy.areRoyaltiesValid(did, [91, 9], [consumer, owner]))

            assert.isOk( // MUST BE TRUE. There is not payment
                await didRegistryLibraryProxy.areRoyaltiesValid(did, [], []))

            assert.isOk( // MUST BE TRUE. Original creator is getting 10% by royalties
                await didRegistryLibraryProxy.areRoyaltiesValid(did, [90, 10], [other, owner]))

            assert.isOk( // MUST BE TRUE. Original creator is getting 10% by royalties
                await didRegistryLibraryProxy.areRoyaltiesValid(did, [10, 90], [owner, other]))

            assert.isNotOk( // MUST BE FALSE. Original creator is not getting royalties
                await didRegistryLibraryProxy.areRoyaltiesValid(did, [100], [other]))
        })
    })
})
