
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

### internal templateList

## Modifiers

### internal onlyOwnerOrTemplateOwner
Parameters:
* address _id

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

### external proposeTemplate

Documentation:

```
@notice proposeTemplate proposes a new template
@param _id unique template identifier which is basically
       the template contract address
```
Parameters:
* address _id

### external approveTemplate

Documentation:

```
@notice approveTemplate approves a template
@param _id unique template identifier which is basically
       the template contract address. Only template store
       manager owner (i.e OPNF) can approve this template.
```
Parameters:
* address _id

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
* address _id

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
* address _id

### external getTemplateListSize

Documentation:

```
@notice getTemplateListSize number of templates
@return number of templates
```

### external isTemplateApproved

Documentation:

```
@notice isTemplateApproved check whether the template is approved
@param _id unique template identifier which is basically
       the template contract address.
@return true if the template is approved
```
Parameters:
* address _id
