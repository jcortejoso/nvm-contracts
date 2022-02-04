/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
const { ethers } = require('hardhat')
chai.use(chaiAsPromised)

const EnglishAuction = artifacts.require('EnglishAuction')
const NeverminedToken = artifacts.require('NeverminedToken')

const testUtils = require('../../helpers/utils.js')
const constants = require('../../helpers/constants.js')

contract('English Auction test', (accounts) => {
    const deployer = accounts[0]
    const owner = accounts[1]
    const manager = accounts[2]
    const creator = accounts[3]
    //    const bidder1 = accounts[4]
    //    const bidder2 = accounts[5]

    const auctionId = testUtils.generateId()
    const did = testUtils.generateId()
    const floor = 10
    const auctionDuration = 10
    const hash = ''

    let token,
        auctionContract,
        startBlock,
        endBlock

    async function setupTest() {
        token = await NeverminedToken.new()
        await token.initialize(owner, owner)

        auctionContract = await EnglishAuction.new({ from: deployer })

        await auctionContract.methods['initialize(address)'](
            owner,
            { from: deployer }
        )

        await auctionContract.addNVMAgreementRole(manager, { from: owner })

        return {
            auctionContract
        }
    }

    describe('E2E English Auction', () => {
        it('should create an auction', async () => {
            await setupTest()

            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber + 2
            endBlock = startBlock + auctionDuration

            const result = await auctionContract.create(auctionId, did, floor, startBlock, endBlock, token.address, hash,
                { from: creator })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionCreated'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionId)
            assert.strictEqual(0, state.toNumber())
            assert.strictEqual(0, price.toNumber())
            assert.strictEqual(constants.address.zero, whoCanClaim)
        })
    })
})
