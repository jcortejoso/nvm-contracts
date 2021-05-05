/* global artifacts */
const AccessCondition = artifacts.require('AccessCondition')
const EscrowPaymentCondition = artifacts.require('EscrowPaymentCondition')
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
    const lockPaymentCondition = await LockPaymentCondition.new({ from: deployer })
    await lockPaymentCondition.initialize(
        owner,
        conditionStoreManager.address,
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

    const escrowPaymentCondition = await EscrowPaymentCondition.new({ from: deployer })
    await escrowPaymentCondition.initialize(
        owner,
        conditionStoreManager.address,
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
        escrowPaymentCondition,
        lockPaymentCondition,
        computeExecutionCondition
    }
}

module.exports = deployConditions
