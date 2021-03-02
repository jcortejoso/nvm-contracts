/* global artifacts */
const AccessSecretStoreCondition = artifacts.require('AccessSecretStoreCondition')
const EscrowReward = artifacts.require('EscrowReward')
const LockRewardCondition = artifacts.require('LockRewardCondition')
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

    const accessSecretStoreCondition = await AccessSecretStoreCondition.new({ from: deployer })
    await accessSecretStoreCondition.methods['initialize(address,address,address)'](
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

    const computeExecutionCondition = await ComputeExecutionCondition.new({ from: deployer })
    await computeExecutionCondition.methods['initialize(address,address,address)'](
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        { from: deployer }
    )

    return {
        accessSecretStoreCondition,
        escrowReward,
        lockRewardCondition,
        computeExecutionCondition
    }
}

module.exports = deployConditions
