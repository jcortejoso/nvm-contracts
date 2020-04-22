/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const EscrowComputeExecutionTemplate = artifacts.require('EscrowComputeExecutionTemplate')

const constants = require('../../helpers/constants.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils')

contract('EscrowComputeExecutionTemplate', (accounts) => {
    async function setupTest({
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        const {
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(deployer, owner)

        const contractType = templateStoreManager.address
        const escrowComputeExecutionTemplate = await EscrowComputeExecutionTemplate.new({ from: deployer })
        await escrowComputeExecutionTemplate.methods['initialize(address,address,address,address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            contractType,
            contractType,
            contractType,
            { from: deployer }
        )

        return {
            oceanToken,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            escrowComputeExecutionTemplate,
            deployer,
            owner
        }
    }

    async function prepareAgreement({
        agreementId = constants.bytes32.one,
        conditionIds = [
            constants.bytes32.one,
            constants.bytes32.two,
            constants.bytes32.three
        ],
        timeLocks = [0, 0, 0],
        timeOuts = [0, 0, 0],
        sender = accounts[0],
        receiver = accounts[1],
        escrowAmount = 10,
        did = constants.did[0]
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
                escrowComputeExecutionTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            await assert.isRejected(
                escrowComputeExecutionTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.template.error.templateNotApproved
            )

            // propose and approve template
            const templateId = escrowComputeExecutionTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            await assert.isRejected(
                escrowComputeExecutionTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.registry.error.didNotRegistered
            )

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            await escrowComputeExecutionTemplate.createAgreement(agreementId, ...Object.values(agreement))

            const storedAgreementData = await escrowComputeExecutionTemplate.getAgreementData(agreementId)
            assert.strictEqual(storedAgreementData.accessConsumer, agreement.accessConsumer)
            assert.strictEqual(storedAgreementData.accessProvider, accounts[0])

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)

            let i = 0
            const conditionTypes = await escrowComputeExecutionTemplate.getConditionTypes()
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
                escrowComputeExecutionTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            // propose and approve template
            const templateId = escrowComputeExecutionTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const result = await escrowComputeExecutionTemplate.createAgreement(agreementId, ...Object.values(agreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            const eventArgs = testUtils.getEventArgsFromTx(result, 'AgreementCreated')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(constants.did[0])
            expect(eventArgs._accessProvider).to.equal(accounts[0])
            expect(eventArgs._accessConsumer).to.equal(agreement.accessConsumer)

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)
        })

        it('create agreement should set asset provider as accessProvider instead of owner', async () => {
            const {
                didRegistry,
                templateStoreManager,
                escrowComputeExecutionTemplate,
                owner
            } = await setupTest()

            const { agreementId, agreement } = await prepareAgreement()

            // register DID
            await didRegistry.registerAttribute(
                agreement.did, constants.bytes32.one, [accounts[2]], constants.registry.url)

            // propose and approve template
            const templateId = escrowComputeExecutionTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            const result = await escrowComputeExecutionTemplate
                .createAgreement(agreementId, ...Object.values(agreement))

            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            const eventArgs = testUtils.getEventArgsFromTx(result, 'AgreementCreated')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(constants.did[0])
            expect(eventArgs._accessProvider).to.equal(accounts[2])
            expect(eventArgs._accessConsumer).to.equal(agreement.accessConsumer)

            const storedAgreementData = await escrowComputeExecutionTemplate.getAgreementData(agreementId)
            assert.strictEqual(storedAgreementData.accessProvider, accounts[2])
        })
    })
})
