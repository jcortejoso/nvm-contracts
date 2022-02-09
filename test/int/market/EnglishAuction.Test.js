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
const { getBalance, getETHBalance } = require('../../helpers/getBalance.js')
const increaseTime = require('../../helpers/increaseTime.js')
const constants = require('../../helpers/constants.js')
const web3Utils = require('web3-utils')

const toEth = (value) => {
    return web3Utils.toWei(value.toString(), 'ether')
}

contract('English Auction test', (accounts) => {
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
    const floor = 10
    const auctionDuration = 10
    const hash = ''

    let token,
        auctionContract,
        startBlock,
        endBlock,
        bidder2BalanceBeginning

    async function setupTest() {
        token = await NeverminedToken.new()
        await token.initialize(owner, owner)

        auctionContract = await EnglishAuction.new({ from: deployer })

        await auctionContract.methods['initialize(address)'](
            owner,
            { from: deployer }
        )

        await auctionContract.addNVMAgreementRole(manager, { from: owner })

        // Lets distribute some tokens
        await token.mint(bidder1, floor * 100, { from: owner })
        await token.mint(bidder2, floor * 100, { from: owner })
        await token.mint(bidder3, floor * 100, { from: owner })
        await token.approve(auctionContract.address, floor * 100, { from: bidder1 })
        await token.approve(auctionContract.address, floor * 100, { from: bidder2 })
        await token.approve(auctionContract.address, floor * 100, { from: bidder3 })

        bidder2BalanceBeginning = await getBalance(token, bidder2)

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

            await auctionContract.create(auctionId2, did, floor, startBlock, endBlock, token.address, hash,
                { from: creator })

            await assert.isRejected(
                auctionContract.create(auctionId2, did, floor, startBlock, endBlock, token.address, hash,
                    { from: creator },
                    'EnglishAuction: Already created')
            )

            await assert.isRejected(
                auctionContract.create(auctionId2, did, floor, startBlock, endBlock, token.address, hash,
                    { from: bidder1 },
                    'EnglishAuction: Already created')
            )
        })

        it('should not be able to create an auction in the past or with the enf before the starts', async () => {
            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber - 5
            endBlock = startBlock + auctionDuration

            await assert.isRejected(
                auctionContract.create(auctionId, did, floor, startBlock, endBlock, token.address, hash,
                    { from: creator },
                    'EnglishAuction: Can not start in the past')
            )

            await assert.isRejected(
                auctionContract.create(auctionId, did, floor, currentBlockNumber + 5, currentBlockNumber, token.address, hash,
                    { from: creator },
                    'EnglishAuction: Must last at least one block')
            )
        })
    })

    describe('E2E English Auction using ERC20', () => {
        it('should create an auction', async () => {
            await setupTest()

            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber + 3
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

        it('bidder should not be able to bid before auction starts', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, floor + 1,
                    { from: bidder1 },
                    'AbstractAuction: Only after starts')
            )
        })

        it('bidder should not be able to bid using Native token', async () => {
            await assert.isRejected(
                auctionContract.placeNativeTokenBid(auctionId,
                    { from: bidder1 },
                    'EnglishAuction: Only native token accepted')
            )
        })

        it('creator should not be able to bid', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, floor + 1,
                    { from: creator },
                    'AbstractAuction: Not creator')
            )
        })

        it('bidder should not be able to bid below the floor', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, floor - 1,
                    { from: bidder1 },
                    'EnglishAuction: Only higher or equal than floor')
            )
        })

        it('bidder should be able to bid using ERC20', async () => {
            // wait: for start
            await increaseTime.mineBlocks(web3, 3)

            const result = await auctionContract.placeERC20Bid(auctionId, floor + 1,
                { from: bidder1 })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionId)
            assert.strictEqual(2, state.toNumber()) // In progress
            assert.strictEqual(floor + 1, price.toNumber())
            assert.strictEqual(bidder1, whoCanClaim)
        })

        it('second bidder should not be able to bid below a previous bidder', async () => {
            await assert.isRejected(
                auctionContract.placeERC20Bid(auctionId, floor + 1,
                    { from: bidder2 }),
                'EnglishAuction: Only higher bids'
            )
        })

        it('second bidder should be able make a higher bid', async () => {
            const result = await auctionContract.placeERC20Bid(auctionId, floor + 2,
                { from: bidder2 })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionId)
            assert.strictEqual(2, state.toNumber()) // In progress
            assert.strictEqual(floor + 2, price.toNumber())
            assert.strictEqual(bidder2, whoCanClaim)
        })

        it('bidder should be able to bid more than once', async () => {
            const result = await auctionContract.placeERC20Bid(auctionId, 3,
                { from: bidder1 })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionId)
            assert.strictEqual(2, state.toNumber()) // In progress
            assert.strictEqual(floor + 1 + 3, price.toNumber())
            assert.strictEqual(bidder1, whoCanClaim)
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

        it('bidders can not withdraw before auction ends', async () => {
            await assert.isRejected(
                auctionContract.withdraw(auctionId, bidder2,
                    { from: bidder2 }),
                'AbstractAuction: Auction not finished yet'
            )
        })

        it('bidder not having bids registered should not be able to withdraw funds', async () => {
            await increaseTime.mineBlocks(web3, 10)

            await assert.isRejected(
                auctionContract.withdraw(auctionId, bidder3,
                    { from: bidder3 }),
                'AbstractAuction: Zero amount'
            )
        })

        it('bidder not winning should be able to withdraw funds', async () => {
            await increaseTime.mineBlocks(web3, 10)

            const result = await auctionContract.withdraw(auctionId, bidder2,
                { from: bidder2 })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionWithdrawal'
            )

            const bidder2BalanceAfter = await getBalance(token, bidder2)
            assert.strictEqual(bidder2BalanceBeginning, bidder2BalanceAfter)
        })
    })

    describe('E2E English Auction using ETH', () => {
        it('should create an auction', async () => {
            await setupTest()

            const currentBlockNumber = await ethers.provider.getBlockNumber()
            startBlock = currentBlockNumber + 3
            endBlock = startBlock + auctionDuration

            const result = await auctionContract.create(auctionIdETH, did, toEth(floor), startBlock, endBlock, constants.address.zero, hash,
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
                auctionContract.placeERC20Bid(auctionIdETH, toEth(floor + 1),
                    { from: bidder1 },
                    'EnglishAuction: Only ERC20')
            )
        })

        it('bidder should not be able to bid below the floor', async () => {
            await assert.isRejected(
                auctionContract.placeNativeTokenBid(auctionIdETH,
                    { from: bidder1, value: toEth(floor - 1) },
                    'EnglishAuction: Only higher or equal than floor')
            )
        })

        it('bidder should be able to bid using ETH', async () => {
            // wait: for start
            await increaseTime.mineBlocks(web3, 3)

            const bidAmount = toEth(floor + 1)

            const result = await auctionContract.placeNativeTokenBid(
                auctionIdETH,
                { from: bidder1, value: bidAmount })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionIdETH)
            assert.strictEqual(2, state.toNumber()) // In progress
            assert.strictEqual(toEth(floor + 1), price.toString())
            assert.strictEqual(bidder1, whoCanClaim)
        })

        it('second bidder should not be able to bid below a previous bidder', async () => {
            await assert.isRejected(
                auctionContract.placeNativeTokenBid(auctionIdETH,
                    { from: bidder2, value: toEth(floor + 1) }),
                'EnglishAuction: Only higher bids'
            )
        })

        it('second bidder should be able make a higher bid', async () => {
            const result = await auctionContract.placeNativeTokenBid(auctionIdETH,
                { from: bidder2, value: toEth(floor + 2) })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionIdETH)
            assert.strictEqual(2, state.toNumber()) // In progress
            assert.strictEqual(toEth(floor + 2), price.toString())
            assert.strictEqual(bidder2, whoCanClaim)
        })

        it('bidder should be able to bid more than once', async () => {
            const result = await auctionContract.placeNativeTokenBid(auctionIdETH,
                { from: bidder1, value: toEth(3) })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionBidReceived'
            )

            const { state, price, whoCanClaim } = await auctionContract.getStatus(auctionIdETH)
            assert.strictEqual(2, state.toNumber()) // In progress
            assert.strictEqual(toEth(floor + 1 + 3), price.toString())
            assert.strictEqual(bidder1, whoCanClaim)
        })

        it('bidders can not withdraw before auction ends', async () => {
            await assert.isRejected(
                auctionContract.withdraw(auctionIdETH, bidder2,
                    { from: bidder2 }),
                'AbstractAuction: Auction not finished yet'
            )
        })

        it('bidder not having bids registered should not be able to withdraw funds', async () => {
            await increaseTime.mineBlocks(web3, 10)

            await assert.isRejected(
                auctionContract.withdraw(auctionIdETH, bidder3,
                    { from: bidder3 }),
                'AbstractAuction: Zero amount'
            )
        })

        it('bidder not winning should be able to withdraw funds', async () => {
            await increaseTime.mineBlocks(web3, 10)

            const bidder2ETHBalanceBefore = await getETHBalance(bidder2)

            const result = await auctionContract.withdraw(auctionIdETH, bidder2,
                { from: bidder2 })

            testUtils.assertEmitted(
                result,
                1,
                'AuctionWithdrawal'
            )

            const bidder2ETHBalanceAfter = await getETHBalance(bidder2)
            assert(Number(bidder2ETHBalanceAfter) > Number(bidder2ETHBalanceBefore))
        })
    })
})
