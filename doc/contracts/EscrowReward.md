
# contract: EscrowReward

Documentation:
```
@title Escrow Reward
@author Ocean Protocol Team
 * @dev Implementation of the Escrow Reward.
 *      The Escrow reward is reward condition in which only 
     can release reward if lock and release conditions
     are fulfilled.
     For more information, please refer the following link: 
     https://github.com/oceanprotocol/OEPs/issues/133
     TODO: update the OEP link 
```

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* address _receiver
* bytes32 _conditionId
* uint256 _amount

## Functions

### external initialize

Documentation:

```
@notice initialize init the 
      contract with the following parameters
@param _owner contract's owner account address
@param _conditionStoreManagerAddress condition store manager address
@param _tokenAddress Ocean token contract address
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
@param _amount token amount to be locked/released
@param _receiver receiver's address
@param _sender sender's address
@param _lockCondition lock condition identifier
@param _releaseCondition release condition identifier
@return bytes32 hash of all these values 
```
Parameters:
* uint256 _amount
* address _receiver
* address _sender
* bytes32 _lockCondition
* bytes32 _releaseCondition

### external fulfill

Documentation:

```
@notice fulfill escrow reward condition
@dev fulfill method checks whether the lock and 
     release conditions are fulfilled in order to 
     release/refund the reward to receiver/sender 
     respectively.
@param _agreementId agreement identifier
@param _amount token amount to be locked/released
@param _receiver receiver's address
@param _sender sender's address
@param _lockCondition lock condition identifier
@param _releaseCondition release condition identifier
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _agreementId
* uint256 _amount
* address _receiver
* address _sender
* bytes32 _lockCondition
* bytes32 _releaseCondition

### private _transferAndFulfill

Documentation:

```
@notice _transferAndFulfill transfer tokens and 
      fulfill the condition
@param _id condition identifier
@param _receiver receiver's address
@param _amount token amount to be locked/released
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _id
* address _receiver
* uint256 _amount
