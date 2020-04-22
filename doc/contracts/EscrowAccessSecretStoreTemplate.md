
# contract: EscrowAccessSecretStoreTemplate

Documentation:
```
@title Agreement Template
@author Ocean Protocol Team
 * @dev Implementation of Agreement Template
 *      Escrow Access secret store template is use case specific template.
     Anyone (consumer/provider/publisher) can use this template in order
     to setup an on-chain SEA. The template is a composite of three basic
     conditions. Once the agreement is created, the consumer will lock an amount
     of tokens (as listed in the DID document - off-chain metadata) to the 
     the lock reward contract which in turn will fire an event. ON the other hand 
     the provider is listening to the to all the emitted events, the provider 
     will catch the event and grant permissions to the consumer through 
     secret store contract, the consumer now is able to download the data set
     by asking the off-chain component of secret store to decrypt the DID and 
     encrypt it using the consumer's public key. Then the secret store will 
     provide an on-chain proof that the consumer had access to the data set.
     Finally, the provider can call the escrow reward condition in order 
     to release the payment. Every condition has a time window (time lock and 
     time out). This implies that if the provider didn't grant the access to 
     the consumer through secret store within this time window, the consumer 
     can ask for refund.
```

## Variables

### internal didRegistry

### internal accessSecretStoreCondition

### internal lockRewardCondition

### internal escrowReward

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
@param _accessSecretStoreConditionAddress access secret store contract address
@param _lockRewardConditionAddress lock reward condition contract address
@param _escrowRewardAddress escrow reward contract address
```
Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _didRegistryAddress
* address _accessSecretStoreConditionAddress
* address _lockRewardConditionAddress
* address _escrowRewardAddress
