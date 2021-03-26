/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DynamicAccessTemplate = artifacts.require('DynamicAccessTemplate')
const AccessCondition = artifacts.require('AccessCondition')
const NFTHolderCondition = artifacts.require('NFTHolderCondition')
const EscrowReward = artifacts.require('EscrowReward')

const constants = require('../../helpers/constants.js')
const deployManagers = require('../../helpers/deployManagers.js')
const testUtils = require('../../helpers/utils')

contract('DynamicAccessTemplate', (accounts) => {
    let token
    let didRegistry
    let agreementStoreManager
    let conditionStoreManager
    let templateStoreManager
    let dynamicAccessTemplate
    let accessCondition
    let nftHolderCondition
    let escrowReward
    const deployer = accounts[8]
    const owner = accounts[9]

    beforeEach(async () => {
        await setupTest()
    })

    async function setupTest() {
        if (!dynamicAccessTemplate) {
            const deployment = await deployManagers(deployer, owner)
            token = deployment.token
            didRegistry = deployment.didRegistry
            agreementStoreManager = deployment.agreementStoreManager
            conditionStoreManager = deployment.conditionStoreManager
            templateStoreManager = deployment.templateStoreManager

            dynamicAccessTemplate = await DynamicAccessTemplate.new({ from: deployer })

            await dynamicAccessTemplate.methods['initialize(address,address,address)'](
                owner,
                agreementStoreManager.address,
                didRegistry.address,
                { from: deployer }
            )

            accessCondition = await AccessCondition.new()

            await accessCondition.methods['initialize(address,address,address)'](
                owner,
                conditionStoreManager.address,
                agreementStoreManager.address,
                { from: owner }
            )

            nftHolderCondition = await NFTHolderCondition.new()
            await nftHolderCondition.initialize(
                owner,
                conditionStoreManager.address,
                didRegistry.address,
                { from: owner }
            )

            escrowReward = await EscrowReward.new()
            await escrowReward.initialize(
                owner,
                conditionStoreManager.address,
                token.address,
                { from: owner }
            )
        }

        return {
            token,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager,
            dynamicAccessTemplate,
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
        amount = 1,
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
            const { agreementId, agreement } = await prepareAgreement()

            await assert.isRejected(
                dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.template.error.templateNotApproved
            )

            // propose and approve template
            const templateId = dynamicAccessTemplate.address
            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId, { from: owner })

            await assert.isRejected(
                dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                constants.registry.error.didNotRegistered
            )

            // register DID
            await didRegistry.registerAttribute(agreement.did, constants.bytes32.one, [], constants.registry.url)

            await assert.isRejected(
                dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                'Arguments have wrong length'
            )

            await dynamicAccessTemplate.addTemplateCondition(accessCondition.address, { from: owner })
            await dynamicAccessTemplate.addTemplateCondition(nftHolderCondition.address, { from: owner })
            await dynamicAccessTemplate.addTemplateCondition(escrowReward.address, { from: owner })
            const templateConditionTypes = await dynamicAccessTemplate.getConditionTypes()
            assert.strictEqual(3, templateConditionTypes.length)

            const result = await dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement))
            testUtils.assertEmitted(result, 1, 'AgreementCreated')

            const eventArgs = testUtils.getEventArgsFromTx(result, 'AgreementCreated')
            expect(eventArgs._agreementId).to.equal(agreementId)
            expect(eventArgs._did).to.equal(constants.did[0])
            expect(eventArgs._accessProvider).to.equal(accounts[0])
            expect(eventArgs._accessConsumer).to.equal(agreement.accessConsumer)

            const storedAgreementData = await dynamicAccessTemplate.getAgreementData(agreementId)
            assert.strictEqual(storedAgreementData.accessConsumer, agreement.accessConsumer)
            assert.strictEqual(storedAgreementData.accessProvider, accounts[0])

            const storedAgreement = await agreementStoreManager.getAgreement(agreementId)
            expect(storedAgreement.conditionIds)
                .to.deep.equal(agreement.conditionIds)
            expect(storedAgreement.lastUpdatedBy)
                .to.equal(templateId)

            let i = 0
            const conditionTypes = await dynamicAccessTemplate.getConditionTypes()
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
})
