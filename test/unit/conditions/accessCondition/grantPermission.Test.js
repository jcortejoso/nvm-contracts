/* eslint-env mocha */
/* eslint-disable no-console */
/* global contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const common = require('./common')

contract('AccessCondition', (accounts) => {
    describe('grant permission', () => {
        it('should DID owner or provider grant permission', async () => {
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

            assert.strictEqual(
                await accessCondition.checkPermissions(
                    grantee,
                    documentId
                ),
                true
            )
        })

        it('should fail to grant if not a DID owner or provider', async () => {
            const {
                did,
                accessCondition

            } = await common.setupTest({ accounts: accounts, registerDID: true })

            const documentId = did
            const grantee = accounts[1]
            const someone = accounts[7]

            await assert.isRejected(
                accessCondition.grantPermission(
                    grantee,
                    documentId,
                    { from: someone }
                ),
                'Invalid DID owner/provider'
            )
        })
    })
})
