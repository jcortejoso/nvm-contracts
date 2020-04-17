/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const constants = require('../../helpers/constants.js')

contract('Common', (accounts) => {
    let common
    describe('deploy and setup', () => {
        it('contract should deploy', async () => {
            common = await Common.new()
        })
    })
    describe('isContract', () => {
        it('should return true in case of contract address', async () => {
            assert.strictEqual(
                await common.isContract(common.address),
                true
            )
        })
        it('should return false in case of non-contract address', async () => {
            assert.strictEqual(
                await common.isContract(constants.address.one),
                false
            )
        })
    })
})
