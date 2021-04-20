
# contract: DynamicAccessTemplate

Documentation:
```
@title Dynamic Access Template
@author Keyko
 *
@dev Implementation of Agreement Template
This is a dynamic template that allows to setup flexible conditions depending
on the use case.
```

## Variables


## Functions

### external initialize

Documentation:

```
@notice initialize init the
      contract with the following parameters.
@dev this function is called only once during the contract
      initialization. It initializes the ownable feature, and
      set push the required condition types including
      access secret store, lock reward and escrow reward conditions.
@param _owner contract's owner account address
@param _agreementStoreManagerAddress agreement store manager contract address
@param _didRegistryAddress DID registry contract address
```
Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _didRegistryAddress
