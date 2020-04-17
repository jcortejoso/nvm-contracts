
# library: ConditionStoreLibrary

Documentation:
```
@title Condition Store Library
@author Ocean Protocol Team
 * @dev Implementation of the Condition Store Library.
     
     Condition is a key component in the service execution agreement. 
     This library holds the logic for creating and updating condition 
     Any Condition has only four state transitions starts with Uninitialized,
     Unfulfilled, Fulfilled, and Aborted. Condition state transition goes only 
     forward from Unintialized -> Unfulfilled -> {Fulfilled || Aborted} 
     For more information: https://github.com/oceanprotocol/OEPs/issues/119
     TODO: update the OEP link
```

## Structs

### public Condition
Members:
* address typeRef
* enum ConditionStoreLibrary.ConditionState state
* address lastUpdatedBy
* uint256 blockNumberUpdated

### public ConditionList
Members:
* mapping(bytes32 => struct ConditionStoreLibrary.Condition) conditions
* bytes32[] conditionIds

## Enums

###  ConditionState
Members:
*  Uninitialized
*  Unfulfilled
*  Fulfilled
*  Aborted

## Functions

### internal create

Documentation:

```
@notice create new condition
@dev check whether the condition exists, assigns 
      condition type, condition state, last updated by, 
      and update at (which is the current block number)
@param _self is the ConditionList storage pointer
@param _id valid condition identifier
@param _typeRef condition contract address
@return size is the condition index
```
Parameters:
* struct ConditionStoreLibrary.ConditionList _self
* bytes32 _id
* address _typeRef

### internal updateState

Documentation:

```
@notice updateState update the condition state
@dev check whether the condition state transition is right,
      assign the new state, update last updated by and
      updated at.
@param _self is the ConditionList storage pointer
@param _id condition identifier
@param _newState the new state of the condition
@return ConditionState 
```
Parameters:
* struct ConditionStoreLibrary.ConditionList _self
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState
