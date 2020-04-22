
# contract: AgreementStoreManager

Documentation:
```
@title Agreement Store Manager
@author Ocean Protocol Team
 * @dev Implementation of the Agreement Store.
     TODO: link to OEP
 *      The agreement store generates conditions for an agreement template.
     Agreement templates must to be approved in the Template Store
     Each agreement is linked to the DID of an asset.
```

## Variables

### internal agreementList

### internal conditionStoreManager

### internal templateStoreManager

### internal didRegistry

## Functions

### public initialize

Documentation:

```
@dev initialize AgreementStoreManager Initializer
     Initializes Ownable. Only on contract creation.
@param _owner refers to the owner of the contract
@param _conditionStoreManagerAddress is the address of the connected condition store
@param _templateStoreManagerAddress is the address of the connected template store
@param _didRegistryAddress is the address of the connected DID Registry
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _templateStoreManagerAddress
* address _didRegistryAddress

### public createAgreement

Documentation:

```
@dev Create a new agreement.
     The agreement will create conditions of conditionType with conditionId.
     Only "approved" templates can access this function.
@param _id is the ID of the new agreement. Must be unique.
@param _did is the bytes32 DID of the asset. The DID must be registered beforehand.
@param _conditionTypes is a list of addresses that point to Condition contracts.
@param _conditionIds is a list of bytes32 content-addressed Condition IDs
@param _timeLocks is a list of uint time lock values associated to each Condition
@param _timeOuts is a list of uint time out values associated to each Condition
@return the size of the agreement list after the create action.
```
Parameters:
* bytes32 _id
* bytes32 _did
* address[] _conditionTypes
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts

### external getAgreement

Documentation:

```
@dev Get agreement with _id.
     The agreement will create conditions of conditionType with conditionId.
     Only "approved" templates can access this function.
@param _id is the ID of the agreement.
@return the agreement attributes.
```
Parameters:
* bytes32 _id

### external getAgreementDIDOwner

Documentation:

```
@dev get the DID owner for this agreement with _id.
@param _id is the ID of the agreement.
@return the DID owner associated with agreement.did from the DID registry.
```
Parameters:
* bytes32 _id

### external isAgreementDIDOwner

Documentation:

```
@dev check the DID owner for this agreement with _id.
@param _id is the ID of the agreement.
@param _owner is the DID owner
@return the DID owner associated with agreement.did from the DID registry.
```
Parameters:
* bytes32 _id
* address _owner

### external isAgreementDIDProvider

Documentation:

```
@dev isAgreementDIDProvider for a given agreement Id 
and address check whether a DID provider is associated with this agreement
@param _id is the ID of the agreement
@param _provider is the DID provider
@return true if a DID provider is associated with the agreement ID
```
Parameters:
* bytes32 _id
* address _provider

### public getAgreementListSize

Documentation:

```
@return the length of the agreement list.
```

### public getAgreementIdsForDID

Documentation:

```
@param _did is the bytes32 DID of the asset.
@return the agreement IDs for a given DID
```
Parameters:
* bytes32 _did

### public getAgreementIdsForTemplateId

Documentation:

```
@param _templateId is the address of the agreement template.
@return the agreement IDs for a given DID
```
Parameters:
* address _templateId

### public getDIDRegistryAddress

Documentation:

```
@dev getDIDRegistryAddress utility function 
used by other contracts or any EOA.
@return the DIDRegistry address
```
