/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const HashLockCondition = artifacts.require('HashLockCondition')
const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreLibrary = artifacts.require('ConditionStoreLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')

const constants = require('../../helpers/constants.js')
const increaseTime = require('../../helpers/increaseTime.js')
const testUtils = require('../../helpers/utils.js')

contract('ConditionStoreManager', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0],
        owner = accounts[0]
    } = {}) {
        const common = await Common.new()
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
        const conditionStoreLibrary = await ConditionStoreLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
        await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: owner }
        )

        const hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: owner }
        )

        return {
            common,
            hashLockCondition,
            epochLibrary,
            conditionStoreManager,
            conditionId,
            conditionType,
            createRole,
            owner
        }
    }

    describe('deploy and initialize', () => {
        it('contract should deploy', async () => {
            // act-assert
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreLibrary.link('EpochLibrary', epochLibrary.address)
            const conditionStoreLibrary = await ConditionStoreLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)
            await ConditionStoreManager.link('ConditionStoreLibrary', conditionStoreLibrary.address)
            await ConditionStoreManager.new()
        })

        it('contract should initialize', async () => {
            const owner = accounts[1]

            const conditionStoreManager = await ConditionStoreManager.new()
            // address should be 0x0 before setup
            assert.strictEqual(
                await conditionStoreManager.owner(),
                constants.address.zero
            )
            assert.strictEqual(
                await conditionStoreManager.getCreateRole(),
                constants.address.zero
            )

            // address should be set after correct setup
            await conditionStoreManager.initialize(owner)

            assert.strictEqual(
                await conditionStoreManager.getCreateRole(),
                owner
            )
            assert.strictEqual(
                await conditionStoreManager.owner(),
                owner
            )
        })

        it('should able to delegate createRole from owner', async () => {
            const createRole = accounts[1]
            const owner = accounts[0]

            const conditionStoreManager = await ConditionStoreManager.new()

            // act
            await conditionStoreManager.initialize(owner)
            await conditionStoreManager.delegateCreateRole(createRole, { from: owner })

            // assert
            assert.strictEqual(
                await conditionStoreManager.getCreateRole(),
                createRole
            )
        })

        it('contract should not initialize with zero owner', async () => {
            const owner = constants.address.zero

            const conditionStoreManager = await ConditionStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                conditionStoreManager.initialize(owner),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize with zero createRole/owner', async () => {
            const owner = constants.address.zero

            const conditionStoreManager = await ConditionStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                conditionStoreManager.initialize(owner),
                constants.address.error.invalidAddress0x0
            )
        })

        it('contract should not initialize without arguments', async () => {
            const conditionStoreManager = await ConditionStoreManager.new()

            // setup with zero fails
            await assert.isRejected(
                conditionStoreManager.initialize(),
                constants.initialize.error.invalidNumberParamsGot0Expected1
            )
        })

        it('anyone should not change createRole after initialize except owner', async () => {
            const createRole = accounts[0]
            const owner = accounts[1]
            // setup correctly
            const conditionStoreManager = await ConditionStoreManager.new()

            await conditionStoreManager.initialize(owner)

            assert.strictEqual(
                await conditionStoreManager.getCreateRole(),
                owner
            )

            // try to force with other account
            const otherCreateRole = accounts[2]
            assert.notEqual(otherCreateRole, createRole)
            await assert.isRejected(
                conditionStoreManager.initialize(
                    otherCreateRole
                ),
                'Contract instance has already been initialized'
            )
            assert.strictEqual(
                await conditionStoreManager.getCreateRole(),
                owner
            )
        })
    })

    describe('create conditions', () => {
        it('createRole should create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest()

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.uninitialized)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 0)

            // conditionId should exist after create
            // await conditionStoreManager.createCondition(conditionId, conditionType, { from: createRole })
            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.unfulfilled)
            assert.strictEqual((await conditionStoreManager.getConditionListSize()).toNumber(), 1)
        })

        it('createRole should create with zero timeout and timelock', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest()

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            // conditionId should exist after create
            const {
                typeRef,
                state,
                timeLock,
                timeOut
            } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(typeRef, hashLockCondition.address)
            assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            assert.strictEqual(timeLock.toNumber(), 0)
            assert.strictEqual(timeOut.toNumber(), 0)
        })

        it('createRole should create with nonzero timeout and timelock', async () => {
            const { conditionStoreManager, conditionId, hashLockCondition, createRole } = await setupTest()
            const conditionTimeLock = 1
            const conditionTimeOut = 10

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            const {
                typeRef,
                state,
                timeLock,
                timeOut,
                blockNumber
            } = await conditionStoreManager.getCondition(conditionId)

            assert.strictEqual(typeRef, hashLockCondition.address)
            assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            assert.strictEqual(timeLock.toNumber(), conditionTimeLock)
            assert.strictEqual(timeOut.toNumber(), conditionTimeOut)
            assert.isAbove(blockNumber.toNumber(), 0)
        })

        it('invalid createRole should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest({ createRole: accounts[1] })

            await assert.isRejected(
                conditionStoreManager.methods['createCondition(bytes32,address)'](
                    conditionId,
                    hashLockCondition.address,
                    { from: createRole }
                ),
                constants.acl.error.invalidCreateRole
            )
        })

        it('invalid address should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                conditionType,
                createRole
            } = await setupTest({ conditionType: constants.address.zero })

            await assert.isRejected(
                conditionStoreManager.methods['createCondition(bytes32,address)'](
                    conditionId,
                    conditionType,
                    { from: createRole }
                ),
                constants.address.error.invalidAddress0x0
            )
        })

        it('existing ID should not create', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await assert.isRejected(
                conditionStoreManager.methods['createCondition(bytes32,address)'](
                    conditionId,
                    hashLockCondition.address,
                    { from: createRole }
                ),
                constants.error.idAlreadyExists
            )
        })

        it('create condition should emit ConditionCreated event', async () => {
            const { conditionStoreManager, conditionId, hashLockCondition } = await setupTest()

            // conditionId should exist after create
            const result = await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address
            )
            testUtils.assertEmitted(result, 1, 'ConditionCreated')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'ConditionCreated')
            expect(eventArgs._id).to.equal(conditionId)
            expect(eventArgs._typeRef).to.equal(hashLockCondition.address)
        })
    })

    describe('get conditions', () => {
        it('successful create should get unfulfilled condition', async () => {
            const {
                common,
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest()

            const blockNumber = await common.getCurrentBlockNumber()
            // returns true on create
            // await conditionStoreManager.createCondition(conditionId, conditionType, { from: createRole })
            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )
            const {
                typeRef,
                state,
                timeLock,
                timeOut,
                lastUpdatedBy,
                blockNumberUpdated
            } = await conditionStoreManager.getCondition(conditionId)

            assert.strictEqual(typeRef, hashLockCondition.address)
            assert.strictEqual(state.toNumber(), constants.condition.state.unfulfilled)
            assert.strictEqual(timeLock.toNumber(), 0)
            assert.strictEqual(timeOut.toNumber(), 0)
            expect(lastUpdatedBy)
                .to.equal(accounts[0])
            expect(blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })

        it('no create should get uninitialized Condition', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()

            const { typeRef, state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(typeRef, constants.address.zero)
            assert.strictEqual(state.toNumber(), constants.condition.state.uninitialized)
        })
    })

    describe('update condition state', () => {
        it('should not transition from uninitialized', async () => {
            const { conditionStoreManager, conditionId } = await setupTest()
            const newState = constants.condition.state.unfulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('correct role should transition from unfulfilled to fulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )
            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
        })

        it('correct role should transition from unfulfilled to aborted', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })
            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            const newState = constants.condition.state.aborted

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)
        })

        it('correct role should not transition from unfulfilled to uninitialized', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            const newState = constants.condition.state.uninitialized

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from unfulfilled to unfulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            const newState = constants.condition.state.unfulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to unfulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to unfulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.unfulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to uninitialized', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to uninitialized', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.uninitialized),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to aborted', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to fulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from fulfilled to fulfilled', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole })

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )
            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.fulfilled),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('correct role should not transition from aborted to aborted', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted)
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, constants.condition.state.aborted),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('wrong role should not update', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest()

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address,
                { from: createRole }
            )

            const newState = constants.condition.state.fulfilled
            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('update condition should emit ConditionUpdated event', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                owner,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            await conditionStoreManager.methods['createCondition(bytes32,address)'](
                conditionId,
                hashLockCondition.address
            )

            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            const result = await conditionStoreManager.updateConditionState(conditionId, newState)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)

            testUtils.assertEmitted(result, 1, 'ConditionUpdated')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'ConditionUpdated')
            expect(eventArgs._id).to.equal(conditionId)
            expect(eventArgs._typeRef).to.equal(createRole)
            expect(eventArgs._state.toNumber()).to.equal(constants.condition.state.fulfilled)
        })
    })

    describe('time locked conditions', () => {
        it('zero time lock should not time lock', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 0
            const conditionTimeOut = 0

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole })
            assert.strictEqual(
                await conditionStoreManager.isConditionTimeLocked(conditionId),
                false
            )
        })

        it('nonzero time lock should time lock', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 10
            const conditionTimeOut = 0

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole })
            assert.strictEqual(
                await conditionStoreManager.isConditionTimeLocked(conditionId),
                true
            )
        })

        it('nonzero time lock should not update', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 10
            const conditionTimeOut = 0

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut
                , { from: createRole }
            )

            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.epoch.error.isTimeLocked
            )
        })

        it('nonzero time lock should update after timeLock expires', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 4
            const conditionTimeOut = 0

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await assert.isRejected(
                conditionStoreManager.updateConditionState(conditionId, newState),
                constants.condition.epoch.error.isTimeLocked
            )

            // waited for a block
            await increaseTime(2)

            await conditionStoreManager.updateConditionState(conditionId, newState)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled)
        })
    })

    describe('timeout conditions', () => {
        it('zero time out should not time out', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 0
            const conditionTimeOut = 0

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut
                , { from: createRole }
            )

            assert.strictEqual(
                await conditionStoreManager.isConditionTimedOut(conditionId),
                false
            )
        })

        it('nonzero time out should time out', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 0
            const conditionTimeOut = 1

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            assert.strictEqual(
                await conditionStoreManager.isConditionTimedOut(conditionId),
                false
            )

            // wait for a block
            await increaseTime(1)

            assert.strictEqual(
                await conditionStoreManager.isConditionTimedOut(conditionId),
                true
            )
        })

        it('nonzero time out should not abort after time out', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 0
            const conditionTimeOut = 1

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            // wait for a block
            await increaseTime(1)

            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, newState)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)
        })

        it('nonzero time lock should update before time out', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                createRole,
                owner
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 0
            const conditionTimeOut = 2

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await conditionStoreManager.updateConditionState(conditionId, newState)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled
            )
        })

        it('timed out condition should abort by timeout', async () => {
            const {
                conditionStoreManager,
                hashLockCondition,
                conditionId,
                createRole
            } = await setupTest()

            const conditionTimeLock = 0
            const conditionTimeOut = 1

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            // wait for a block
            await increaseTime(1)

            await hashLockCondition.abortByTimeOut(conditionId)
            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)
        })

        it('timed out condition should abort and emit corresponding ConditionUpdated event', async () => {
            const {
                conditionStoreManager,
                conditionId,
                hashLockCondition,
                owner,
                createRole
            } = await setupTest({ conditionType: accounts[0] })

            const conditionTimeLock = 0
            const conditionTimeOut = 1

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            const newState = constants.condition.state.fulfilled

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            await increaseTime(1)

            const result = await conditionStoreManager.updateConditionState(conditionId, newState)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(conditionId)).toNumber(),
                constants.condition.state.aborted)

            testUtils.assertEmitted(result, 1, 'ConditionUpdated')
            const eventArgs = testUtils.getEventArgsFromTx(result, 'ConditionUpdated')
            expect(eventArgs._id).to.equal(conditionId)
            expect(eventArgs._typeRef).to.equal(createRole)
            expect(eventArgs._state.toNumber()).to.equal(constants.condition.state.aborted)
        })

        it('timed out condition should not abort before timeout', async () => {
            const {
                conditionStoreManager,
                hashLockCondition,
                conditionId,
                createRole
            } = await setupTest()

            const conditionTimeLock = 0
            const conditionTimeOut = 10

            await conditionStoreManager.methods['createCondition(bytes32,address,uint256,uint256)'](
                conditionId,
                hashLockCondition.address,
                conditionTimeLock,
                conditionTimeOut,
                { from: createRole }
            )

            // wait for a block
            await increaseTime(1)

            await assert.isRejected(
                hashLockCondition.abortByTimeOut(conditionId),
                constants.condition.epoch.error.conditionNeedsToBeTimedOut)
        })
    })
})
