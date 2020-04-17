
# contract: LockRewardCondition

Documentation:
```
@title Lock Reward Condition
@author Ocean Protocol Team
 * @dev Implementation of the Lock Reward Condition
 *      For more information, please refer the following link
     https://github.com/oceanprotocol/OEPs/issues/122
     TODO: update the OEP link 
```

## Variables

### private token

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* address _rewardAddress
* bytes32 _conditionId
* uint256 _amount

## Functions

### external initialize

Documentation:

```
@notice initialize init the 
      contract with the following parameters
@dev this function is called only once during the contract
      initialization.
@param _owner contract's owner account address
@param _conditionStoreManagerAddress condition store manager address
@param _tokenAddress Ocean Token contract address
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _tokenAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs 
       with the following parameters
@param _rewardAddress the contract address where the reward will be locked
@param _amount is the amount of the locked tokens
@return bytes32 hash of all these values 
```
Parameters:
* address _rewardAddress
* uint256 _amount

### external fulfill

Documentation:

```
@notice fulfill requires valid token transfer in order 
          to lock the amount of tokens based on the SEA
@param _agreementId SEA agreement identifier
@param _rewardAddress the contract address where the reward is locked
@param _amount is the amount of tokens to be transferred 
@return condition state
```
Parameters:
* bytes32 _agreementId
* address _rewardAddress
* uint256 _amount
