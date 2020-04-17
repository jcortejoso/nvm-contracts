
# contract: HashLockCondition

Documentation:
```
@title Hash Lock Condition
@author Ocean Protocol Team
 * @dev Implementation of the Hash Lock Condition
 *      For more information, please refer the following link
     https://github.com/oceanprotocol/OEPs/issues/122
     TODO: update the OEP link 
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
@param _preimage refers uint value of the hash pre-image.
@return bytes32 hash of all these values 
```
Parameters:
* uint256 _preimage

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs 
       with the following parameters
@param _preimage refers string value of the hash pre-image.
@return bytes32 hash of all these values 
```
Parameters:
* string _preimage

### public hashValues

Documentation:

```
@notice hashValues generates the hash of condition inputs 
       with the following parameters
@param _preimage refers bytes32 value of the hash pre-image.
@return bytes32 hash of all these values 
```
Parameters:
* bytes32 _preimage

### external fulfill

Documentation:

```
@notice fulfill the condition by calling check the 
      the hash and the pre-image uint value
@param _agreementId SEA agreement identifier
@return condition state
```
Parameters:
* bytes32 _agreementId
* uint256 _preimage

### public fulfill

Documentation:

```
@notice fulfill the condition by calling check the 
      the hash and the pre-image string value
@param _agreementId SEA agreement identifier
@return condition state
```
Parameters:
* bytes32 _agreementId
* string _preimage

### external fulfill

Documentation:

```
@notice fulfill the condition by calling check the 
      the hash and the pre-image bytes32 value
@param _agreementId SEA agreement identifier
@return condition state
```
Parameters:
* bytes32 _agreementId
* bytes32 _preimage

### private _fulfill

Documentation:

```
@notice _fulfill calls super fulfil method
@param _generatedId SEA agreement identifier
@return condition state
```
Parameters:
* bytes32 _generatedId
