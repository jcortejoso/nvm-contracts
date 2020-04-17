
# contract: SignCondition

Documentation:
```
@title Sign Condition
@author Ocean Protocol Team
 * @dev Implementation of the Sign Condition
 *      For more information, please refer the following link
     https://github.com/oceanprotocol/OEPs/issues/121
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
@param _message the message to be signed
@param _publicKey the public key of the signing address
@return bytes32 hash of all these values 
```
Parameters:
* bytes32 _message
* address _publicKey

### public fulfill

Documentation:

```
@notice fulfill validate the signed message and fulfill the condition
@param _agreementId SEA agreement identifier
@param _message the message to be signed
@param _publicKey the public key of the signing address
@param _signature signature of the signed message using the public key
@return condition state
```
Parameters:
* bytes32 _agreementId
* bytes32 _message
* address _publicKey
* bytes _signature
