
# contract: ProvenanceRegistry

Documentation:
```
@title Provenance Registry
@author Keyko
 * @dev Implementation of the Provenance Registry following the W3C PROV Specifications
```

## Enums

###  ProvenanceMethod
Members:
*  ENTITY
*  ACTIVITY
*  WAS_GENERATED_BY
*  USED
*  WAS_INFORMED_BY
*  WAS_STARTED_BY
*  WAS_ENDED_BY
*  WAS_INVALIDATED_BY
*  WAS_DERIVED_FROM
*  AGENT
*  WAS_ATTRIBUTED_TO
*  WAS_ASSOCIATED_WITH
*  ACTED_ON_BEHALF

## Variables

### internal didRegistry

### internal provenanceRegisterList

## Events

###  ProvenanceAttributeRegistered

Documentation:

```
@dev This implementation does not store _attributes on-chain,
     but emits ProvenanceAttributeRegistered events to store it in the event log.
```
Parameters:
* bytes32 _did
* address _agentId
* bytes32 _activityId
* bytes32 _relatedDid
* address _agentInvolvedId
* enum ProvenanceRegistry.ProvenanceMethod _method
* string _attributes
* uint256 _blockNumberUpdated

###  WasGeneratedBy
Parameters:
* bytes32 _did
* address _agentId
* bytes32 _activityId
* string _attributes
* uint256 _blockNumberUpdated

###  Used
Parameters:
* bytes32 _did
* address _agentId
* bytes32 _activityId
* string _attributes
* uint256 _blockNumberUpdated

###  WasDerivedFrom
Parameters:
* bytes32 _newEntityDid
* bytes32 _usedEntityDid
* address _agentId
* bytes32 _activityId
* string _attributes
* uint256 _blockNumberUpdated

###  WasAssociatedWith
Parameters:
* address _agentId
* bytes32 _activityId
* bytes32 _entityDid
* string _attributes
* uint256 _blockNumberUpdated

###  ActedOnBehalf
Parameters:
* address _delegateAgentId
* address _responsibleAgentId
* bytes32 _entityDid
* bytes32 _activityId
* string _attributes
* uint256 _blockNumberUpdated

## Modifiers

### internal onlyProvenanceOwnerOrDelegated
Parameters:
* bytes32 _did

### internal onlyProvenanceOwner
Parameters:
* bytes32 _did

### internal onlyDIDOwner
Parameters:
* bytes32 _did

### internal onlyValidAttributes
Parameters:
* string _attributes

## Functions

### public initialize

Documentation:

```
@dev ProvenanceRegistry Initializer
     Initialize Ownable. Only on contract creation.
@param _owner refers to the owner of the contract.
```
Parameters:
* address _didRegistry
* address _owner

### public wasGeneratedBy

Documentation:

```
@notice Implements the W3C PROV Generation action
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
@param _agentId refers to address of the agent creating the provenance record
@param _activityId refers to activity
@param _delegates refers to the array of delegates able to interact with the provenance record
@param _attributes referes to the provenance attributes
@return the number of the new provenance size
```
Parameters:
* bytes32 _did
* address _agentId
* bytes32 _activityId
* address[] _delegates
* string _attributes

### public used

Documentation:

```
@notice Implements the W3C PROV Usage action
     * @param _agentId refers to address of the agent creating the provenance record
@param _activityId refers to activity
@param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
@param _attributes referes to the provenance attributes
@return true if the action was properly registered
```
Parameters:
* address _agentId
* bytes32 _activityId
* bytes32 _did
* string _attributes

### public wasDerivedFrom

Documentation:

```
@notice Implements the W3C PROV Derivation action
     * @param _newEntityDid refers to decentralized identifier (a bytes32 length ID) of the entity created
@param _usedEntityDid refers to decentralized identifier (a bytes32 length ID) of the entity used to derive the new did
@param _agentId refers to address of the agent creating the provenance record
@param _activityId refers to activity
@param _delegates refers to the array of delegates able to interact with the provenance record
@param _attributes referes to the provenance attributes
@return true if the action was properly registered
```
Parameters:
* bytes32 _newEntityDid
* bytes32 _usedEntityDid
* address _agentId
* bytes32 _activityId
* address[] _delegates
* string _attributes

### public wasAssociatedWith

Documentation:

```
@notice Implements the W3C PROV Association action
     * @param _agentId refers to address of the agent creating the provenance record
@param _activityId refers to activity
@param _entityDid refers to decentralized identifier (a bytes32 length ID) of the entity
@param _signatures refers to the digital signatures provided during the process by the parties
@param _attributes referes to the provenance attributes
@return true if the action was properly registered
```
Parameters:
* address _agentId
* bytes32 _activityId
* bytes32 _entityDid
* bytes32[] _signatures
* string _attributes

### public actedOnBehalf

Documentation:

```
@notice Implements the W3C PROV Delegation action
     * @param _delegateAgentId refers to address acting on behalf of the provenance record
@param _responsibleAgentId refers to address responsible of the provenance record
@param _entityDid refers to decentralized identifier (a bytes32 length ID) of the entity
@param _activityId refers to activity
@param _signatures refers to the digital signature provided by the parties involved
@param _attributes referes to the provenance attributes
@return true if the action was properly registered
```
Parameters:
* address _delegateAgentId
* address _responsibleAgentId
* bytes32 _entityDid
* bytes32 _activityId
* bytes32[] _signatures
* string _attributes

### public isProvenanceDelegate

Documentation:

```
@notice isProvenanceDelegate check whether a given DID delegate exists
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _delegate delegate's address.
```
Parameters:
* bytes32 _did
* address _delegate

### public getBlockNumberUpdated

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return last modified (update) block number of a DID.
```
Parameters:
* bytes32 _did

### public getProvenanceOwner

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return the address of the Provenance owner.
```
Parameters:
* bytes32 _did

### public getProvenanceRegistrySize

Documentation:

```
@return the length of the Provenance registry.
```

### public getProvenanceRegisterIds

Documentation:

```
@return the length of the DID registry.
```
