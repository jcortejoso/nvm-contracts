
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

### internal agreementActors

### internal templateIdAddressToBytes32

### internal agreementActorsList

## Events

###  AgreementCreated
Parameters:
* bytes32 agreementId
* bytes32 did
* address createdBy
* uint256 createdAt

###  AgreementActorAdded
Parameters:
* bytes32 agreementId
* address actor
* bytes32 actorType

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
@dev THIS METHOD HAS BEEN DEPRECATED PLEASE DON'T USE IT.
     WE KEEP THIS METHOD INTERFACE TO AVOID ANY CONTRACT 
     UPGRADEABILITY ISSUES IN THE FUTURE.
     THE NEW METHOD DON'T ACCEPT CONDITIONS, INSTEAD IT USES 
     TEMPLATE ID. FOR MORE INFORMATION PLEASE REFER TO THE BELOW LINK
     https://github.com/oceanprotocol/keeper-contracts/pull/623
```
Parameters:
* bytes32 _id
* bytes32 _did
* address[] _conditionTypes
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts

### public createAgreement

Documentation:

```
@dev Create a new agreement.
     The agreement will create conditions of conditionType with conditionId.
     Only "approved" templates can access this function.
@param _id is the ID of the new agreement. Must be unique.
@param _did is the bytes32 DID of the asset. The DID must be registered beforehand.
@param _templateId template ID.
@param _conditionIds is a list of bytes32 content-addressed Condition IDs
@param _timeLocks is a list of uint time lock values associated to each Condition
@param _timeOuts is a list of uint time out values associated to each Condition
@param _actors array includes actor address such as consumer, provider, publisher, or verifier, ect.
For each template, the actors array order should follow the same order in templateStoreManager 
actor types definition.
@return the size of the agreement list after the create action.
```
Parameters:
* bytes32 _id
* bytes32 _did
* bytes32 _templateId
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts
* address[] _actors

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

### external getAgreementActors

Documentation:

```
@dev getAgreementActors for a given agreement Id retrieves actors addresses list 
@param _id is the ID of the agreement.
@return agreement actors list of addresses
```
Parameters:
* bytes32 _id

### external getActorType

Documentation:

```
@dev getActorType for a given agreement Id, and actor address retrieves actors type  
@param _id is the ID of the agreement
@param _actor agreement actor address
@return agreement actor type
```
Parameters:
* bytes32 _id
* address _actor

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
* bytes32 _templateId

### public getDIDRegistryAddress

Documentation:

```
@dev getDIDRegistryAddress utility function 
used by other contracts or any EOA.
@return the DIDRegistry address
```

### private convertBytes32ToAddress

Documentation:

```
@dev convertBytes32ToAddress 
@param input a 32 bytes input
@return bytes 20 output
```
Parameters:
* bytes32 input
