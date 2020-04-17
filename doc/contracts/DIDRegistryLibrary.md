
# library: DIDRegistryLibrary

Documentation:
```
@title DID Registry Library
@author Ocean Protocol Team
 * @dev All function calls are currently implemented without side effects
```

## Structs

### public DIDRegister
Members:
* address owner
* bytes32 lastChecksum
* address lastUpdatedBy
* uint256 blockNumberUpdated
* address[] providers

### public DIDRegisterList
Members:
* mapping(bytes32 => struct DIDRegistryLibrary.DIDRegister) didRegisters
* bytes32[] didRegisterIds

## Functions

### external update

Documentation:

```
@notice update the DID store
@dev access modifiers and storage pointer should be implemented in DIDRegistry
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param _checksum includes a one-way HASH calculated using the DDO content
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* bytes32 _checksum

### internal addProvider

Documentation:

```
@notice addProvider add provider to DID registry
@dev update the DID registry providers list by adding a new provider
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param provider the provider's address 
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address provider

### internal removeProvider

Documentation:

```
@notice removeProvider remove provider from DID registry
@dev update the DID registry providers list by removing an existing provider
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param _provider the provider's address 
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address _provider

### internal updateDIDOwner

Documentation:

```
@notice updateDIDOwner transfer DID ownership to a new owner
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param _newOwner the new DID owner address
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address _newOwner

### public isProvider

Documentation:

```
@notice isProvider check whether DID provider exists
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param _provider the provider's address 
@return true if the provider already exists
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address _provider

### private getProviderIndex

Documentation:

```
@notice getProviderIndex get the index of a provider
@param _self refers to storage pointer
@param _did refers to decentralized identifier (a byte32 length ID)
@param provider the provider's address 
@return the index if the provider exists otherwise return -1
```
Parameters:
* struct DIDRegistryLibrary.DIDRegisterList _self
* bytes32 _did
* address provider
