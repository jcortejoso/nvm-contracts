
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

### public Template
Members:
* enum TemplateStoreLibrary.TemplateState state
* address owner
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public TemplateList
Members:
* mapping(address => struct TemplateStoreLibrary.Template) templates
* address[] templateIds

## Enums

###  TemplateState
Members:
*  Uninitialized
*  Proposed
*  Approved
*  Revoked

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
* address _id

### internal approve

Documentation:

```
@notice approve new template
@param _self is the TemplateList storage pointer
@param _id proposed template contract address
```
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* address _id

### internal revoke

Documentation:

```
@notice revoke new template
@param _self is the TemplateList storage pointer
@param _id approved template contract address
```
Parameters:
* struct TemplateStoreLibrary.TemplateList _self
* address _id
