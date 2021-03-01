/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it, expect, BigInt */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const DynamicAccessTemplate = artifacts.require('DynamicAccessTemplate')
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const NftHolderCondition = artifacts.require('NftHolderCondition')

const constants = require('../../helpers/constants.js')
const deployConditions = require('../../helpers/deployConditions.js')
const deployManagers = require('../../helpers/deployManagers.js')

contract('Dynamic Access Template integration test', (accounts) => {
    let token,
        didRegistry,
        agreementStoreManager,
        conditionStoreManager,
        templateStoreManager,
        dynamicAccessTemplate,
        accessSecretStoreCondition,
        nftHolderCondition

    const Activities = {
        GENERATED: '0x1',
        USED: '0x2'
    }

    async function setupTest({
        deployer = accounts[8],
        owner = accounts[9]
    } = {}) {
        ({
            token,
            didRegistry,
            agreementStoreManager,
            conditionStoreManager,
            templateStoreManager
        } = await deployManagers(
            deployer,
            owner
        ));

        ({
            accessSecretStoreCondition,
            nftHolderCondition
        } = await deployConditions(
            deployer,
            owner,
            agreementStoreManager,
            conditionStoreManager,
            didRegistry,
            token
        ))

        dynamicAccessTemplate = await DynamicAccessTemplate.new()
        await dynamicAccessTemplate.methods['initialize(address,address,address)'](
            owner,
            agreementStoreManager.address,
            didRegistry.address,
            { from: deployer }
        )

        accessSecretStoreCondition = await AccessSecretStoreCondition.new()

        await accessSecretStoreCondition.methods['initialize(address,address,address)'](
            owner,
            conditionStoreManager.address,
            agreementStoreManager.address,
            { from: owner }
        )

        nftHolderCondition = await NftHolderCondition.new()
        await nftHolderCondition.initialize(
            owner,
            conditionStoreManager.address,
            didRegistry.address,
            { from: owner }
        )

        // propose and approve template
        const templateId = dynamicAccessTemplate.address
        await templateStoreManager.proposeTemplate(templateId)
        await templateStoreManager.approveTemplate(templateId, { from: owner })

        return {
            templateId,
            owner
        }
    }

    async function prepareAgreement({
        agreementId = constants.bytes32.one,
        holder = accounts[0],
        receiver = accounts[1],
        nftAmount = 1,
        timeLockAccess = 0,
        timeOutAccess = 0,
        did = constants.did[0],
        url = constants.registry.url,
        checksum = constants.bytes32.one
    } = {}) {
        // generate IDs from attributes
        const conditionIdAccess = await accessSecretStoreCondition.generateId(agreementId, await accessSecretStoreCondition.hashValues(did, receiver))
        const conditionIdNft = await nftHolderCondition.generateId(agreementId, await nftHolderCondition.hashValues(did, holder, nftAmount))

        // construct agreement
        const agreement = {
            did: did,
            conditionIds: [
                conditionIdAccess,
                conditionIdNft
            ],
            timeLocks: [timeLockAccess, 0],
            timeOuts: [timeOutAccess, 0],
            consumer: receiver
        }
        return {
            agreementId,
            agreement,
            holder,
            receiver,
            nftAmount,
            timeLockAccess,
            timeOutAccess,
            checksum,
            url
        }
    }

    describe('create and fulfill escrow agreement', () => {
        it('should create escrow agreement and fulfill', async () => {
            const { owner } = await setupTest()

            // prepare: escrow agreement
            const { agreementId, agreement, holder, receiver, nftAmount, checksum, url } = await prepareAgreement()

            // register DID
//            await didRegistry.registerAttribute(agreement.did, checksum, [], url, { from: receiver })
            await didRegistry.registerMintableDID(
                agreement.did, checksum, [], url, 10, 0, Activities.GENERATED, '', { from: receiver })

            // Mint and Transfer
            await didRegistry.mint(agreement.did, 10, { from: receiver })
            await didRegistry.safeTransferFrom(
                receiver, holder, BigInt(agreement.did), 10, '0x', { from: receiver })

            // Conditions need to be added to the template
            await assert.isRejected(
                dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement)),
                'Arguments have wrong length'
            )

            await dynamicAccessTemplate.addTemplateCondition(accessSecretStoreCondition.address, { from: owner })
            await dynamicAccessTemplate.addTemplateCondition(nftHolderCondition.address, { from: owner })
            const templateConditionTypes = await dynamicAccessTemplate.getConditionTypes()
            assert.strictEqual(2, templateConditionTypes.length)

            // create agreement
            await dynamicAccessTemplate.createAgreement(agreementId, ...Object.values(agreement))

            // check state of agreement and conditions
            expect((await agreementStoreManager.getAgreement(agreementId)).did)
                .to.equal(constants.did[0])

            const conditionTypes = await dynamicAccessTemplate.getConditionTypes()
            let storedCondition
            agreement.conditionIds.forEach(async (conditionId, i) => {
                storedCondition = await conditionStoreManager.getCondition(conditionId)
                expect(storedCondition.typeRef).to.equal(conditionTypes[i])
                expect(storedCondition.state.toNumber()).to.equal(constants.condition.state.unfulfilled)
            })

            // fulfill nft condition
            await nftHolderCondition.fulfill(agreementId, agreement.did, holder, nftAmount)

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[1])).toNumber(),
                constants.condition.state.fulfilled)

            // fulfill access
            await accessSecretStoreCondition.fulfill(agreementId, agreement.did, receiver, { from: receiver })

            assert.strictEqual(
                (await conditionStoreManager.getConditionState(agreement.conditionIds[0])).toNumber(),
                constants.condition.state.fulfilled)
        })
    })
})
