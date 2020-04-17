
# library: AgreementStoreLibrary

Documentation:
```
@title Agreement Store Library
@author Ocean Protocol Team
 * @dev Implementation of the Agreement Store Library.
     For more information: https://github.com/oceanprotocol/OEPs/issues/125    
     TODO: update the OEP link 
     The agreement store library holds the business logic
     in which manages the life cycle of SEA agreement, each 
     agreement is linked to the DID of an asset, template, and
     condition IDs.
```

## Structs

### public Agreement
Members:
* bytes32 did
* address templateId
* bytes32[] conditionIds
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public AgreementList
Members:
* mapping(bytes32 => struct AgreementStoreLibrary.Agreement) agreements
* mapping(bytes32 => bytes32[]) didToAgreementIds
* mapping(address => bytes32[]) templateIdToAgreementIds
* bytes32[] agreementIds

### public AgreementActors
Members:
* mapping(bytes32 => mapping(address => bytes32)) AgreementActor

### public AgreementActorsList
Members:
* mapping(bytes32 => address[]) ActorsList

## Functions

### internal create

Documentation:

```
@dev create new agreement
     checks whether the agreement Id exists, creates new agreement 
     instance, including the template, conditions and DID.
@param _self is AgreementList storage pointer
@param _id agreement identifier
@param _did asset decentralized identifier
@param _templateId template identifier
@param _conditionIds array of condition identifiers
@return size which is the index of the created agreement
```
Parameters:
* struct AgreementStoreLibrary.AgreementList _self
* bytes32 _id
* bytes32 _did
* address _templateId
* bytes32[] _conditionIds

### internal setActorType

Documentation:

```
@dev setActorType set a mapping between actors and their types.
The stored type is the hash of the string format of an actor type 
(consumer, provider, verifier, publisher, curator, etc).
@param _self is AgreementActors storage pointer
@param _id agreement identifier
@param _actor actor address
@param _actorType actor type hash
```
Parameters:
* struct AgreementStoreLibrary.AgreementActors _self
* bytes32 _id
* address _actor
* bytes32 _actorType

### internal getActorType

Documentation:

```
@dev getActorType for a given agreement Id, returns the actor type
@param _self is AgreementActors storage pointer
@param _id agreement identifier
@param _actor actor address
@return bytes32 actor type
```
Parameters:
* struct AgreementStoreLibrary.AgreementActors _self
* bytes32 _id
* address _actor

### internal setActors

Documentation:

```
@dev setActors associate actor addresses to an agreement
@param _self is AgreementActorsList storage pointer
@param _id agreement identifier
@param _actors array of actor addresses
```
Parameters:
* struct AgreementStoreLibrary.AgreementActorsList _self
* bytes32 _id
* address[] _actors

### internal getActors

Documentation:

```
@dev getActors actor addresses for an agreement
@param _self is AgreementActorsList storage pointer
@param _id agreement identifier
@return _actors array of actor addresses
```
Parameters:
* struct AgreementStoreLibrary.AgreementActorsList _self
* bytes32 _id
