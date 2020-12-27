
# contract: NftHolderCondition

Documentation:
```
@title Nft Holder Condition
@author Keyko
 * @dev Allows to fulfill a condition to users holding some amount of NFTs for a specific DID
```

## Variables

### private nft registry

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _address
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
@param _tokenAddress DIDRegistry address
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address __didRegistryAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs
       with the following parameters
@param _did the Decentralized Identifier of the asset
@param _holderAddress the address of the NFT holder
@param  _amount is the amount NFTs that need to be hold by the holder
@return bytes32 hash of all these values
```
Parameters:
* bytes32 _did
* address __holderAddress
* uint256 _amount

### external fulfill

Documentation:

```
@notice fulfill requires a validation that holder has enough
        NFTs for a specific DID
@param _agreementId SEA agreement identifier
@param _did the Decentralized Identifier of the asset
@param _holderAddress the contract address where the reward is locked
@param _amount is the amount of NFT to be hold
@return condition state
```
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _holderAddress
* uint256 _amount
