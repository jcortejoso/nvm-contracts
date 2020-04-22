
# contract: WhitelistingCondition

Documentation:
```
@title Whitelisting Condition
@author Ocean Protocol Team
 * @dev Implementation of the Whitelisting Condition
     TODO: documentation
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
@param _listAddress list contract address
@param _item item in the list
@return bytes32 hash of all these values 
```
Parameters:
* address _listAddress
* bytes32 _item

### public fulfill

Documentation:

```
@notice fulfill check whether address is whitelisted
in order to fulfill the condition. This method will be 
called by any one in this whitelist. 
@param _agreementId SEA agreement identifier
@param _listAddress list contract address
@param _item item in the list
@return condition state
```
Parameters:
* bytes32 _agreementId
* address _listAddress
* bytes32 _item
