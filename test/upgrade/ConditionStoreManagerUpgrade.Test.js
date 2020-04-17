/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const constants = require('../helpers/constants.js')

const {
    confirmUpgrade,
    loadWallet,
    submitTransaction,
    confirmTransaction
} = require('@oceanprotocol/dori')

const {
    deploy,
    upgrade
} = require('./Upgrader')

const ConditionStoreManager = artifacts.require('ConditionStoreManager')

const ConditionStoreChangeFunctionSignature = artifacts.require('ConditionStoreChangeFunctionSignature')
const ConditionStoreChangeInStorage = artifacts.require('ConditionStoreChangeInStorage')
const ConditionStoreChangeInStorageAndLogic = artifacts.require('ConditionStoreChangeInStorageAndLogic')
const ConditionStoreExtraFunctionality = artifacts.require('ConditionStoreExtraFunctionality')
const ConditionStoreWithBug = artifacts.require('ConditionStoreWithBug')

contract('ConditionStoreManager', (accounts) => {
    let conditionStoreManagerAddress,
        ownerWallet

    const verbose = false

    const upgrader = accounts[1]
    const approver = accounts[2]
    const conditionCreater = accounts[5]

    beforeEach('Load wallet each time', async function() {
        const addressBook = await deploy({
            web3,
            artifacts,
            contracts: ['ConditionStoreManager'],
            verbose
        })

        ownerWallet = await loadWallet(
            web3,
            'owner',
            verbose
        )

        conditionStoreManagerAddress = addressBook.ConditionStoreManager
    })

    async function setupTest({
        conditionId = constants.bytes32.one,
        conditionType = constants.address.dummy
    } = {}) {
        const conditionStoreManager = await ConditionStoreManager.at(conditionStoreManagerAddress)
        conditionType = conditionStoreManagerAddress
        return { conditionStoreManager, conditionId, conditionType }
    }

    describe('Test upgradability for ConditionStoreManager', () => {
        it('Should be possible to fix/add a bug', async () => {
            const { conditionId } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['ConditionStoreWithBug:ConditionStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.ConditionStoreManager,
                approver,
                verbose
            )

            const ConditionStoreWithBugInstance =
                await ConditionStoreWithBug.at(conditionStoreManagerAddress)

            // assert
            assert.strictEqual(
                (await ConditionStoreWithBugInstance.getConditionState(conditionId)).toNumber(),
                constants.condition.state.fulfilled,
                'condition should be fulfilled (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            const { conditionId, conditionType } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['ConditionStoreChangeFunctionSignature:ConditionStoreManager'],
                verbose
            })

            // init
            await confirmUpgrade(
                web3,
                taskBook.ConditionStoreManager,
                approver,
                verbose
            )

            const ConditionStoreChangeFunctionSignatureInstance =
                await ConditionStoreChangeFunctionSignature.at(conditionStoreManagerAddress)

            // call delegateCreateRole over multi sig wallet
            const txId = await submitTransaction(
                ownerWallet,
                conditionStoreManagerAddress,
                [
                    'delegateCreateRole',
                    ['address'],
                    [conditionCreater]
                ],
                upgrader,
                verbose
            )

            await confirmTransaction(
                ownerWallet,
                txId,
                approver,
                verbose
            )

            // assert
            assert.strictEqual(
                await ConditionStoreChangeFunctionSignatureInstance.getCreateRole(),
                conditionCreater,
                'Invalid create role!'
            )

            await ConditionStoreChangeFunctionSignatureInstance.createCondition(
                conditionId,
                conditionType,
                conditionCreater,
                { from: conditionCreater }
            )

            // assert
            assert.strictEqual(
                (await ConditionStoreChangeFunctionSignatureInstance.getConditionState(conditionId)).toNumber(),
                constants.condition.state.unfulfilled,
                'condition should be unfulfilled'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['ConditionStoreChangeInStorage:ConditionStoreManager'],
                verbose
            })

            // init
            await confirmUpgrade(
                web3,
                taskBook.ConditionStoreManager,
                approver,
                verbose
            )

            const ConditionStoreChangeInStorageInstance =
                await ConditionStoreChangeInStorage.at(conditionStoreManagerAddress)

            assert.strictEqual(
                (await ConditionStoreChangeInStorageInstance.conditionCount()).toNumber(),
                0
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            const { conditionId, conditionType } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['ConditionStoreChangeInStorageAndLogic:ConditionStoreManager'],
                verbose
            })

            // init
            await confirmUpgrade(
                web3,
                taskBook.ConditionStoreManager,
                approver,
                verbose
            )

            const ConditionStoreChangeInStorageAndLogicInstance =
                await ConditionStoreChangeInStorageAndLogic.at(conditionStoreManagerAddress)

            const txId = await submitTransaction(
                ownerWallet,
                conditionStoreManagerAddress,
                [
                    'delegateCreateRole',
                    ['address'],
                    [conditionCreater]
                ],
                upgrader,
                verbose
            )

            await confirmTransaction(
                ownerWallet,
                txId,
                approver,
                verbose
            )

            assert.strictEqual(
                (await ConditionStoreChangeInStorageAndLogicInstance.conditionCount()).toNumber(),
                0
            )

            await ConditionStoreChangeInStorageAndLogicInstance.createCondition(
                conditionId,
                conditionType,
                conditionCreater,
                { from: conditionCreater }
            )

            assert.strictEqual(
                (await ConditionStoreChangeInStorageAndLogicInstance.getConditionState(conditionId)).toNumber(),
                constants.condition.state.unfulfilled,
                'condition should be unfulfilled'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['ConditionStoreExtraFunctionality:ConditionStoreManager'],
                verbose
            })

            // init
            await confirmUpgrade(
                web3,
                taskBook.ConditionStoreManager,
                approver,
                verbose
            )

            const ConditionStoreExtraFunctionalityInstance =
                await ConditionStoreExtraFunctionality.at(conditionStoreManagerAddress)

            // asset
            assert.strictEqual(
                await ConditionStoreExtraFunctionalityInstance.dummyFunction(),
                true
            )
        })
    })
})
