/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const NFTSalesTemplate = artifacts.require('NFTSalesTemplate')
const NFTLockCondition = artifacts.require('NFTLockCondition')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')
const TransferNFTCondition = artifacts.require('TransferNFTCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../helpers/constants.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils')

contract('DIDSalesTemplate', (accounts) => {
    let lockNFTCondition,
        lockPaymentCondition,
        transferCondition,
        escrowCondition

    async function setupTest({
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        const {
            token,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(deployer, owner)

        lockNFTCondition = await NFTLockCondition.new()

        await lockNFTCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        lockPaymentCondition = await LockPaymentCondition.new()

        await lockPaymentCondition.initialize(
            owner,
            conditionStoreManager.address,
            token.address,
            didRegistry.address,
            { from: deployer }
        )

        transferCondition = await TransferNFTCondition.new({ from: deployer })

        await transferCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: deployer }
        )

        escrowCondition = await EscrowReward.new()
        await escrowCondition.initialize(
            owner,
            conditionStoreManager.address,
            token.address,
            { from: deployer }
        )

        const nftSalesTemplate = await NFTSalesTemplate.new({ from: deployer })
        await nftSalesTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            lockNFTCondition.address,
            lockPaymentCondition.address,
            transferCondition.address,
            escrowCondition.address,
            { from: deployer }
        )

        return {
            token,
            escrowCondition,
            transferCondition,
            lockPaymentCondition,
            lockNFTCondition,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            nftSalesTemplate,
            deployer,
            owner
        }
    }

    async function prepareAgreement({
        agreementId = testUtils.generateId(),
        conditionIds = [
            testUtils.generateId(),
            testUtils.generateId(),
            testUtils.generateId(),
            testUtils.generateId()
        ],
        timeLocks = [0, 0, 0, 0],
        timeOuts = [0, 0, 0, 0],
        sender = accounts[0],
        receiver = accounts[1],
        did = testUtils.generateId()
    } = {}) {
        // construct agreement
        const agreement = {
            did,
            conditionIds,
            timeLocks,
            timeOuts,
            accessConsumer: receiver
        }
        return {
            agreementId,
            agreement
        }
    }

    describe('create agreement', () => {
        it('correct create should get data, agreement & conditions', async () => {
            const {
                didRegistry,
                agreementStoreManager,
                conditionStoreManager,
                templateStoreManager,
                nftSalesTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            await assert.isRejected(
                nftSalesTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.template.error.templateNotApproved
            )

            // propose and approve template
            const templateId = nftSalesTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            await assert.isRejected(
                nftSalesTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.registry.error.didNotRegistered
            )

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            await nftSalesTemplate.createAgreement(agreementId, ...Object.values(agreement))

            const storedAgreementData = await nftSalesTemplate.getAgreementData(agreementId)
            assert.strictEqual(storedAgreementData.accessConsumer, agreement.accessConsumer)
            assert.strictEqual(storedAgreementData.accessProvider, accounts[0])

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)

            let i = 0
            const conditionTypes = await nftSalesTemplate.getConditionTypes()
            for (const conditionId of agreement.conditionIds) {
                const storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
                expect(storedCondition.timeLock.toNumber()).to.equal(agreement.timeLocks[i])
                expect(storedCondition.timeOut.toNumber()).to.equal(agreement.timeOuts[i])
                i++
            }
        })
    })

    describe('create agreement `AgreementCreated` event', () => {
        it('create agreement should emit `AgreementCreated` event', async () => {
            const {
                didRegistry,
                agreementStoreManager,
                templateStoreManager,
                nftSalesTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            // propose and approve template
            const templateId = nftSalesTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const result = await nftSalesTemplate.createAgreement(agreementId, ...Object.values(agreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            const eventArgs = testUtils.getEventArgsFromTx(result, 'AgreementCreated')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(agreement.did)
            expect(eventArgs._accessProvider).to.equal(accounts[0])
            expect(eventArgs._accessConsumer).to.equal(agreement.accessConsumer)

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)
        })
    })
})
