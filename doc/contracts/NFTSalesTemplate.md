
# contract: NFTSalesTemplate

Documentation:
```
@title Agreement Template
@author Keyko

@dev Implementation of NFT Sales Template

The NFT Sales template supports an scenario where a NFT owner
can sell that asset to a new Owner.
Anyone (consumer/provider/publisher) can use this template in order
to setup an agreement allowing a NFT owner to transfer the asset ownership
after some payment.
The template is a composite of 3 basic conditions:
- Lock Payment Condition
- Transfer NFT Condition
- Escrow Reward Condition

This scenario takes into account royalties for original creators in the secondary market.
Once the agreement is created, the consumer after payment can request the transfer of the NFT
from the current owner for a specific DID.
```

## Variables

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
@param _lockPaymentConditionAddress lock reward condition contract address
@param _transferConditionAddress transfer NFT condition contract address
@param _escrowPaymentAddress escrow reward condition contract address
```
Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _lockPaymentConditionAddress
* address _transferConditionAddress
* address _escrowPaymentAddress
