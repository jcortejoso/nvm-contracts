
# contract: ComputeExecutionCondition

Documentation:
```
@title Compute Execution Condition
@author Ocean Protocol Team
 * @dev Implementation of the Compute Execution Condition
     This condition is meant to be a signal in which triggers
     the execution of a compute service. The compute service is fully described
     in the associated DID document. The provider of the compute service will
     send this signal to its workers by fulfilling the condition where
     they are listening to the fulfilled event.
```

## Variables

### private computeExecutionStatus

### private agreementStoreManager

## Events

###  Fulfilled
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _computeConsumer
* bytes32 _conditionId

## Modifiers

### internal onlyDIDOwnerOrProvider
Parameters:
* bytes32 _did

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
@param _agreementStoreManagerAddress agreement store manager address
```
Parameters:
* address _owner
* address _conditionStoreManagerAddress
* address _agreementStoreManagerAddress

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs 
       with the following parameters
@param _did Decentralized Identifier (unique compute/asset resolver) describes the compute service
@param _computeConsumer is the consumer's address 
@return bytes32 hash of all these values 
```
Parameters:
* bytes32 _did
* address _computeConsumer

### public fulfill

Documentation:

```
@notice fulfill compute execution condition
@dev only the compute provider can fulfill this condition. By fulfilling this 
condition the compute provider will trigger the execution of 
the offered job/compute. The compute service is described in a DID document.
@param _agreementId agreement identifier
@param _did Decentralized Identifier (unique compute/asset resolver) describes the compute service
@param _computeConsumer is the consumer's address 
@return condition state (Fulfilled/Aborted)
```
Parameters:
* bytes32 _agreementId
* bytes32 _did
* address _computeConsumer

### public wasComputeTriggered

Documentation:

```
@notice wasComputeTriggered checks whether the compute is triggered or not.
@param _did Decentralized Identifier (unique compute/asset resolver) describes the compute service
@param _computeConsumer is the compute consumer's address
@return true if the compute is triggered 
```
Parameters:
* bytes32 _did
* address _computeConsumer
