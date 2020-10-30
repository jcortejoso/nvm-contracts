/* eslint-env mocha */
/* global artifacts, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const Common = artifacts.require('Common')
const ProvenanceRegistryLibrary = artifacts.require('ProvenanceRegistryLibrary')
const ProvenanceRegistry = artifacts.require('ProvenanceRegistry')
const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')

contract('ProvenanceRegistry', (accounts) => {
    const owner = accounts[1]
    const delegates = [accounts[8], accounts[9]]

    async function setupTest() {
        const provenanceRegistryLibrary = await ProvenanceRegistryLibrary.new()
        await ProvenanceRegistry.link('ProvenanceRegistryLibrary', provenanceRegistryLibrary.address)
        const provenanceRegistry = await ProvenanceRegistry.new()
        await provenanceRegistry.initialize(owner)
        const common = await Common.new()
        return {
            common,
            provenanceRegistry
        }
    }


})
