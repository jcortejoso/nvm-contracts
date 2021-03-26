/* global artifacts */
const AccessCondition = artifacts.require('AccessCondition')
const EscrowReward = artifacts.require('EscrowReward')
const EscrowPaymentCondition = artifacts.require('EscrowPaymentCondition')
const LockRewardCondition = artifacts.require('LockRewardCondition')
const LockPaymentCondition = artifacts.require('LockPaymentCondition')
const ComputeExecutionCondition = artifacts.require('ComputeExecutionCondition')

const deployConditions = async function(
    deployer,
    owner,
    agreementStoreManager,
    conditionStoreManager,
    didRegistry,
    token
) {
    const lockRewardCondition = await LockRewardCondition.new({ from: deployer })
    await lockRewardCondition.initialize(
        owner,
        conditionStoreManager.address,
        token.address,
        { from: deployer }
    )

    const lockPaymentCondition = await LockPaymentCondition.new({ from: deployer })
    await lockPaymentCondition.initialize(
        owner,
        conditionStoreManager.address,
        token.address,
        didRegistry.address,
        { from: deployer }
    )

    const accessCondition = await AccessCondition.new({ from: deployer })
    await accessCondition.methods['initialize(address,address,address)'](
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        { from: deployer }
    )

    const escrowReward = await EscrowReward.new({ from: deployer })
    await escrowReward.initialize(
        owner,
        conditionStoreManager.address,
        token.address,
        { from: deployer }
    )

    const escrowPaymentCondition = await EscrowPaymentCondition.new({ from: deployer })
    await escrowPaymentCondition.initialize(
        owner,
        conditionStoreManager.address,
        token.address,
        { from: deployer }
    )

    const computeExecutionCondition = await ComputeExecutionCondition.new({ from: deployer })
    await computeExecutionCondition.methods['initialize(address,address,address)'](
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        { from: deployer }
    )

    return {
        accessCondition,
        escrowReward,
        escrowPaymentCondition,
        lockRewardCondition,
        lockPaymentCondition,
        computeExecutionCondition
    }
}

module.exports = deployConditions
