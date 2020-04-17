
# contract: AccessSecretStoreCondition

Documentation:
```
@title Access Secret Store Condition
@author Ocean Protocol Team
 * @dev Implementation of the Access Secret Store Condition
 *      Access Secret Store Condition is special condition
     where parity secret store can encrypt/decrypt documents 
     based on the on-chain granted permissions. For a given DID 
     document, and agreement ID, the owner/provider of the DID 
     will fulfill the condition. Consequently secret store 
     will check whether the permission is granted for the consumer
     in order to encrypt/decrypt the document.
```

## Structs

### public DocumentPermission
Members:
* bytes32 agreementIdDeprecated
* mapping(address => bool) permission

## Variables

### private documentPermissions

### private agreementStoreManager

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* bytes32 _documentId
* address _grantee
* bytes32 _conditionId

## Modifiers

### internal onlyDIDOwnerOrProvider
Parameters:
* bytes32 _documentId

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

### public fulfill

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

### public grantPermission

Documentation:

```
@notice grantPermission is called only by DID owner or provider
@param _grantee is the address of the granted user or the DID provider
@param _documentId refers to the DID in which secret store will issue the decryption keys
```
Parameters:
* address _grantee
* bytes32 _documentId

### public renouncePermission

Documentation:

```
@notice renouncePermission is called only by DID owner or provider
@param _grantee is the address of the granted user or the DID provider
@param _documentId refers to the DID in which secret store will issue the decryption keys
```
Parameters:
* address _grantee
* bytes32 _documentId

### external checkPermissions

Documentation:

```
@notice checkPermissions is called by Parity secret store
@param _documentId refers to the DID in which secret store will issue the decryption keys
@param _grantee is the address of the granted user or the DID provider
@return true if the access was granted
```
Parameters:
* address _grantee
* bytes32 _documentId
