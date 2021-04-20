
# contract: EscrowPayment

Documentation:
```
@title Escrow Payment Condition
@author Keyko
@dev Implementation of the Escrow Payment Condition

The Escrow payment is reward condition in which only
can release reward if lock and release conditions
are fulfilled.
```

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* address _tokenAddress
* address[] _receivers
* bytes32 _conditionId
* uint256[] _amounts

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
@param _did asset decentralized identifier
@param _amounts token amounts to be locked/released
@param _receivers receiver's addresses
@param _lockPaymentAddress lock payment contract address
@param _tokenAddress the ERC20 contract address to use during the payment
@param _lockCondition lock condition identifier
@param _releaseCondition release condition identifier
@return bytes32 hash of all these values
```
Parameters:
* bytes32 _did
* uint256[] _amounts
* address[] _receivers
* address _lockPaymentAddress
* address _tokenAddress
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
@param _did asset decentralized identifier
@param _amounts token amounts to be locked/released
@param _receivers receiver's address
@param _lockPaymentAddress lock payment contract address
@param _tokenAddress the ERC20 contract address to use during the payment
@param _lockCondition lock condition identifier
@param _releaseCondition release condition identifier
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _agreementId
* bytes32 _did
* uint256[] _amounts
* address[] _receivers
* address _lockPaymentAddress
* address _tokenAddress
* bytes32 _lockCondition
* bytes32 _releaseCondition

### private _transferAndFulfillERC20

Documentation:

```
@notice _transferAndFulfillERC20 transfer ERC20 tokens and
      fulfill the condition
@param _id condition identifier
@param _tokenAddress the ERC20 contract address to use during the payment
@param _receivers receiver's address
@param _amounts token amount to be locked/released
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _id
* address _tokenAddress
* address[] _receivers
* uint256[] _amounts


### private _transferAndFulfillETH

Documentation:

```
@notice _transferAndFulfillETH transfer ETH and
      fulfill the condition
@param _id condition identifier
@param _receivers receiver's address
@param _amounts token amount to be locked/released
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _id
* address[] _receivers
* uint256[] _amounts
