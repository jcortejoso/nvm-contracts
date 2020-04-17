
# contract: Condition

Documentation:
```
@title Condition
@author Ocean Protocol Team
 * @dev Implementation of the Condition
 *      Each condition has a validation function that returns either FULFILLED, 
     ABORTED or UNFULFILLED. When a condition is successfully solved, we call 
     it FULFILLED. If a condition cannot be FULFILLED anymore due to a timeout 
     or other types of counter-proofs, the condition is ABORTED. UNFULFILLED 
     values imply that a condition has not been provably FULFILLED or ABORTED. 
     All initialized conditions start out as UNFULFILLED.
     For more information please refer to this link: 
     https://github.com/oceanprotocol/OEPs/issues/133
     TODO: update the OEP link
```

## Variables

### internal conditionStoreManager

## Functions

### public generateId

Documentation:

```
@notice generateId condition Id from the following 
      parameters
@param _agreementId SEA agreement ID
@param _valueHash hash of all the condition input values
```
Parameters:
* bytes32 _agreementId
* bytes32 _valueHash

### internal fulfill

Documentation:

```
@notice fulfill set the condition state to Fulfill | Abort
@param _id condition identifier
@param _newState new condition state (Fulfill/Abort)
@return the updated condition state 
```
Parameters:
* bytes32 _id
* enum ConditionStoreLibrary.ConditionState _newState

### external abortByTimeOut

Documentation:

```
@notice abortByTimeOut set condition state to Aborted 
        if the condition is timed out
@param _id condition identifier
@return the updated condition state
```
Parameters:
* bytes32 _id
