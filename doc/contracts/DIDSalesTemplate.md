
# contract: DIDSalesTemplate

Documentation:
```
 * @title Agreement Template
 * @author Keyko
 *
 * @dev Implementation of DID Sales Template
 *
 *      The DID Sales template supports an scenario where an Asset owner
 *      can sell that asset to a new Owner.
 *      Anyone (consumer/provider/publisher) can use this template in order
 *      to setup an agreement allowing an Asset owner to get transfer the asset ownership
 *      after some payment.
 *      The template is a composite of 3 basic conditions:
 *      - Lock Payment Condition
 *      - Transfer DID Condition
 *      - Escrow Reward Condition
 *
 *      This scenario takes into account royalties for original creators in the secondary market.
 *      Once the agreement is created, the consumer after payment can request the ownership transfer of an asset
 *      from the current owner for a specific DID.
```

## Variables

## Functions

### external initialize

Documentation:

```
    * @notice initialize init the
    *       contract with the following parameters.
    * @dev this function is called only once during the contract
    *       initialization. It initializes the ownable feature, and
    *       set push the required condition types including
    *       access secret store, lock reward and escrow reward conditions.
    * @param _owner contract's owner account address
    * @param _agreementStoreManagerAddress agreement store manager contract address
    * @param _lockConditionAddress lock reward condition contract address
    * @param _transferConditionAddress transfer ownership condition contract address
    * @param _escrowPaymentAddress escrow reward condition contract address
```

Parameters:
* address _owner
* address _agreementStoreManagerAddress
* address _lockConditionAddress
* address _transferConditionAddress
* address _escrowPaymentAddress

