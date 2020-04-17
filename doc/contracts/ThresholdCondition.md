
# contract: ThresholdCondition

Documentation:
```
@title Threshold Condition
@author Ocean Protocol Team
 * @dev Implementation of the Threshold Condition
 *      
     Threshold condition acts as a filter for a set of input condition(s) in which sends 
     a signal whether to complete the flow execution or abort it. This type of conditions 
     works as intermediary conditions where they wire SEA conditions in order to support  
     more complex scenarios.
```

## Functions

### external initialize

Documentation:

```
@notice initialize init the 
      contract with the following parameters
@dev this function is called only once during the contract
      initialization.
@param _owner contract's owner account address
@param _conditionStoreManagerAddress condition store manager address
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs 
       with the following parameters
@param inputConditions array of input conditions IDs
@param threshold the required number of fulfilled input conditions
@return bytes32 hash of all these values 
```
Parameters:
* bytes32[] inputConditions
* uint256 threshold

### external fulfill

Documentation:

```
@notice fulfill threshold condition
@dev the fulfill method check whether input conditions are
      fulfilled or not.
@param _agreementId agreement identifier
@param _inputConditions array of input conditions IDs
@param threshold the required number of fulfilled input conditions
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _agreementId
* bytes32[] _inputConditions
* uint256 threshold

### private canFulfill

Documentation:

```
@notice canFulfill check if condition can be fulfilled
@param _inputConditions array of input conditions IDs
@param threshold the required number of fulfilled input conditions
@return true if can fulfill 
```
Parameters:
* bytes32[] _inputConditions
* uint256 threshold
