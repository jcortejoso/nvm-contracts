
# contract: NFTLockCondition

Documentation:
```
@title NFT Access Condition
@author Keyko

@dev Implementation of the Access Condition specific for NFTs

NFT Access Condition is special condition used to give access
to a specific NFT related to a DID.
```

## Variables

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _rewardAddress
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
@param _didRegistryAddress DIDRegistry contract address
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _didRegistryAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs
       with the following parameters
@param _did the DID of the asset with NFTs attached to lock
@param _rewardAddress the final address to receive the NFTs
@param _amount is the amount of the locked tokens
@return bytes32 hash of all these values
```
Parameters:
* bytes32 _did
* address _rewardAddress
* uint256 _amount

### external fulfill

Documentation:

```
@notice fulfill requires valid NFT transfer in order
          to lock the amount of DID NFTs based on the SEA
@param _agreementId SEA agreement identifier
@param _did Asset Decentralized Identifier
@param _rewardAddress the contract address where the reward is locked
@param _amount is the amount of tokens to be transferred
@return condition state
```
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _rewardAddress
* uint256 _amount
