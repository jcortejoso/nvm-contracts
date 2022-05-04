/* global artifacts */
const DisputeManager = artifacts.require('PlonkVerifier')

const testUtils = require('./utils')

const deployConditions = async function(
    deployer,
    owner,
    agreementStoreManager,
    conditionStoreManager,
    didRegistry,
    token
) {
    /*
    const lockPaymentCondition = await LockPaymentCondition.new({ from: deployer })
    await lockPaymentCondition.initialize(
        owner,
        conditionStoreManager.address,
        didRegistry.address,
        { from: deployer }
    )
    */
    const lockPaymentCondition = await testUtils.deploy('LockPaymentCondition', [owner,
        conditionStoreManager.address,
        didRegistry.address
    ], deployer)

    /*
    const accessCondition = await AccessCondition.new({ from: deployer })
    await accessCondition.methods['initialize(address,address,address)'](
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        { from: deployer }
    )*/
    const accessCondition = await testUtils.deploy('AccessCondition', [owner,
        conditionStoreManager.address,
        agreementStoreManager.address], deployer)

    const disputeManager = await DisputeManager.new({ from: deployer })

    /*
    const accessProofCondition = await AccessProofCondition.new({ from: deployer })
    await accessProofCondition.initialize(
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        disputeManager.address,
        { from: deployer }
    )*/
    const accessProofCondition = await testUtils.deploy('AccessProofCondition', [owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        disputeManager.address
    ], deployer)

    /*
    const escrowPaymentCondition = await EscrowPaymentCondition.new({ from: deployer })
    await escrowPaymentCondition.initialize(
        owner,
        conditionStoreManager.address,
        { from: deployer }
    )
    */
    const escrowPaymentCondition = await testUtils.deploy(
        'EscrowPaymentCondition',
        [owner, conditionStoreManager.address],
        deployer
    )

    /*
    const computeExecutionCondition = await ComputeExecutionCondition.new({ from: deployer })
    await computeExecutionCondition.methods['initialize(address,address,address)'](
        owner,
        conditionStoreManager.address,
        agreementStoreManager.address,
        { from: deployer }
    )
    */
    const computeExecutionCondition = await testUtils.deploy('ComputeExecutionCondition', [owner,
        conditionStoreManager.address,
        agreementStoreManager.address], 
        deployer
    )

    if (testUtils.deploying) {
        await conditionStoreManager.grantProxyRole(
            escrowPaymentCondition.address,
            { from: owner }
        )
    }

    return {
        accessCondition,
        accessProofCondition,
        escrowPaymentCondition,
        lockPaymentCondition,
        computeExecutionCondition
    }
}

module.exports = deployConditions
