const { Report } = require('./report')
const fs = require('fs')

const contracts = [
    'ConditionStoreManager',
    'ConditionStoreLibrary',
    'EpochLibrary',
    'Condition',
    'Reward',
    'AgreementTemplate',
    'DIDRegistryLibrary',
    'AgreementStoreLibrary',
    'TemplateStoreLibrary',
    'TemplateStoreManager',
    'AgreementStoreManager',
    'SignCondition',
    'HashLockCondition',
    'LockRewardCondition',
    'AccessSecretStoreCondition',
    'EscrowReward',
    'EscrowAccessSecretStoreTemplate',
    'OceanToken',
    'Dispenser',
    'DIDRegistry',
    'ISecretStore',
    'Common',
    'HashListLibrary',
    'WhitelistingCondition',
    'HashLists',
    'ThresholdCondition',
    'ComputeExecutionCondition',
    'EscrowComputeExecutionTemplate'
]

contracts.forEach((contractName) => {
    const doc = new Report(contractName).generate()
    fs.writeFileSync(`./doc/contracts/${contractName}.md`, doc)
})
