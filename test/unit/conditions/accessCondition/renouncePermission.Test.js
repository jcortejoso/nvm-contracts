/* eslint-env mocha */
/* eslint-disable no-console */
/* global contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const common = require('./common')

contract('AccessCondition', (accounts) => {
    describe('renounce permission', () => {
        it('should DID owner or provider renounce permission', async () => {
            const {
                DIDProvider,
                did,
                accessCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]

            await accessCondition.grantPermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            await accessCondition.renouncePermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            assert.strictEqual(
                await accessCondition.checkPermissions(
                    grantee,
                    documentId
                ),
                false
            )
        })

        it('should fail to renounce if not a DID owner or provider', async () => {
            const {
                DIDProvider,
                did,
                accessCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]
            const someone = accounts[7]

            await accessCondition.grantPermission(
                grantee,
                documentId,
                { from: DIDProvider }
            )

            await assert.isRejected(
                accessCondition.renouncePermission(
                    grantee,
                    documentId,
                    { from: someone }
                ),
                'Invalid DID owner/provider'
            )

            assert.strictEqual(
                await accessCondition.checkPermissions(
                    grantee,
                    documentId
                ),
                true
            )
        })
    })
})
