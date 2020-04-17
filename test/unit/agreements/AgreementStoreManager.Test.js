/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const EpochLibrary = artifacts.require('EpochLibrary')
const AgreementStoreLibrary = artifacts.require('AgreementStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const AgreementStoreManager = artifacts.require('AgreementStoreManager')
const HashLockCondition = artifacts.require('HashLockCondition')

const constants = require('../../helpers/constants.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils.js')

contract('AgreementStoreManager', (accounts) => {
    let common,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        conditionTypes,
        actorTypeIds,
        templateId

    async function setupTest({
        agreementId = constants.bytes32.one,
        conditionIds = [constants.address.dummy],
        did = constants.did[0],
        checksum = testUtils.generateId(),
        value = constants.registry.url,
        createRole = accounts[0],
        deployer = accounts[8],
        owner = accounts[9],
        timeLock = 0,
        timeOut = 0,
        registerDID = false,
        proposeTemplate = false,
        approveTemplate = false
    } = {}) {
        ({
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ))
        common = await Common.new()
        const providers = [accounts[8], accounts[9]]
        if (registerDID) {
            await didRegistry.registerAttribute(did, checksum, providers, value, {
                from: owner
            })
        }

        const hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: owner }
        )

        // propose and approve template
        await templateStoreManager.registerTemplateActorType(
            'provider',
            {
                from: owner
            }
        )
        const providerActorTypeId = await templateStoreManager.getTemplateActorTypeId('provider')

        await templateStoreManager.registerTemplateActorType(
            'consumer',
            {
                from: owner
            }
        )
        const consumerActorTypeId = await templateStoreManager.getTemplateActorTypeId('consumer')
        // any random ID
        templateId = constants.bytes32.one
        const conditionType = hashLockCondition.address

        conditionTypes = [
            conditionType,
            conditionType,
            conditionType
        ]

        actorTypeIds = [
            providerActorTypeId,
            consumerActorTypeId
        ]

        if (proposeTemplate) {
            await templateStoreManager.methods['proposeTemplate(bytes32,address[],bytes32[],string)'](
                templateId,
                conditionTypes,
                actorTypeIds,
                'SampleTemplate'
            )
        }

        if (approveTemplate) {
            await templateStoreManager.approveTemplate(templateId, { from: owner })
        }

        conditionIds = [constants.bytes32.zero, constants.bytes32.one, constants.bytes32.two]

        return {
            common,
            agreementStoreManager,
            agreementId,
            conditionIds,
            did,
            createRole,
            owner,
            providers,
            templateId,
            timeLock,
            timeOut,
            conditionTypes,
            actorTypeIds
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            await AgreementStoreManager.new()
        })

        it('contract should not initialize with zero address', async () => {
            const createRole = accounts[0]

            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.methods['initialize(address,address,address,address)'](
                    constants.address.zero,
                    createRole,
                    createRole,
                    createRole,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.methods['initialize(address,address,address,address)'](
                    createRole,
                    constants.address.zero,
                    createRole,
                    createRole,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.methods['initialize(address,address,address,address)'](
                    createRole,
                    createRole,
                    constants.address.zero,
                    createRole,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.methods['initialize(address,address,address,address)'](
                    createRole,
                    createRole,
                    createRole,
                    constants.address.zero,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize without arguments', async () => {
            const agreementStoreLibrary = await AgreementStoreLibrary.new()
            await AgreementStoreManager.link('AgreementStoreLibrary', agreementStoreLibrary.address)
            const agreementStoreManager = await AgreementStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                agreementStoreManager.initialize(),
                constants.initialize.error.invalidNumberParamsGot0Expected4
            )
        })
    })

    describe('create agreement', () => {
        it('should not create deprecated create agreement method', async () => {
            const {
                did,
                timeLock,
                timeOut
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })
            // construct agreement
            const agreementId = constants.bytes32.one
            const agreement = {
                did: did,
                conditionTypes: [
                    agreementStoreManager.address,
                    agreementStoreManager.address,
                    agreementStoreManager.address
                ],
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0]
            }
            await assert.isRejected(
                agreementStoreManager.methods['createAgreement(bytes32,bytes32,address[],bytes32[],uint256[],uint256[])'](
                    agreementId,
                    ...Object.values(agreement)
                ),
                'Template not Approved'
            )
        })

        it('create agreement should create agreement and conditions', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers,
                conditionTypes
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.one

            // create agreement
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            let storedCondition

            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
                expect(storedCondition.timeLock.toNumber()).to.equal(agreement.timeLocks[i])
                expect(storedCondition.timeOut.toNumber()).to.equal(agreement.timeOuts[i])
            })

            expect((await agreementStoreManager.getAgreementListSize()).toNumber()).to.equal(1)
        })

        it('should not create agreement with existing conditions', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            // create agreement
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            const otherAgreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(otherAgreement)
                ),
                constants.error.idAlreadyExists
            )
        })

        it('should not create agreement with uninitialized template', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest()

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement)
                ),
                constants.template.error.templateNotApproved
            )
        })

        it('should not create agreement with proposed template', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ proposeTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement)
                ),
                constants.template.error.templateNotApproved
            )
        })

        it('should not create agreement with revoked template', async () => {
            const {
                did,
                owner,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            await templateStoreManager.revokeTemplate(templateId, { from: owner })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement)
                ),
                constants.template.error.templateNotApproved
            )
        })

        it('should not create agreement with existing ID', async () => {
            const {
                did,
                owner,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            // create agreement
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDOwner(agreementId, owner),
                true
            )

            const otherAgreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(otherAgreement)
                ),
                constants.error.idAlreadyExists
            )
        })

        it('should return false if weather it invalid DID or owner', async () => {
            const {
                did,
                owner,
                common,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            // create agreement
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            // assert
            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDOwner(agreementId, owner),
                true
            )

            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDOwner(agreementId, common.address),
                false
            )

            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDOwner(constants.bytes32.one, owner),
                false
            )

            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDOwner(constants.bytes32.one, common.address),
                false
            )
        })
        it('should able to get the Agreement DID Owner', async () => {
            const {
                did,
                owner,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            // create agreement
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            assert.strictEqual(
                await agreementStoreManager.getAgreementDIDOwner(agreementId),
                owner
            )
        })
        it('should get agreement actors data', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers,
                actorTypeIds
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            // create agreement
            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            const actors = await agreementStoreManager.getAgreementActors(agreementId)
            for (var i = 0; i < actors.length; i++) {
                assert.strictEqual(
                    actors[i],
                    providers[i]
                )
                assert.strictEqual(
                    await agreementStoreManager.getActorType(
                        agreementId,
                        actors[i]
                    ),
                    actorTypeIds[i]
                )
            }
        })
        it('should not create agreement if DID not registered', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await assert.isRejected(
                agreementStoreManager.createAgreement(
                    agreementId,
                    ...Object.values(agreement)
                ),
                constants.registry.error.didNotRegistered
            )
        })

        it('should create agreement emit event', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            const trxReceipt = await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )
            testUtils.assertEmitted(trxReceipt, 1, 'AgreementCreated')
            testUtils.assertEmitted(trxReceipt, 2, 'AgreementActorAdded')
            const AgreementCreatedEventArgs = testUtils.getEventArgsFromTx(trxReceipt, 'AgreementCreated')
            expect(AgreementCreatedEventArgs.agreementId).to.equal(agreementId)
            expect(AgreementCreatedEventArgs.did).to.equal(did)
            expect(AgreementCreatedEventArgs.createdBy).to.equal(accounts[0])
        })
    })

    describe('get agreement', () => {
        it('successful create should get agreement', async () => {
            const {
                did,
                owner,
                common,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const blockNumber = await common.getCurrentBlockNumber()

            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            // TODO - containSubset
            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)

            expect(storedAgreement.did)
                .to.equal(agreement.did)
            expect(storedAgreement.didOwner)
                .to.equal(owner)
            expect(storedAgreement.templateId)
                .to.equal(templateId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(accounts[0])
            expect(storedAgreement.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })

        it('should get multiple agreements for same did & template', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            const otherAgreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.three,
                    constants.bytes32.four,
                    constants.bytes32.five
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const otherAgreementId = constants.bytes32.two

            await agreementStoreManager.createAgreement(
                otherAgreementId,
                ...Object.values(otherAgreement)
            )

            assert.lengthOf(
                await agreementStoreManager.getAgreementIdsForDID(did),
                2)
            assert.lengthOf(
                await agreementStoreManager.getAgreementIdsForTemplateId(templateId),
                2)
        })
    })

    describe('is agreement DID provider', () => {
        it('should return true if agreement DID provider', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDProvider(
                    agreementId,
                    providers[0]
                ),
                true
            )
        })

        it('should return false if not agreement DID provider', async () => {
            const {
                did,
                templateId,
                timeLock,
                timeOut,
                providers
            } = await setupTest({ registerDID: true, proposeTemplate: true, approveTemplate: true })

            // construct agreement
            const agreement = {
                did: did,
                templateId: templateId,
                conditionIds: [
                    constants.bytes32.zero,
                    constants.bytes32.one,
                    constants.bytes32.two
                ],
                timeLocks: [0, timeLock, 0],
                timeOuts: [0, timeOut, 0],
                actors: providers
            }

            const agreementId = constants.bytes32.zero

            await agreementStoreManager.createAgreement(
                agreementId,
                ...Object.values(agreement)
            )

            const invalidProvider = accounts[5]

            assert.strictEqual(
                await agreementStoreManager.isAgreementDIDProvider(
                    agreementId,
                    invalidProvider
                ),
                false
            )
        })
    })
})
