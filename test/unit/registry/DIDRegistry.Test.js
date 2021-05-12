/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const DIDRegistryLibrary = artifacts.require('DIDRegistryLibrary')
const DIDRegistry = artifacts.require('DIDRegistry')
const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')

contract('DIDRegistry', (accounts) => {
    let didRegistry
    let common

    const owner = accounts[1]
    const someone = accounts[5]
    const delegates = [accounts[6], accounts[7]]
    const providers = [accounts[8], accounts[9]]
    const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

    const Activities = {
        GENERATED: '0x1',
        USED: '0x2',
        ACTED_IN_BEHALF: '0x3',
        DERIVED_FROM: '0x4',
        ASSOCIATED_WITH: '0x5'
    }

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!didRegistry) {
            const didRegistryLibrary = await DIDRegistryLibrary.new()
            await DIDRegistry.link('DIDRegistryLibrary', didRegistryLibrary.address)
            didRegistry = await DIDRegistry.new()
            await didRegistry.initialize(owner)
            common = await Common.new()
        }
    }

    describe('Register decentralised identifiers with attributes, fetch attributes by DID', () => {
        it('Should discover the attribute after registering it', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            const result = await didRegistry.registerAttribute(did, checksum, providers, value)

            testUtils.assertEmitted(
                result,
                1,
                'DIDAttributeRegistered'
            )

            const payload = result.logs[0].args
            assert.strictEqual(did, payload._did)
            assert.strictEqual(accounts[0], payload._owner)
            assert.strictEqual(checksum, payload._checksum)
            assert.strictEqual(value, payload._value)
        })

        it('Should find the event from the block number', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            const result = await didRegistry.registerAttribute(did, checksum, providers, value)

            testUtils.assertEmitted(
                result,
                1,
                'DIDAttributeRegistered'
            )

            // get owner for a did
            const owner = await didRegistry.getDIDOwner(did)
            assert.strictEqual(accounts[0], owner)

            // get the blockNumber for the last update
            const blockNumber = await didRegistry.getBlockNumberUpdated(did)
            assert(blockNumber > 0)

            // filter on the blockNumber only
            const filterOptions = {
                fromBlock: blockNumber,
                toBlock: blockNumber,
                filter: {
                    _did: did,
                    _owner: owner
                }
            }

            const logItems = await didRegistry.getPastEvents('DIDAttributeRegistered', filterOptions)

            assert(logItems.length > 0)

            const logItem = logItems[logItems.length - 1]

            assert.strictEqual(did, logItem.returnValues._did)
            assert.strictEqual(owner, logItem.returnValues._owner)
            assert.strictEqual(value, logItem.returnValues._value)
        })

        it('Should fail to register the same attribute twice', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value
            )

            // try to register the same attribute the second time
            await assert.isRejected(
                didRegistry.registerAttribute(
                    did,
                    checksum,
                    providers,
                    value
                )
            )
        })

        it('Should only allow the owner to set an attribute', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(did, checksum, providers, value)

            const anotherPerson = { from: accounts[1] }

            await assert.isRejected(
                didRegistry.reserveDID(testUtils.hashString(did, anotherPerson)),
                'DID reserved'
            )
            // a different owner can register his own DID
            await assert.isRejected(
                // must not be able to add attributes to someone else's DID
                didRegistry.registerAttribute(did, checksum, providers, value, anotherPerson),
                'DID not reserved'
            )
        })
    })

    describe('get DIDRegister', () => {
        it('successful register should DIDRegister', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'
            const blockNumber = await common.getCurrentBlockNumber()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(did, checksum, providers, value)
            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.owner,
                accounts[0]
            )
            assert.strictEqual(
                storedDIDRegister.lastChecksum,
                checksum
            )
            assert.strictEqual(
                storedDIDRegister.lastUpdatedBy,
                accounts[0]
            )
            assert.isAtLeast(
                storedDIDRegister.blockNumberUpdated.toNumber(),
                blockNumber.toNumber() + 1
            )

            const getDIDRegisterIds = await didRegistry.getDIDRegisterIds()
            assert.isAtLeast(getDIDRegisterIds.length, 1)
            assert.strictEqual(
                getDIDRegisterIds[getDIDRegisterIds.length - 1],
                did
            )
        })
    })

    describe('register DID providers', () => {
        it('should register did with providers', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(did, checksum, providers, value)
            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.providers.length,
                2
            )

            assert.strictEqual(await didRegistry.isDIDProvider(did, providers[0]), true)
            assert.strictEqual(await didRegistry.isDIDProvider(did, providers[1]), true)
            assert.strictEqual(await didRegistry.isDIDProvider(did, accounts[7]), false)
        })

        it('should owner able to remove DID provider', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(did, checksum, providers, value)
            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.providers.length,
                providers.length
            )
            await didRegistry.removeDIDProvider(
                did,
                providers[0]
            )
            assert.strictEqual(
                await didRegistry.isDIDProvider(did, providers[0]),
                false
            )
        })

        it('should DID owner able to remove all the providers', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(did, checksum, providers, value)
            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.providers.length,
                providers.length
            )
            await didRegistry.removeDIDProvider(
                did,
                providers[0]
            )
            await didRegistry.removeDIDProvider(
                did,
                providers[1]
            )
            // remove twice to check the fork (-1)
            await didRegistry.removeDIDProvider(
                did,
                providers[1]
            )

            // assert
            assert.strictEqual(
                await didRegistry.isDIDProvider(did, providers[0]),
                false
            )
            assert.strictEqual(
                await didRegistry.isDIDProvider(did, providers[1]),
                false
            )
        })

        it('should register did then add providers', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerAttribute(did, checksum, [], value)
            const storedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                storedDIDRegister.providers.length,
                0
            )

            assert.strictEqual(await didRegistry.isDIDProvider(did, providers[0]), false)
            assert.strictEqual(await didRegistry.isDIDProvider(did, providers[1]), false)

            await didRegistry.addDIDProvider(did, providers[0])
            assert.strictEqual(await didRegistry.isDIDProvider(did, providers[0]), true)

            const updatedDIDRegister = await didRegistry.getDIDRegister(did)
            assert.strictEqual(
                updatedDIDRegister.providers.length,
                1
            )
            assert.strictEqual(updatedDIDRegister.providers[0], providers[0])
        })

        it('should not register a did provider address that has the same DIDRegistry address', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did))
            await assert.isRejected(
                didRegistry.registerAttribute(did, checksum, [didRegistry.address], value),
                'Invalid provider'
            )
        })

        it('should not register a did if its not previously reserved', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await assert.isRejected(
                didRegistry.registerAttribute(did, checksum, [didRegistry.address], value),
                'DID not reserved'
            )
        })

        it('should not allow to reserve a DID more than once', async () => {
            const did = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))

            await assert.isRejected(
                didRegistry.reserveDID(testUtils.hashString(did)),
                'DID reserved'
            )
        })
    })

    describe('transfer DID ownership', () => {
        it('should DID owner transfer a DID ownership', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const didOwner = accounts[2]
            const newDIDOwner = accounts[3]
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did), { from: didOwner})
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value,
                {
                    from: didOwner
                }
            )

            // act
            await didRegistry.transferDIDOwnership(
                did,
                newDIDOwner,
                {
                    from: didOwner
                }
            )

            // assert
            assert.strictEqual(
                await didRegistry.getDIDOwner(did),
                newDIDOwner
            )
        })

        it('should reject to transfer a DID ownership in case of invalid DID owner', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const didOwner = accounts[2]
            const newDIDOwner = accounts[3]
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did), { from: didOwner})
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value,
                {
                    from: didOwner
                }
            )

            // act & assert
            await assert.isRejected(
                didRegistry.transferDIDOwnership(
                    did,
                    newDIDOwner
                ),
                'Only owner'
            )
        })
    })

    describe('grantPermissions', () => {
        it('should grant permission only in case of DID owner', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const didOwner = accounts[2]
            const grantee = accounts[3]
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did), { from: didOwner})
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value,
                {
                    from: didOwner
                }
            )

            await didRegistry.grantPermission(
                did,
                grantee,
                {
                    from: didOwner
                }
            )
            // act & assert
            assert.strictEqual(
                await didRegistry.getPermission(
                    did,
                    grantee
                ),
                true
            )
        })
        it('should fail to grant permission if not a DID owner', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const didOwner = accounts[2]
            const grantee = accounts[3]
            const newDIDOwner = accounts[4]
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did), { from: didOwner})
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value,
                {
                    from: didOwner
                }
            )

            await assert.isRejected(
                didRegistry.grantPermission(
                    did,
                    grantee,
                    {
                        from: newDIDOwner
                    }
                ),
                'Only owner'
            )
            // act & assert
            assert.strictEqual(
                await didRegistry.getPermission(
                    did,
                    grantee
                ),
                false
            )
        })
    })

    describe('revokePermissions', () => {
        it('should revoke permission only in case of DID owner', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const didOwner = accounts[2]
            const grantee = accounts[3]
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did), { from: didOwner})
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value,
                {
                    from: didOwner
                }
            )

            await didRegistry.grantPermission(
                did,
                grantee,
                {
                    from: didOwner
                }
            )

            await didRegistry.revokePermission(
                did,
                grantee,
                {
                    from: didOwner
                }
            )

            // act & assert
            assert.strictEqual(
                await didRegistry.getPermission(
                    did,
                    grantee
                ),
                false
            )
        })

        it('should fail to revoke permission if permission is not exists', async () => {
            const did = testUtils.generateId()
            const checksum = testUtils.generateId()
            const didOwner = accounts[2]
            const grantee = accounts[3]
            const value = 'https://nevermined.io/did/nevermined/test-attr-example.txt'

            await didRegistry.reserveDID(testUtils.hashString(did), { from: didOwner})
            await didRegistry.registerAttribute(
                did,
                checksum,
                providers,
                value,
                {
                    from: didOwner
                }
            )

            await assert.isRejected(
                didRegistry.revokePermission(
                    did,
                    grantee,
                    {
                        from: didOwner
                    }
                ),
                'Grantee already revoked'
            )

            // act & assert
            assert.strictEqual(
                await didRegistry.getPermission(
                    did,
                    grantee
                ),
                false
            )
        })
    })

    describe('Provenance #wasGeneratedBy()', () => {
        it('should generate an entity', async () => {
            const did = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            const result = await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            didRegistry.getProvenanceEntry(did)

            testUtils.assertEmitted(
                result,
                1,
                'DIDAttributeRegistered'
            )
            testUtils.assertEmitted(
                result,
                1,
                'ProvenanceAttributeRegistered'
            )
            testUtils.assertEmitted(
                result,
                1,
                'WasGeneratedBy'
            )
        })

        it('should fetch a provenance entry', async () => {
            const did = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            const storedProvEntry = await didRegistry.getProvenanceEntry(did)
            assert.strictEqual(
                storedProvEntry.createdBy,
                accounts[0]
            )
            assert.strictEqual(
                storedProvEntry.did,
                did
            )
        })
    })

    describe('Provenance #used()', () => {
        it('should use an entity from owner', async () => {
            const did = testUtils.generateId()
            const _provId = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            const result = await didRegistry.used(_provId, did, owner, Activities.USED, [], 'doing something')
            testUtils.assertEmitted(
                result,
                1,
                'Used'
            )

            const storedProvEntry = await didRegistry.getProvenanceEntry(_provId)
            assert.strictEqual(
                storedProvEntry.createdBy,
                accounts[0]
            )
            assert.strictEqual(
                storedProvEntry.did,
                did
            )
        })

        it('should use an entity from delegate', async () => {
            const did = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            didRegistry.addDIDProvenanceDelegate(did, someone)

            await didRegistry.used(testUtils.generateId(), did, owner, Activities.USED, [], '', {
                from: someone
            })
        })

        it('should fail to use an entity from someone', async () => {
            const did = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            await assert.isRejected(
                // must not be able to add attributes to someone else's DID
                didRegistry.used(testUtils.generateId(), did, owner, Activities.USED, [], '', {
                    from: someone
                }),
                'Only owner, provider or delegate'
            )
        })
    })

    describe('Provenance #wasDerivedFrom()', () => {
        it('should use an entity from owner', async () => {
            const did = testUtils.generateId()
            const _newDid = testUtils.generateId()
            const _provId = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            const result = await didRegistry.wasDerivedFrom(_provId, _newDid, did, owner, Activities.DERIVED_FROM, 'derived')
            testUtils.assertEmitted(
                result,
                1,
                'WasDerivedFrom'
            )

            const storedProvEntry = await didRegistry.getProvenanceEntry(_provId)
            assert.strictEqual(
                storedProvEntry.createdBy,
                accounts[0]
            )
            assert.strictEqual(
                storedProvEntry.did,
                _newDid
            )
        })
    })

    describe('Provenance #wasAssociatedWith()', () => {
        it('should use an entity from owner', async () => {
            const did = testUtils.generateId()
            const _provId = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            const result = await didRegistry.wasAssociatedWith(_provId, did, owner, Activities.ASSOCIATED_WITH, 'associated')
            testUtils.assertEmitted(
                result,
                1,
                'WasAssociatedWith'
            )

            const storedProvEntry = await didRegistry.getProvenanceEntry(_provId)
            assert.strictEqual(
                storedProvEntry.createdBy,
                accounts[0]
            )
            assert.strictEqual(
                storedProvEntry.did,
                did
            )
        })
    })

    describe('Provenance #actedOnBehalf()', () => {
        it('we can validate owner signature', async () => {
            const _sourceMessage = 'hi there' // did + owner

            const _message = testUtils.toEthSignedMessageHash(
                web3.utils.sha3(_sourceMessage))
            const _messageHash = testUtils.toEthSignedMessageHash(_message)
            const _signature = testUtils.fixSignature(
                await web3.eth.sign(_message, owner)
            )

            const valid = await common.provenanceSignatureIsCorrect(
                owner, _messageHash, _signature)

            assert.isOk(valid, 'Signature doesnt match')
        })

        it('we can generate the same signatures', async () => {
            const did = testUtils.generateId()

            const _message = testUtils.toEthSignedMessageHash(
                web3.utils.sha3(did + delegates[1]))
            const _messageHash = testUtils.toEthSignedMessageHash(_message)
            const _signature = testUtils.fixSignature(
                await web3.eth.sign(_message, delegates[1])
            )

            const valid = await common.provenanceSignatureIsCorrect(
                delegates[1], _messageHash, _signature)

            assert.isOk(valid, 'Signature doesnt match')
        })

        it('should act in behalf of delegate 2', async () => {
            const did = testUtils.generateId()

            await didRegistry.reserveDID(testUtils.hashString(did))
            await didRegistry.registerDID(
                did,
                testUtils.generateId(),
                providers,
                value,
                Activities.GENERATED,
                'hi there'
            )

            await didRegistry.addDIDProvenanceDelegate(did, delegates[1])

            const _message = web3.utils.sha3(
                did + delegates[1])

            const _signatureDelegate = testUtils.fixSignature(
                await web3.eth.sign(_message, delegates[1])
            )

            assert.isOk(await common.provenanceSignatureIsCorrect(
                delegates[1], testUtils.toEthSignedMessageHash(_message), _signatureDelegate))

            const result = await didRegistry.actedOnBehalf(
                testUtils.toEthSignedMessageHash(_message),
                did,
                delegates[1],
                owner,
                Activities.ACTED_IN_BEHALF,
                _signatureDelegate,
                '',
                { from: delegates[1] }
            )

            testUtils.assertEmitted(
                result,
                1,
                'ActedOnBehalf'
            )
        })
    })
})
