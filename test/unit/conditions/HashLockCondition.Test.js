/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EpochLibrary = artifacts.require('EpochLibrary')
const ConditionStoreManager = artifacts.require('ConditionStoreManager')
const HashLockCondition = artifacts.require('HashLockCondition')

const constants = require('../../helpers/constants.js')

contract('HashLockCondition constructor', (accounts) => {
    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        owner = accounts[1],
        createRole = accounts[0]
    } = {}) {
        const epochLibrary = await EpochLibrary.new()
        await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

        const conditionStoreManager = await ConditionStoreManager.new()
        await conditionStoreManager.initialize(
            owner,
            { from: owner }
        )

        await conditionStoreManager.delegateCreateRole(
            createRole,
            { from: owner }
        )

        const hashLockCondition = await HashLockCondition.new()
        await hashLockCondition.initialize(
            owner,
            conditionStoreManager.address,
            { from: owner }
        )
        conditionType = hashLockCondition.address
        return { hashLockCondition, conditionStoreManager, conditionId, conditionType, owner, createRole }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            const epochLibrary = await EpochLibrary.new()
            await ConditionStoreManager.link('EpochLibrary', epochLibrary.address)

            const conditionStoreManager = await ConditionStoreManager.new()
            const hashLockCondition = await HashLockCondition.new()
            await hashLockCondition.initialize(
                accounts[0],
                conditionStoreManager.address,
                { from: accounts[0] }
            )
        })
    })

    describe('fulfill non existing condition', () => {
        it('should not fulfill if conditions do not exist for uint preimage', async () => {
            const { hashLockCondition, conditionId } = await setupTest()

            await assert.isRejected(
                hashLockCondition.fulfill(
                    conditionId,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('should not fulfill if conditions do not exist for string preimage', async () => {
            const { hashLockCondition, conditionId } = await setupTest()

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,string)'](
                    conditionId,
                    constants.condition.hashlock.string.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('should not fulfill if conditions do not exist for bytes32 preimage', async () => {
            const { hashLockCondition, conditionId } = await setupTest()

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                    conditionId,
                    constants.condition.hashlock.bytes32.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })
    })

    describe('fulfill existing condition', () => {
        it('should fulfill if conditions exist for uint preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.fulfill(
                constants.bytes32.one,
                constants.condition.hashlock.uint.preimage
            )

            const { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
        })

        it('should fulfill if conditions exist for string preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.string.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.methods['fulfill(bytes32,string)'](
                constants.bytes32.one,
                constants.condition.hashlock.string.preimage
            )

            const { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
        })

        it('should fulfill if conditions exist for bytes32 preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.bytes32.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                constants.bytes32.one,
                constants.condition.hashlock.bytes32.preimage
            )

            const { state } = await conditionStoreManager.getCondition(conditionId)
            assert.strictEqual(state.toNumber(), constants.condition.state.fulfilled)
        })
    })

    describe('fail to fulfill existing condition', () => {
        it('wrong preimage should fail to fulfill if conditions exist for uint preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage + 333
                ),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage with string', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,string)'](
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage + 'some bogus'
                ),
                constants.acl.error.invalidUpdateRoled
            )
        })

        it('wrong preimage should fail to fulfill if conditions exist for string preimage', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.string.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('wrong preimage should fail to fulfill if conditions exist for uint preimage with bytes32', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            await assert.isRejected(
                hashLockCondition.methods['fulfill(bytes32,bytes32)'](
                    constants.bytes32.one,
                    constants.condition.hashlock.bytes32.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('right preimage should fail to fulfill if conditions already fulfilled for uint', async () => {
            const { hashLockCondition, conditionStoreManager } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address)

            // fulfill once
            await hashLockCondition.fulfill(
                constants.bytes32.one,
                constants.condition.hashlock.uint.preimage
            )
            // try to fulfill another time
            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.condition.state.error.invalidStateTransition
            )
        })

        it('should fail to fulfill if conditions has different type ref', async () => {
            const { hashLockCondition, conditionStoreManager, createRole, owner } = await setupTest()

            const conditionId = await hashLockCondition.generateId(
                constants.bytes32.one,
                constants.condition.hashlock.uint.keccak
            )

            // create a condition of a type different than hashlockcondition
            await conditionStoreManager.createCondition(
                conditionId,
                hashLockCondition.address
            )

            await conditionStoreManager.delegateUpdateRole(
                conditionId,
                createRole,
                { from: owner }
            )

            // try to fulfill from hashlockcondition
            await assert.isRejected(
                hashLockCondition.fulfill(
                    constants.bytes32.one,
                    constants.condition.hashlock.uint.preimage
                ),
                constants.acl.error.invalidUpdateRole
            )
        })
    })
})
