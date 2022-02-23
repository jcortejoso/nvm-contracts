/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, contract, describe, it */

const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
const { ethers } = require('hardhat')
chai.use(chaiAsPromised)

const DutchAuction = artifacts.require('DutchAuction')
const NeverminedToken = artifacts.require('NeverminedToken')

const testUtils = require('../../helpers/utils.js')
const increaseTime = require('../../helpers/increaseTime.js')
const constants = require('../../helpers/constants.js')
const web3Utils = require('web3-utils')

const toEth = (value) => {
    return web3Utils.toWei(value.toString(), 'ether')
}

contract('Dutch Auction test', (accounts) => {
    const web3 = global.web3

    const deployer = accounts[0]
    const owner = accounts[1]
    const manager = accounts[2]
    const creator = accounts[3]
    const bidder1 = accounts[4]
    const bidder2 = accounts[5]
    const bidder3 = accounts[6]

    const auctionId = testUtils.generateId()
    const auctionId2 = testUtils.generateId()
    const auctionIdETH = testUtils.generateId()
    const did = testUtils.generateId()
    const startPrice = 10
    const auctionDuration = 10
    const hash = ''

    let token,
        auctionContract,
        startBlock,
        endBlock

    async function setupTest() {
        token = await NeverminedToken.new()
        await token.initialize(owner, owner)

        auctionContract = await DutchAuction.new({ from: deployer })

        await auctionContract.methods['initialize(address)'](
            owner,
            { from: deployer }
        )

        await auctionContract.addNVMAgreementRole(manager, { from: owner })

        // Lets distribute some tokens
        await token.mint(bidder1, startPrice * 100, { from: owner })
        await token.mint(bidder2, startPrice * 100, { from: owner })
        await token.mint(bidder3, startPrice * 100, { from: owner })
        await token.approve(auctionContract.address, startPrice * 100, { from: bidder1 })
        await token.approve(auctionContract.address, startPrice * 100, { from: bidder2 })
        await token.approve(auctionContract.address, startPrice * 100, { from: bidder3 })

        return {
            auctionContract
        }
    }

    describe('Invalid auctions', () => {
        it('should not be able to create same auction twice or update an existing one', async () => {
            await setupTest()

            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber + 2
            endBlock = startBlock + auctionDuration

            await auctionContract.create(auctionId2, did, startPrice, startBlock, endBlock, token.address, hash,
                { from: creator })

            await assert.isRejected(
                auctionContract.create(auctionId2, did, startPrice, startBlock, endBlock, token.address, hash,
                    { from: creator },
                    'DutchAuction: Already created')
            )

            await assert.isRejected(
                auctionContract.create(auctionId2, did, startPrice, startBlock, endBlock, token.address, hash,
                    { from: bidder1 },
                    'DutchAuction: Already created')
            )
        })

        it('should not be able to create an auction in the past or with the enf before the starts', async () => {
            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber - 5
            endBlock = startBlock + auctionDuration

            await assert.isRejected(
                auctionContract.create(auctionId, did, startPrice, startBlock, endBlock, token.address, hash,
                    { from: creator },
                    'DutchAuction: Can not start in the past')
            )

            await assert.isRejected(
                auctionContract.create(auctionId, did, startPrice, currentBlockNumber + 5, currentBlockNumber, token.address, hash,
                    { from: creator },
                    'DutchAuction: Must last at least one block')
            )
        })
    })

    describe('E2E Dutch Auction using ERC20', () => {
        it('should create an auction', async () => {
            await setupTest()

            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber + 3
            endBlock = startBlock + auctionDuration

            const result = await auctionContract.create(auctionId, did, startPrice, startBlock, endBlock, token.address, hash,
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

        it('bidder should not be able to bid before auction starts', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, startPrice - 1,
                    { from: bidder1 },
                    'AbstractAuction: Only after starts')
            )
        })

        it('bidder should not be able to bid using Native token', async () => {
            await assert.isRejected(
                auctionContract.placeNativeTokenBid(auctionId,
                    { from: bidder1 },
                    'DutchAuction: Only native token accepted')
            )
        })

        it('creator should not be able to bid', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, startPrice - 1,
                    { from: creator },
                    'AbstractAuction: Not creator')
            )
        })

        it('bidder should not be able to bid over the start price', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, startPrice + 1,
                    { from: bidder1 },
                    'DutchAuction: Only lower or equal than start price')
            )
        })

        it('bidder should be able to bid using ERC20', async () => {
            // wait: for start
            await increaseTime.mineBlocks(web3, 3)

            const result = await auctionContract.placeERC20Bid(auctionId, startPrice - 1,
                { from: bidder1 })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionId)
            assert.strictEqual(1, state.toNumber()) // Finished
            assert.strictEqual(startPrice - 1, price.toNumber())
            assert.strictEqual(bidder1, whoCanClaim)
        })

        it('second bidder should not be able to bid', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, startPrice,
                    { from: bidder2 }),
                'AbstractAuction: Only not aborted or finished'
            )
        })

        it('creator should not be able to abort an auction after starts', async () => {
            await assert.isRejected(
                auctionContract.abortAuction(auctionId,
                    { from: owner }),
                'AbstractAuction: Only creator or admin'
            )
            await assert.isRejected(
                auctionContract.abortAuction(auctionId,
                    { from: creator }),
                'AbstractAuction: Only before starts'
            )
        })

        it('bidder not having bids registered should not be able to withdraw funds', async () => {
            await increaseTime.mineBlocks(web3, 10)

            await assert.isRejected(
                auctionContract.withdraw(auctionId, bidder3,
                    { from: bidder3 }),
                'DutchAuction: Zero amount'
            )
        })
    })

    describe('E2E Dutch Auction using ETH', () => {
        it('should create an auction', async () => {
            await setupTest()

            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber + 3
            endBlock = startBlock + auctionDuration

            const result = await auctionContract.create(auctionIdETH, did, toEth(startPrice), startBlock, endBlock, constants.address.zero, hash,
                { from: creator })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionCreated'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionIdETH)
            assert.strictEqual(0, state.toNumber())
            assert.strictEqual(0, price.toNumber())
            assert.strictEqual(constants.address.zero, whoCanClaim)
        })

        it('bidder should not be able to bid using ERC20', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionIdETH, toEth(startPrice - 1),
                    { from: bidder1 },
                    'DutchAuction: Only ERC20')
            )
        })

        it('bidder should not be able to bid below the floor', async () => {
            await assert.isRejected(
                auctionContract.placeNativeTokenBid(auctionIdETH,
                    { from: bidder1, value: toEth(startPrice + 1) },
                    'DutchAuction: Only lower or equal than start price')
            )
        })

        it('bidder should be able to bid using ETH', async () => {
            // wait: for start
            await increaseTime.mineBlocks(web3, 3)

            const bidAmount = toEth(startPrice - 1)

            const result = await auctionContract.placeNativeTokenBid(
                auctionIdETH,
                { from: bidder1, value: bidAmount })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionIdETH)
            assert.strictEqual(1, state.toNumber()) // Finished
            assert.strictEqual(toEth(startPrice - 1), price.toString())
            assert.strictEqual(bidder1, whoCanClaim)
        })

        it('second bidder should not be able to bid when auction is over', async () => {
            await assert.isRejected(
                auctionContract.placeNativeTokenBid(auctionIdETH,
                    { from: bidder2, value: toEth(startPrice - 1) }),
                'AbstractAuction: Only not aborted or finished'
            )
        })

        it('bidder not having bids registered should not be able to withdraw funds', async () => {
            await increaseTime.mineBlocks(web3, 10)

            await assert.isRejected(
                auctionContract.withdraw(auctionIdETH, bidder3,
                    { from: bidder3 }),
                'DutchAuction: Zero amount'
            )
        })
    })
})
