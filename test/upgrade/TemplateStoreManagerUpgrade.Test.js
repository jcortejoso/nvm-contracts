/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const constants = require('../helpers/constants.js')

const {
    confirmUpgrade
} = require('@oceanprotocol/dori')

const {
    deploy,
    upgrade
} = require('./Upgrader')

const TemplateStoreManager = artifacts.require('TemplateStoreManager')
const TemplateStoreChangeFunctionSignature = artifacts.require('TemplateStoreChangeFunctionSignature')
const TemplateStoreChangeInStorage = artifacts.require('TemplateStoreChangeInStorage')
const TemplateStoreChangeInStorageAndLogic = artifacts.require('TemplateStoreChangeInStorageAndLogic')
const TemplateStoreExtraFunctionality = artifacts.require('TemplateStoreExtraFunctionality')
const TemplateStoreWithBug = artifacts.require('TemplateStoreWithBug')

contract('TemplateStoreManager', (accounts) => {
    let templateStoreManagerAddress

    const verbose = false
    const approver = accounts[3]

    async function setupTest({
        templateId = constants.bytes32.one,
        conditionType = accounts[0]
    } = {}) {
        await TemplateStoreManager.at(templateStoreManagerAddress)
        return {
            templateId,
            conditionType
        }
    }

    describe('Test upgradability for TemplateStoreManager', () => {
        beforeEach('Load wallet each time', async function() {
            const addressBook = await deploy({
                web3,
                artifacts,
                contracts: [
                    'ConditionStoreManager',
                    'TemplateStoreManager',
                    'AgreementStoreManager',
                    'LockRewardCondition',
                    'AccessSecretStoreCondition',
                    'EscrowReward',
                    'OceanToken',
                    'DIDRegistry',
                    'ComputeExecutionCondition'
                ],
                verbose
            })

            templateStoreManagerAddress = addressBook.TemplateStoreManager
            assert(templateStoreManagerAddress)
        })

        it('Should be possible to fix/add a bug', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['TemplateStoreWithBug:TemplateStoreManager'],
                strict: true,
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.TemplateStoreManager,
                approver,
                verbose
            )

            const TemplateStoreWithBugInstance = await TemplateStoreWithBug.at(templateStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                (await TemplateStoreWithBugInstance.getTemplateListSize()).toNumber(),
                0,
                'template list size should return zero (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['TemplateStoreChangeFunctionSignature:TemplateStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.TemplateStoreManager,
                approver,
                verbose
            )

            const TemplateStoreChangeFunctionSignatureInstance = await TemplateStoreChangeFunctionSignature.at(templateStoreManagerAddress)

            // act & assert
            await assert.isRejected(
                TemplateStoreChangeFunctionSignatureInstance.methods['proposeTemplate(bytes32,address[],bytes32[],string,address)'](
                    constants.bytes32.one,
                    [TemplateStoreChangeFunctionSignatureInstance.address],
                    [constants.bytes32.one],
                    'SampleTemplate',
                    accounts[3],
                    {
                        from: accounts[0]
                    }
                ),
                'Invalid address hash'
            )
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['TemplateStoreChangeInStorage:TemplateStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.TemplateStoreManager,
                approver,
                verbose
            )

            const TemplateStoreChangeInStorageInstance = await TemplateStoreChangeInStorage.at(templateStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                (await TemplateStoreChangeInStorageInstance.templateCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['TemplateStoreChangeInStorageAndLogic:TemplateStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.TemplateStoreManager,
                approver,
                verbose
            )

            const TemplateStoreChangeInStorageAndLogicInstance = await TemplateStoreChangeInStorageAndLogic.at(templateStoreManagerAddress)

            // act & assert
            await assert.isRejected(
                TemplateStoreChangeInStorageAndLogicInstance.methods['proposeTemplate(bytes32,address[],bytes32[],string,address)'](
                    constants.bytes32.one,
                    [TemplateStoreChangeInStorageAndLogicInstance.address],
                    [constants.bytes32.one],
                    'SampleTemplate',
                    accounts[3],
                    {
                        from: accounts[0]
                    }
                ),
                'Invalid address hash'
            )

            assert.strictEqual(
                (await TemplateStoreChangeInStorageAndLogicInstance.templateCount()).toNumber(),
                0,
                'Invalid change in storage'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['TemplateStoreExtraFunctionality:TemplateStoreManager'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.TemplateStoreManager,
                approver,
                verbose
            )

            const TemplateStoreExtraFunctionalityInstance = await TemplateStoreExtraFunctionality.at(templateStoreManagerAddress)

            // act & assert
            assert.strictEqual(
                await TemplateStoreExtraFunctionalityInstance.dummyFunction(),
                true,
                'Invalid extra functionality upgrade'
            )
        })
    })
})
