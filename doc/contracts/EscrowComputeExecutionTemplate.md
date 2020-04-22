
# contract: EscrowComputeExecutionTemplate

Documentation:
```
@title Service Execution Template
@author Ocean Protocol Team
 * @dev Implementation of Service Execution Template
```

## Variables

### internal didRegistry

### internal computeExecutionCondition

### internal lockRewardCondition

### internal escrowReward

## Functions

### external initialize

Documentation:

```
@notice initialize init the 
      contract with the following parameters.
@dev this function is called only once during the contract
      initialization. It initializes the ownable feature, and 
      set push the required condition types including 
      service executor condition, lock reward and escrow reward conditions.
@param _owner contract's owner account address
@param _agreementStoreManagerAddress agreement store manager contract address
@param _didRegistryAddress DID registry contract address
@param _computeExecutionConditionAddress service executor condition contract address
@param _lockRewardConditionAddress lock reward condition contract address
@param _escrowRewardAddress escrow reward contract address
```
Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _didRegistryAddress
* address _computeExecutionConditionAddress
* address _lockRewardConditionAddress
* address _escrowRewardAddress
