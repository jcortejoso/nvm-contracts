
# contract: DIDRegistry

Documentation:
```
@title DID Registry
@author Ocean Protocol Team
 * @dev Implementation of the DID Registry.
     https://github.com/oceanprotocol/OEPs/tree/master/7#registry
```

## Variables

### internal didRegisterList

### internal DIDPermissions

## Events

###  DIDAttributeRegistered

Documentation:

```
@dev This implementation does not store _value on-chain,
     but emits DIDAttributeRegistered events to store it in the event log.
```
Parameters:
* bytes32 _did
* address _owner
* bytes32 _checksum
* string _value
* address _lastUpdatedBy
* uint256 _blockNumberUpdated

###  DIDProviderRemoved
Parameters:
* bytes32 _did
* address _provider
* bool state

###  DIDProviderAdded
Parameters:
* bytes32 _did
* address _provider

###  DIDOwnershipTransferred
Parameters:
* bytes32 _did
* address _previousOwner
* address _newOwner

###  DIDPermissionGranted
Parameters:
* bytes32 _did
* address _owner
* address _grantee

###  DIDPermissionRevoked
Parameters:
* bytes32 _did
* address _owner
* address _grantee

## Modifiers

### internal onlyDIDOwner
Parameters:
* bytes32 _did

## Functions

### public initialize

Documentation:

```
@dev DIDRegistry Initializer
     Initialize Ownable. Only on contract creation.
@param _owner refers to the owner of the contract.
```
Parameters:
* address _owner

### public registerAttribute

Documentation:

```
@notice Register DID attributes.
     * @dev The first attribute of a DID registered sets the DID owner.
     Subsequent updates record _checksum and update info.
     * @param _did refers to decentralized identifier (a bytes32 length ID).
@param _checksum includes a one-way HASH calculated using the DDO content.
@param _providers list of provider addresses that can provide the services associated with the DID
@param _value refers to the attribute value, limited to 2048 bytes.
@return the size of the registry after the register action.
```
Parameters:
* bytes32 _did
* bytes32 _checksum
* address[] _providers
* string _value

### external addDIDProvider

Documentation:

```
@notice addDIDProvider add new DID provider.
     * @dev it adds new DID provider to the providers list. A provider
     is any entity that can serve the registered asset
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _provider provider's address.
```
Parameters:
* bytes32 _did
* address _provider

### external removeDIDProvider

Documentation:

```
@notice removeDIDProvider delete an existing DID provider.
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _provider provider's address.
```
Parameters:
* bytes32 _did
* address _provider

### external transferDIDOwnership

Documentation:

```
@notice transferDIDOwnership transfer DID ownership
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _newOwner new owner address
```
Parameters:
* bytes32 _did
* address _newOwner

### external grantPermission

Documentation:

```
@dev grantPermission grants access permission to grantee 
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address 
```
Parameters:
* bytes32 _did
* address _grantee

### external revokePermission

Documentation:

```
@dev revokePermission revokes access permission from grantee 
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address 
```
Parameters:
* bytes32 _did
* address _grantee

### external getPermission

Documentation:

```
@dev getPermission gets access permission of a grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
@return true if grantee has access permission to a DID
```
Parameters:
* bytes32 _did
* address _grantee

### public isDIDProvider

Documentation:

```
@notice isDIDProvider check whether a given DID provider exists
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _provider provider's address.
```
Parameters:
* bytes32 _did
* address _provider

### public getDIDRegister

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return the address of the DID owner.
```
Parameters:
* bytes32 _did

### public getBlockNumberUpdated

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return last modified (update) block number of a DID.
```
Parameters:
* bytes32 _did

### public getDIDOwner

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return the address of the DID owner.
```
Parameters:
* bytes32 _did

### public getDIDRegistrySize

Documentation:

```
@return the length of the DID registry.
```

### public getDIDRegisterIds

Documentation:

```
@return the length of the DID registry.
```

### internal _grantPermission

Documentation:

```
@dev _grantPermission grants access permission to grantee 
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address 
```
Parameters:
* bytes32 _did
* address _grantee

### internal _revokePermission

Documentation:

```
@dev _revokePermission revokes access permission from grantee 
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address 
```
Parameters:
* bytes32 _did
* address _grantee

### internal _getPermission

Documentation:

```
@dev _getPermission gets access permission of a grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address 
@return true if grantee has access permission to a DID 
```
Parameters:
* bytes32 _did
* address _grantee
