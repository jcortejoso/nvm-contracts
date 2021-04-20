
# contract: NFTAccessCondition

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
* bytes32 _documentId
* address _grantee
* bytes32 _conditionId

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
@param _documentId refers to the DID in which secret store will issue the decryption keys
@param _grantee is the address of the granted user or the DID provider
@return bytes32 hash of all these values
```
Parameters:
* bytes32 _documentId
* address _grantee

### external fulfill

Documentation:

```
@notice fulfill access secret store condition
@dev only DID owner or DID provider can call this
      method. Fulfill method sets the permissions
      for the granted consumer's address to true then
      fulfill the condition
@param _agreementId agreement identifier
@param _documentId refers to the DID in which secret store will issue the decryption keys
@param _grantee is the address of the granted user or the DID provider
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _agreementId
* bytes32 _documentId
* address _grantee
