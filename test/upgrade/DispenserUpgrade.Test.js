/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const testUtils = require('../helpers/utils')

const {
    confirmUpgrade,
    submitTransaction,
    confirmTransaction,
    loadWallet
} = require('@oceanprotocol/dori')

const {
    deploy,
    upgrade
} = require('./Upgrader')

const OceanToken = artifacts.require('OceanToken')
const Dispenser = artifacts.require('Dispenser')

const DispenserChangeFunctionSignature = artifacts.require('DispenserChangeFunctionSignature')
const DispenserChangeInStorage = artifacts.require('DispenserChangeInStorage')
const DispenserChangeInStorageAndLogic = artifacts.require('DispenserChangeInStorageAndLogic')
const DispenserExtraFunctionality = artifacts.require('DispenserExtraFunctionality')
const DispenserWithBug = artifacts.require('DispenserWithBug')

contract('Dispenser', (accounts) => {
    let ownerWallet,
        OceanTokenAddress,
        DispenserAddress

    const requester = accounts[2]
    const approver = accounts[3]

    const verbose = false

    async function setupTest({
        requestedAmount = 200
    } = {}) {
        const oceanToken = await OceanToken.at(OceanTokenAddress)
        const dispenser = await Dispenser.at(DispenserAddress)

        // act
        await dispenser.requestTokens(requestedAmount)

        return {
            dispenser,
            oceanToken,
            requestedAmount
        }
    }

    describe('Test upgradability for Dispenser', () => {
        beforeEach('Load wallet each time', async function() {
            const addressBook = await deploy({
                web3,
                artifacts,
                contracts: [
                    'Dispenser',
                    'OceanToken'
                ],
                verbose
            })

            OceanTokenAddress = addressBook.OceanToken
            DispenserAddress = addressBook.Dispenser

            ownerWallet = await loadWallet(
                web3,
                'owner',
                verbose
            )
        })

        it('Should be possible to fix/add a bug', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['DispenserWithBug:Dispenser'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.Dispenser,
                approver,
                verbose
            )

            // set Max Amount
            const transactionId = await submitTransaction(
                ownerWallet,
                DispenserAddress,
                [
                    'setMaxAmount',
                    ['uint256'],
                    [256]
                ],
                requester,
                verbose
            )

            await confirmTransaction(
                ownerWallet,
                transactionId,
                approver,
                verbose
            )

            const DispenserWithBugInstance = await DispenserWithBug.at(DispenserAddress)

            const newMaxAmount = await DispenserWithBugInstance.getMaxAmount({ from: approver })

            // assert
            assert.strictEqual(
                newMaxAmount.toString(),
                web3.utils.toBN(20).toString(),
                'getMaxAmount value is not 20 (according to bug)'
            )
        })

        it('Should be possible to change function signature', async () => {
            const { requestedAmount } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['DispenserChangeFunctionSignature:Dispenser'],
                verbose
            })

            // act
            await confirmUpgrade(
                web3,
                taskBook.Dispenser,
                approver,
                verbose
            )

            const DispenserChangeFunctionSignatureInstance =
                await DispenserChangeFunctionSignature.at(DispenserAddress)

            // assert
            const result =
                await DispenserChangeFunctionSignatureInstance.setMinPeriod(
                    requestedAmount,
                    accounts[1]
                )

            testUtils.assertEmitted(result, 1, 'DispenserChangeFunctionSignatureEvent')
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['DispenserChangeInStorage:Dispenser'],
                verbose
            })

            // act
            await confirmUpgrade(
                web3,
                taskBook.Dispenser,
                approver,
                verbose
            )
            const DispenserChangeInStorageInstance =
                await DispenserChangeInStorage.at(DispenserAddress)

            const totalUnMintedAmount =
                await DispenserChangeInStorageInstance.totalUnMintedAmount()

            // assert
            assert.strictEqual(
                totalUnMintedAmount.toString(),
                web3.utils.toBN(0).toString(),
                'totalUnMintedAmount storage variable does not exists'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            const { requestedAmount } = await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['DispenserChangeInStorageAndLogic:Dispenser'],
                verbose
            })

            // act
            await confirmUpgrade(
                web3,
                taskBook.Dispenser,
                approver,
                verbose
            )

            const DispenserChangeInStorageAndLogicInstance =
                await DispenserChangeInStorageAndLogic.at(DispenserAddress)

            const totalUnMintedAmount =
                await DispenserChangeInStorageAndLogicInstance.totalUnMintedAmount()

            // assert
            assert.strictEqual(
                totalUnMintedAmount.toString(),
                web3.utils.toBN(0).toString(),
                'totalUnMintedAmount storage variable does not exists'
            )
            const result = await DispenserChangeInStorageAndLogicInstance.setMinPeriod(
                requestedAmount,
                accounts[1]
            )

            testUtils.assertEmitted(result, 1, 'DispenserChangeFunctionSignatureEvent')
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['DispenserExtraFunctionality:Dispenser'],
                verbose
            })

            // act
            await confirmUpgrade(
                web3,
                taskBook.Dispenser,
                approver,
                verbose
            )

            const DispenserExtraFunctionalityInstance =
                await DispenserExtraFunctionality.at(DispenserAddress)

            // assert
            assert.strictEqual(
                await DispenserExtraFunctionalityInstance.dummyFunction(),
                true,
                'failed to inject a new method!'
            )
        })
    })
})
