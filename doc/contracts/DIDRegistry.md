
# contract: DIDRegistry

Documentation:
```
@title DID Registry
@author Keyko
@dev Implementation of a Mintable DID Registry.
```

## Variables

### internal didRegisterList

### internal DIDPermissions

## Events

###  DIDAttributeRegistered

Documentation:

```
@dev This implementation does not store _value on-chain,
     but emits DIDAttributeRegistered events to store it in the event log.
```
Parameters:
* bytes32 _did
* address _owner
* bytes32 _checksum
* string _value
* address _lastUpdatedBy
* uint256 _blockNumberUpdated

###  DIDProviderRemoved
Parameters:
* bytes32 _did
* address _provider
* bool state

###  DIDProviderAdded
Parameters:
* bytes32 _did
* address _provider

###  DIDOwnershipTransferred
Parameters:
* bytes32 _did
* address _previousOwner
* address _newOwner

###  DIDPermissionGranted
Parameters:
* bytes32 _did
* address _owner
* address _grantee

###  DIDPermissionRevoked
Parameters:
* bytes32 _did
* address _owner
* address _grantee

## Modifiers

### internal onlyDIDOwner
Parameters:
* bytes32 _did

## Functions

### public initialize

Documentation:

```
@dev DIDRegistry Initializer
     Initialize Ownable. Only on contract creation.
@param _owner refers to the owner of the contract.
```
Parameters:
* address _owner

### public registerDID

Documentation:

```
@notice Register DID attributes.
     *
@dev The first attribute of a DID registered sets the DID owner.
     Subsequent updates record _checksum and update info.
     *
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _checksum includes a one-way HASH calculated using the DDO content.
@param _providers list of addresses that can act as an asset provider
@param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
@param _activityId refers to activity
@param _attributes refers to the provenance attributes
@return size refers to the size of the registry after the register action.
```
Parameters:
* bytes32 _did
* bytes32 _checksum
* address[] _providers
* string _url
* bytes32 _activityId
* string _attributes

### public registerMintableDID

Documentation:

```
@notice Register a Mintable DID.
     *
@dev The first attribute of a DID registered sets the DID owner.
     Subsequent updates record _checksum and update info.
     *
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _checksum includes a one-way HASH calculated using the DDO content.
@param _providers list of addresses that can act as an asset provider
@param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
@param _cap refers to the mint cap
@param _royalties refers to the royalties to reward to the DID creator in the secondary market
@param _activityId refers to activity
@param _attributes refers to the provenance attributes
@return size refers to the size of the registry after the register action.
```
Parameters:
* bytes32 _did
* bytes32 _checksum
* address[] _providers
* string _url
* uint256 _cap
* uint8 _royalties
* bytes32 _activityId
* string _attributes

### public enableAndMintDidNft

Documentation:

```

@notice enableDidNft creates the initial setup of NFTs minting and royalties distribution.
After this initial setup, this data can't be changed anymore for the DID given, even for the owner of the DID.
The reason of this is to avoid minting additional NFTs after the initial agreement, what could affect the
valuation of NFTs of a DID already created.

@dev update the DID registry providers list by adding the mintCap and royalties configuration
@param _did refers to decentralized identifier (a byte32 length ID)
@param _cap refers to the mint cap
@param _royalties refers to the royalties to reward to the DID creator in the secondary market
@param _preMint if is true mint directly the amount capped tokens and lock in the _lockAddress

```
Parameters:
* bytes32 _did
* uint256 _cap
* uint8 _royalties
* bool _preMint


### public mint

Documentation:

```

@notice Mints a NFT associated to the DID
     *
@dev Because ERC-1155 uses uint256 and DID's are bytes32, there is a conversion between both
     Only the DID owner can mint NFTs associated to the DID
     *
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _amount amount to mint
```
Parameters:
* bytes32 _did
* uint256 _amount


### public burn

Documentation:

```
@notice Burns NFTs associated to the DID
     *
@dev Because ERC-1155 uses uint256 and DID's are bytes32, there is a conversion between both
     Only the DID owner can burn NFTs associated to the DID
     *
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _amount amount to burn
```
Parameters:
* bytes32 _did
* uint256 _amount



### external addDIDProvider

Documentation:

```
@notice addDIDProvider add new DID provider.
@dev it adds new DID provider to the providers list. A provider
     is any entity that can serve the registered asset
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _provider provider's address.
```
Parameters:
* bytes32 _did
* address _provider

### external removeDIDProvider

Documentation:

```
@notice removeDIDProvider delete an existing DID provider.
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _provider provider's address.
```
Parameters:
* bytes32 _did
* address _provider

### external transferDIDOwnership

Documentation:

```
@notice transferDIDOwnership transfer DID ownership
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _newOwner new owner address
```
Parameters:
* bytes32 _did
* address _newOwner

### external grantPermission

Documentation:

```
@dev grantPermission grants access permission to grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
```
Parameters:
* bytes32 _did
* address _grantee

### external revokePermission

Documentation:

```
@dev revokePermission revokes access permission from grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
```
Parameters:
* bytes32 _did
* address _grantee

### external getPermission

Documentation:

```
@dev getPermission gets access permission of a grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
@return true if grantee has access permission to a DID
```
Parameters:
* bytes32 _did
* address _grantee

### public isDIDProvider

Documentation:

```
@notice isDIDProvider check whether a given DID provider exists
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _provider provider's address.
```
Parameters:
* bytes32 _did
* address _provider

### public getDIDRegister

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return the address of the DID owner.
```
Parameters:
* bytes32 _did

### public getBlockNumberUpdated

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return last modified (update) block number of a DID.
```
Parameters:
* bytes32 _did

### public getDIDOwner

Documentation:

```
@param _did refers to decentralized identifier (a bytes32 length ID).
@return the address of the DID owner.
```
Parameters:
* bytes32 _did

### public getDIDRegistrySize

Documentation:

```
@return the length of the DID registry.
```

### public getDIDRegisterIds

Documentation:

```
@return the length of the DID registry.
```

### internal _grantPermission

Documentation:

```
@dev _grantPermission grants access permission to grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
```
Parameters:
* bytes32 _did
* address _grantee

### internal _revokePermission

Documentation:

```
@dev _revokePermission revokes access permission from grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
```
Parameters:
* bytes32 _did
* address _grantee

### internal _getPermission

Documentation:

```
@dev _getPermission gets access permission of a grantee
@param _did refers to decentralized identifier (a bytes32 length ID)
@param _grantee address
@return true if grantee has access permission to a DID
```
Parameters:
* bytes32 _did
* address _grantee
