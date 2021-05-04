
Implementation of condition allowing to transfer an NFT
     between the original owner and a receiver


## Functions
### initialize
```solidity
  function initialize(
    address _owner,
    address _conditionStoreManagerAddress,
    address _agreementStoreManagerAddress
  ) external
```
initialize init the contract with the following parameters

this function is called only once during the contract
      initialization.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_owner` | address | contract's owner account address
|`_conditionStoreManagerAddress` | address | condition store manager address    
|`_agreementStoreManagerAddress` | address | agreement store manager address

### hashValues
```solidity
  function hashValues(
    bytes32 _did,
    address _nftReceiver,
    uint256 _nftAmount,
    bytes32 _lockCondition
  ) public returns (bytes32)
```
hashValues generates the hash of condition inputs 
       with the following parameters


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_did` | bytes32 | refers to the DID in which secret store will issue the decryption keys
|`_nftReceiver` | address | is the address of the granted user or the DID provider
|`_nftAmount` | uint256 | amount of NFTs to transfer   
|`_lockCondition` | bytes32 | lock condition identifier    

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`bytes32`| bytes32 | hash of all these values
### fulfill
```solidity
  function fulfill(
    bytes32 _agreementId,
    bytes32 _did,
    address _nftReceiver,
    uint256 _nftAmount,
    bytes32 _lockPaymentCondition
  ) public returns (enum ConditionStoreLibrary.ConditionState)
```
fulfill the transfer NFT condition

only DID owner or DID provider can call this
      method. Fulfill method transfer a certain amount of NFTs 
      to the _receiver address. 
      When true then fulfill the condition

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_agreementId` | bytes32 | agreement identifier
|`_did` | bytes32 | refers to the DID in which secret store will issue the decryption keys
|`_nftReceiver` | address | is the address of the account to receive the NFT
|`_nftAmount` | uint256 | amount of NFTs to transfer  
|`_lockPaymentCondition` | bytes32 | lock payment condition identifier

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`condition`| bytes32 | state (Fulfilled/Aborted)
### fulfillWithNFTLock
```solidity
  function fulfillWithNFTLock(
    bytes32 _agreementId,
    bytes32 _did,
    address _nftReceiver,
    uint256 _nftAmount,
    bytes32 _nftLockCondition
  ) public returns (enum ConditionStoreLibrary.ConditionState)
```
fulfill the transfer NFT condition

only DID owner or DID provider can call this
      method. Fulfill method transfer a certain amount of NFTs 
      to the _receiver address. 
      When true then fulfill the condition

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_agreementId` | bytes32 | agreement identifier
|`_did` | bytes32 | refers to the DID in which secret store will issue the decryption keys
|`_nftReceiver` | address | is the address of the account to receive the NFT
|`_nftAmount` | uint256 | amount of NFTs to transfer  
|`_nftLockCondition` | bytes32 | lock payment condition identifier

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`condition`| bytes32 | state (Fulfilled/Aborted)
## Events
### Fulfilled
```solidity
  event Fulfilled(
  )
```



