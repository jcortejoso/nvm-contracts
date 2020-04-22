/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const TemplateStoreLibrary = artifacts.require('TemplateStoreLibrary')
const TemplateStoreManager = artifacts.require('TemplateStoreManager')

const constants = require('../../helpers/constants.js')

contract('TemplateStoreManager', (accounts) => {
    async function setupTest({
        templateId = constants.bytes32.one,
        conditionType = constants.address.dummy,
        createRole = accounts[0]
    } = {}) {
        const common = await Common.new()
        const templateStoreLibrary = await TemplateStoreLibrary.new()
        await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
        const templateStoreManager = await TemplateStoreManager.new()
        await templateStoreManager.initialize(createRole)

        return {
            common,
            templateStoreManager,
            templateId,
            conditionType,
            createRole
        }
    }

    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            // act-assert
            const templateStoreLibrary = await TemplateStoreLibrary.new()
            await TemplateStoreManager.link('TemplateStoreLibrary', templateStoreLibrary.address)
            await TemplateStoreManager.new()
        })
    })

    describe('propose template', () => {
        it('should propose and be proposed', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)

            expect((await templateStoreManager.getTemplate(templateId)).state.toNumber())
                .to.equal(constants.template.state.proposed)
            expect((await templateStoreManager.getTemplateListSize()).toNumber()).to.equal(1)
        })

        it('should not propose if exists', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)

            await assert.isRejected(
                templateStoreManager.proposeTemplate(templateId),
                constants.error.idAlreadyExists
            )
        })
    })

    describe('approve template', () => {
        it('should approve after propose', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await assert.isRejected(
                templateStoreManager.approveTemplate(templateId),
                constants.template.error.templateNotProposed
            )

            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)
            expect((await templateStoreManager.getTemplate(templateId)).state.toNumber())
                .to.equal(constants.template.state.approved)
            expect((await templateStoreManager.getTemplateListSize()).toNumber()).to.equal(1)
        })

        it('should not approve if not createRole', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)
            await assert.isRejected(
                templateStoreManager.approveTemplate(templateId, { from: accounts[1] }),
                constants.error.revert
            )
        })
    })

    describe('get template', () => {
        it('successful create should get unfulfilled condition', async () => {
            const { common, templateStoreManager } = await setupTest()

            const blockNumber = await common.getCurrentBlockNumber()
            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)

            // TODO - containSubset
            const storedTemplate = await templateStoreManager.getTemplate(templateId)
            expect(storedTemplate.state.toNumber())
                .to.equal(constants.template.state.proposed)
            expect(storedTemplate.lastUpdatedBy)
                .to.equal(accounts[0])
            expect(storedTemplate.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })
    })

    describe('revoke template', () => {
        it('successful create should revoke if owner and approved', async () => {
            const { common, templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            const blockNumber = await common.getCurrentBlockNumber()

            await templateStoreManager.revokeTemplate(templateId)

            const storedTemplate = await templateStoreManager.getTemplate(templateId)
            expect(storedTemplate.state.toNumber())
                .to.equal(constants.template.state.revoked)
            expect(storedTemplate.blockNumberUpdated.toNumber())
                .to.equal(blockNumber.toNumber())
        })

        it('successful approve should not revoke if not owner', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId, { from: accounts[1] }),
                constants.acl.error.invalidUpdateRole
            )
        })

        it('should not revoke if uninitialized', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId),
                constants.template.error.templateNotApproved
            )
        })

        it('should not revoke if proposed', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId),
                constants.template.error.templateNotApproved
            )
        })

        it('should not revoke if already revoked', async () => {
            const { templateStoreManager } = await setupTest()

            const templateId = constants.address.dummy

            await templateStoreManager.proposeTemplate(templateId)
            await templateStoreManager.approveTemplate(templateId)
            await templateStoreManager.revokeTemplate(templateId)

            await assert.isRejected(
                templateStoreManager.revokeTemplate(templateId),
                constants.template.error.templateNotApproved
            )
        })
    })
})
