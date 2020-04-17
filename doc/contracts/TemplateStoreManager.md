
# contract: TemplateStoreManager

Documentation:
```
@title Template Store Manager
@author Ocean Protocol Team
 * @dev Implementation of the Template Store Manager.
     Templates are blueprints for modular SEAs. When creating an Agreement, 
     a templateId defines the condition and reward types that are instantiated 
     in the ConditionStore. This contract manages the life cycle 
     of the template ( Propose --> Approve --> Revoke ).
     For more information please refer to this link:
     https://github.com/oceanprotocol/OEPs/issues/132
     TODO: link to OEP
     
```

## Variables

### internal templateListDeprecated

### internal templateList

### internal templateActorTypeList

## Events

###  TemplateProposed
Parameters:
* bytes32 Id
* string name
* address[] conditionTypes
* bytes32[] actorTypeIds

###  TemplateApproved
Parameters:
* bytes32 Id
* bool state

###  TemplateRevoked
Parameters:
* bytes32 Id
* bool state

## Modifiers

### internal onlyOwnerOrTemplateOwner
Parameters:
* bytes32 _id

## Functions

### public initialize

Documentation:

```
@dev initialize TemplateStoreManager Initializer
     Initializes Ownable. Only on contract creation.
@param _owner refers to the owner of the contract
```
Parameters:
* address _owner

### public generateId
Parameters:
* string templateName

### external proposeTemplate
Parameters:
* address _id
* address[] _conditionTypes
* bytes32[] _actorTypeIds
* string name

### public proposeTemplate

Documentation:

```
@notice proposeTemplate proposes a new template
@param _id unique template identifier which is basically
       the template contract address
```
Parameters:
* bytes32 _id
* address[] _conditionTypes
* bytes32[] _actorTypeIds
* string name

### external approveTemplate

Documentation:

```
@notice approveTemplate approves a template
@param _id unique template identifier which is basically
       the template contract address. Only template store
       manager owner (i.e OPNF) can approve this template.
```
Parameters:
* bytes32 _id

### external revokeTemplate

Documentation:

```
@notice revokeTemplate revoke a template
@param _id unique template identifier which is basically
       the template contract address. Only template store
       manager owner (i.e OPNF) or template owner
       can revoke this template.
```
Parameters:
* bytes32 _id

### external registerTemplateActorType
Parameters:
* string _actorType

### external deregisterTemplateActorType
Parameters:
* bytes32 _Id

### external getTemplate

Documentation:

```
@notice getTemplate get more information about a template
@param _id unique template identifier which is basically
       the template contract address.
@return template status, template owner, last updated by and
       last updated at.
```
Parameters:
* bytes32 _id

### external getTemplateActorTypeIds

Documentation:

```
@notice 
     
```

### external getTemplateActorTypeId
Parameters:
* string actorType

### external getTemplateActorTypeValue

Documentation:

```
@notice 
     
```
Parameters:
* bytes32 _Id

### external getTemplateActorTypeState

Documentation:

```
@notice 
     
```
Parameters:
* bytes32 _Id

### external getTemplateListSize

Documentation:

```
@notice getTemplateListSize number of templates
@return number of templates
```

### external isTemplateIdApproved

Documentation:

```
@notice isTemplateIdApproved check whether the template is approved
@param _id bytes32 unique template identifier which is basically
       the template contract address.
@return true if the template is approved
```
Parameters:
* bytes32 _id

### external isTemplateApproved

Documentation:

```
@notice THIS METHOD HAS BEEN DEPRECATED, PLEASE DON'T USE IT.
```
Parameters:
* address _id
