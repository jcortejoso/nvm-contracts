
# contract: ConditionStoreManager

Documentation:
```
@title Condition Store Manager
@author Ocean Protocol Team
 * @dev Implementation of the Condition Store Manager.
 *      Condition store manager is responsible for enforcing the 
     the business logic behind creating/updating the condition state
     based on the assigned role to each party. Only specific type of
     contracts are allowed to call this contract, therefor there are 
     two types of roles, create role that in which is able to create conditions.
     The second role is the update role, which is can update the condition state.
     Also, it support delegating the roles to other contract(s)/account(s).
     For more information please refer to this link:
     https://github.com/oceanprotocol/OEPs/issues/119
     TODO: update the OEP link
```

## Enums

###  RoleType
Members:
*  Create
*  Update

## Variables

### private createRole

### internal conditionList

### internal epochList

## Events

###  ConditionCreated
Parameters:
* bytes32 _id
* address _typeRef
* address _who

###  ConditionUpdated
Parameters:
* bytes32 _id
* address _typeRef
* enum ConditionStoreLibrary.ConditionState _state
* address _who

## Modifiers

### internal onlyCreateRole

### internal onlyUpdateRole
Parameters:
* bytes32 _id

### internal onlyValidType
Parameters:
* address typeRef

## Functions

### public initialize

Documentation:

```
@dev initialize ConditionStoreManager Initializer
     Initialize Ownable. Only on contract creation, 
@param _owner refers to the owner of the contract
```
Parameters:
* address _owner

### external getCreateRole

Documentation:

```
@dev getCreateRole get the address of contract
     which has the create role
@return create condition role address
```

### external delegateCreateRole

Documentation:

```
@dev delegateCreateRole only owner can delegate the 
     create condition role to a different address
@param delegatee delegatee address
```
Parameters:
* address delegatee

### external delegateUpdateRole

Documentation:

```
@dev delegateUpdateRole only owner can delegate 
     the update role to a different address for 
     specific condition Id which has the create role
@param delegatee delegatee address
```
Parameters:
* bytes32 _id
* address delegatee

### external createCondition

Documentation:

```
@dev createCondition only called by create role address 
     the condition should use a valid condition contract 
     address, valid time lock and timeout. Moreover, it 
     enforce the condition state transition from 
     Uninitialized to Unfulfilled.
@param _id unique condition identifier
@param _typeRef condition contract address
@return the index of the created condition 
```
Parameters:
* bytes32 _id
* address _typeRef

### public createCondition

Documentation:

```
@dev createCondition only called by create role address 
     the condition should use a valid condition contract 
     address, valid time lock and timeout. Moreover, it 
     enforce the condition state transition from 
     Uninitialized to Unfulfilled.
@param _id unique condition identifier
@param _typeRef condition contract address
@param _timeLock start of the time window
@param _timeOut end of the time window
@return the index of the created condition 
```
Parameters:
* bytes32 _id
* address _typeRef
* uint256 _timeLock
* uint256 _timeOut

### external updateConditionState

Documentation:

```
@dev updateConditionState only called by update role address. 
     It enforce the condition state transition to either 
     Fulfill or Aborted state
@param _id unique condition identifier
@return the current condition state 
```
Parameters:
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState

### external getConditionListSize

Documentation:

```
@dev getConditionListSize 
@return the length of the condition list 
```

### external getCondition

Documentation:

```
@dev getCondition  
@return all the condition details 
```
Parameters:
* bytes32 _id

### external getConditionState

Documentation:

```
@dev getConditionState  
@return condition state
```
Parameters:
* bytes32 _id

### public isConditionTimeLocked

Documentation:

```
@dev isConditionTimeLocked  
@return whether the condition is timedLock ended
```
Parameters:
* bytes32 _id

### public isConditionTimedOut

Documentation:

```
@dev isConditionTimedOut  
@return whether the condition is timed out 
```
Parameters:
* bytes32 _id
