/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, beforeEach */
const OceanToken = artifacts.require('OceanToken')

contract('OceanToken', (accounts) => {
    let oceanToken
    const spender = accounts[1]

    describe('transfer', () => {
        beforeEach('mint tokens before each test', async () => {
            oceanToken = await OceanToken.new()
            await oceanToken.initialize(accounts[0], accounts[0])
            await oceanToken.mint(spender, 1000)
        })

        it('Should transfer', async () => {
            // act
            await oceanToken.transfer(accounts[2], 100, { from: spender })

            // assert
            const balance = await oceanToken.balanceOf(accounts[2])
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // act-assert
            try {
                await oceanToken.transfer(0x0, 100, { from: spender })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
