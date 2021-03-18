/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DIDSalesTemplate = artifacts.require('DIDSalesTemplate')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')
const TransferDIDOwnershipCondition = artifacts.require('TransferDIDOwnershipCondition')
const EscrowPaymentCondition = artifacts.require('EscrowPaymentCondition')

const constants = require('../../helpers/constants.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils')

contract('DIDSalesTemplate', (accounts) => {
    let lockPaymentCondition,
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

        lockPaymentCondition = await LockPaymentCondition.new()

        await lockPaymentCondition.initialize(
            owner,
            conditionStoreManager.address,
            token.address,
            didRegistry.address,
            { from: deployer }
        )

        transferCondition = await TransferDIDOwnershipCondition.new({ from: deployer })

        await transferCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: deployer }
        )

        escrowCondition = await EscrowPaymentCondition.new()
        await escrowCondition.initialize(
            owner,
            conditionStoreManager.address,
            token.address,
            { from: deployer }
        )

        const didSalesTemplate = await DIDSalesTemplate.new({ from: deployer })
        await didSalesTemplate.methods['initialize(address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
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
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            didSalesTemplate,
            deployer,
            owner
        }
    }

    async function prepareAgreement({
        agreementId = testUtils.generateId(),
        conditionIds = [
            testUtils.generateId(),
            testUtils.generateId(),
            testUtils.generateId()
        ],
        timeLocks = [0, 0, 0],
        timeOuts = [0, 0, 0],
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
                didSalesTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            await assert.isRejected(
                didSalesTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.template.error.templateNotApproved
            )

            // propose and approve template
            const templateId = didSalesTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            await assert.isRejected(
                didSalesTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.registry.error.didNotRegistered
            )

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            await didSalesTemplate.createAgreement(agreementId, ...Object.values(agreement))

            const storedAgreementData = await didSalesTemplate.getAgreementData(agreementId)
            assert.strictEqual(storedAgreementData.accessConsumer, agreement.accessConsumer)
            assert.strictEqual(storedAgreementData.accessProvider, accounts[0])

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)

            let i = 0
            const conditionTypes = await didSalesTemplate.getConditionTypes()
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
                didSalesTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            // propose and approve template
            const templateId = didSalesTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const result = await didSalesTemplate.createAgreement(agreementId, ...Object.values(agreement))

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
