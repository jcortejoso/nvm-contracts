
# library: TemplateStoreLibrary

Documentation:
```
@title Template Store Library
@author Ocean Protocol Team
 * @dev Implementation of the Template Store Library.
     
     Templates are blueprints for modular SEAs. When 
     creating an Agreement, a templateId defines the condition 
     and reward types that are instantiated in the ConditionStore.
     For more information: https://github.com/oceanprotocol/OEPs/issues/132
     TODO: update the OEP link 
```

## Structs

### public TemplateDeprecated
Members:
* enum TemplateStoreLibrary.TemplateState state
* address owner
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public TemplateListDeprecated
Members:
* mapping(address => struct TemplateStoreLibrary.TemplateDeprecated) templates
* address[] templateIds

### public Template
Members:
* enum TemplateStoreLibrary.TemplateState state
* address owner
* address lastUpdatedBy
* uint256 blockNumberUpdated
* address[] conditionTypes
* bytes32[] actorTypes

### public TemplateList
Members:
* mapping(bytes32 => struct TemplateStoreLibrary.Template) templates
* bytes32[] templateIds

### public ActorType
Members:
* string value
* enum TemplateStoreLibrary.ActorTypeState state

### public TemplateActorTypeList
Members:
* mapping(bytes32 => struct TemplateStoreLibrary.ActorType) actorTypes
* bytes32[] actorTypeIds

## Enums

###  TemplateState
Members:
*  Uninitialized
*  Proposed
*  Approved
*  Revoked

###  ActorTypeState
Members:
*  Uninitialized
*  Registered
*  Deregistered

## Functions

### internal propose

Documentation:

```
@notice propose new template
@param _self is the TemplateList storage pointer
@param _id proposed template contract address 
@return size which is the index of the proposed template
```
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* bytes32 _id
* address[] _conditionTypes
* bytes32[] _actorTypeIds

### internal approve

Documentation:

```
@notice approve new template
@param _self is the TemplateList storage pointer
@param _id proposed template contract address
```
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* bytes32 _id

### internal revoke

Documentation:

```
@notice revoke new template
@param _self is the TemplateList storage pointer
@param _id approved template contract address
```
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* bytes32 _id

### internal registerActorType
Parameters:
* struct TemplateStoreLibrary.TemplateActorTypeList _self
* string _actorType

### internal deregisterActorType
Parameters:
* struct TemplateStoreLibrary.TemplateActorTypeList _self
* bytes32 _Id

### internal getActorTypeId
Parameters:
* struct TemplateStoreLibrary.TemplateActorTypeList _self
* string _actorType

### private isValidTemplateConditionTypes
Parameters:
* bytes32 _Id
* address[] _conditionTypes
