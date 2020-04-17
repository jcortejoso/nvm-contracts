/* eslint-env mocha */
/* global artifacts, web3, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const {
    confirmUpgrade
} = require('@oceanprotocol/dori')

const {
    deploy,
    upgrade
} = require('./Upgrader')

const OceanToken = artifacts.require('OceanToken')

const OceanTokenChangeInStorage = artifacts.require('OceanTokenChangeInStorage')
const OceanTokenChangeInStorageAndLogic = artifacts.require('OceanTokenChangeInStorageAndLogic')
const OceanTokenExtraFunctionality = artifacts.require('OceanTokenExtraFunctionality')

contract('OceanToken', (accounts) => {
    let OceanTokenAddress

    const verbose = false
    const approver = accounts[3]

    async function setupTest() {
        await OceanToken.at(OceanTokenAddress)
    }

    describe('Test upgradability for OceanToken', () => {
        beforeEach('Load wallet each time', async function() {
            const addressBook = await deploy({
                web3,
                artifacts,
                contracts: [
                    'OceanToken'
                ],
                verbose
            })

            OceanTokenAddress = addressBook.OceanToken
            assert(OceanTokenAddress)
        })

        it('Should be possible to append storage variable(s) ', async () => {
            await setupTest()
            const taskBook = await upgrade({
                web3,
                contracts: ['OceanTokenChangeInStorage:OceanToken'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.OceanToken,
                approver,
                verbose
            )

            // act
            const OceanTokenChangeInStorageInstance = await OceanTokenChangeInStorage.at(OceanTokenAddress)

            const mintCount = await OceanTokenChangeInStorageInstance.mintCount()

            // assert
            assert.strictEqual(
                mintCount.toString(),
                web3.utils.toBN(0).toString(),
                'mintCount new storage variable does not exists'
            )
        })

        it('Should be possible to append storage variables and change logic', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['OceanTokenChangeInStorageAndLogic:OceanToken'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.OceanToken,
                approver,
                verbose
            )

            const OceanTokenChangeInStorageAndLogicInstance = await OceanTokenChangeInStorageAndLogic.at(OceanTokenAddress)
            // act
            const mintCountBefore = await OceanTokenChangeInStorageAndLogicInstance.mintCount()

            // assert
            assert.strictEqual(
                mintCountBefore.toString(),
                web3.utils.toBN(0).toString(),
                'mintCount new storage variable does not exists'
            )

            // act
            await OceanTokenChangeInStorageAndLogicInstance.incrementMintCount({ from: accounts[3] })
            const mintCountAfter = await OceanTokenChangeInStorageAndLogicInstance.mintCount()
            // assert
            assert.strictEqual(
                mintCountAfter.toString(),
                web3.utils.toBN(1).toString(),
                'mintCount new storage variable does not exists'
            )
        })

        it('Should be able to call new method added after upgrade is approved', async () => {
            await setupTest()

            const taskBook = await upgrade({
                web3,
                contracts: ['OceanTokenExtraFunctionality:OceanToken'],
                verbose
            })

            await confirmUpgrade(
                web3,
                taskBook.OceanToken,
                approver,
                verbose
            )

            // act
            const OceanTokenExtraFunctionalityInstance = await OceanTokenExtraFunctionality.at(OceanTokenAddress)

            // assert
            assert.strictEqual(
                await OceanTokenExtraFunctionalityInstance.dummyFunction(),
                true,
                'failed to inject a new method!'
            )
        })
    })
})
