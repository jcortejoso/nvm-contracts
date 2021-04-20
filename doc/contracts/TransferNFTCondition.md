
# contract: TransferNFTCondition

Documentation:
```
 @title Transfer NFT Condition
 @author Keyko

 @dev Implementation of condition allowing to transfer an NFT
      between the original owner and a receiver
```

## Variables

## Events

###  Fulfilled

Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _receiver
* uint256 _amount
* bytes32 _conditionId

## Functions

### external initialize

Documentation:

```
@notice initialize init the contract with the following parameters
@dev this function is called only once during the contract
      initialization.
@param _owner contract's owner account address
@param _conditionStoreManagerAddress condition store manager address
@param _agreementStoreManagerAddress agreement store manager address
```

Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _agreementStoreManagerAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs
       with the following parameters
@param _did refers to the DID in which secret store will issue the decryption keys
@param _nftReceiver is the address of the granted user or the DID provider
@param _nftAmount amount of NFTs to transfer
@param _lockCondition lock condition identifier
@return bytes32 hash of all these values
```
Parameters:
* bytes32 _did
* address _nftReceiver
* uint256 _nftAmount
* bytes32 _lockCondition

### external fulfill

Documentation:

```
@notice fulfill the transfer NFT condition
@dev only DID owner or DID provider can call this
      method. Fulfill method transfer a certain amount of NFTs
      to the _receiver address.
      When true then fulfill the condition
@param _agreementId agreement identifier
@param _did refers to the DID in which secret store will issue the decryption keys
@param _nftReceiver is the address of the account to receive the NFT
@param _nftAmount amount of NFTs to transfer
@param _lockPaymentCondition lock payment condition identifier
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _nftReceiver
* uint256 _nftAmount
* bytes32 _lockCondition
