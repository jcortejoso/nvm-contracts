
# contract: LockPaymentCondition

Documentation:
```
@title Lock Payment Condition
@author Keyko
@dev Implementation of the Lock Payment Condition
This condition allows to lock payment for multiple receivers taking
into account the royalties to be paid to the original creators in a secondary market.
```

## Variables

### private token

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* bytes32 _did
* bytes32 _conditionId
* address _rewardAddress
* address[] _receivers[]
* uint256[] _amounts

## Functions

### external initialize

Documentation:

```
@notice initialize init the contract with the following parameters
@dev this function is called only once during the contract initialization.
@param _owner contract's owner account address
@param _conditionStoreManagerAddress condition store manager address
@param _tokenAddress Default Token contract address
@param _didRegistryAddress DID Registry address
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _tokenAddress
* address _didRegistryAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs
       with the following parameters
@param _did the asset decentralized identifier
@param _rewardAddress the contract address where the reward is locked
@param _tokenAddress the ERC20 contract address to use during the lock payment.
       If the address is 0x0 means we won't use a ERC20 but ETH for payment
@param _amounts token amounts to be locked/released
@param _receivers receiver's addresses
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
@param _agreementId the agreement identifier
@param _did the asset decentralized identifier
@param _rewardAddress the contract address where the reward is locked
@param _tokenAddress the ERC20 contract address to use during the lock payment.
@param _amounts token amounts to be locked/released
@param _receivers receiver's addresses
@return condition state
```
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _rewardAddress
* address _tokenAddress
* uint256[] _amounts
* address[] _receivers


### private __transferERC20

Documentation:

```
@notice _transferERC20 transfer ERC20 tokens
@param _rewardAddress the address to receive the tokens
@param _tokenAddress the ERC20 contract address to use during the payment
@param _amount token amount to be locked/released
@return true if everything worked
```
Parameters:
* address _rewardAddress
* address _tokenAddress
* uint256 _amount


### private _transferAndFulfillETH

Documentation:

```
@notice _transferETH transfer ETH
@param _rewardAddress the address to receive the ETH
@param _amount ETH amount to be locked/released
```
Parameters:
* address _rewardAddress
* uint256 _amount
