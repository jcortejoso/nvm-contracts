pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '../../registry/DIDRegistry.sol';

/**
 * @title NFT Access Condition
 * @author Keyko
 *
 * @dev Implementation of the Access Condition specific for NFTs
 *
 *      NFT Access Condition is special condition used to give access 
 *      to a specific NFT related to a DID.
 */
contract NFTAccessCondition is Condition {

    bytes32 constant public CONDITION_TYPE = keccak256('NFTAccessCondition');

    struct DocumentPermission {
        bytes32 agreementIdDeprecated;
        mapping(address => bool) permission;
    }

    mapping(bytes32 => DocumentPermission) private nftPermissions;
    DIDRegistry private didRegistry;
    
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _documentId,
        address indexed _grantee,
        bytes32 _conditionId
    );
    
    modifier onlyDIDOwnerOrProvider(
        bytes32 _documentId
    )
    {
        require(
            didRegistry.isDIDProvider(_documentId, msg.sender) || 
            msg.sender == didRegistry.getDIDOwner(_documentId),
            'Invalid DID owner/provider'
        );
        _;
    }

   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _didRegistryAddress DID registry address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _didRegistryAddress
    )
        external
        initializer()
    {
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );

        didRegistry = DIDRegistry(
            _didRegistryAddress
        );
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    * @param _grantee is the address of the granted user or the DID provider
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _documentId,
        address _grantee
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(_documentId, _grantee));
    }

   /**
    * @notice fulfill access secret store condition
    * @dev only DID owner or DID provider can call this
    *       method. Fulfill method sets the permissions 
    *       for the granted consumer's address to true then
    *       fulfill the condition
    * @param _agreementId agreement identifier
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    * @param _grantee is the address of the granted user or the DID provider
    * @return condition state (Fulfilled/Aborted)
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _documentId,
        address _grantee
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        grantPermission(
            _grantee,
            _documentId
        );
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_documentId, _grantee)
        );

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
        
        emit Fulfilled(
            _agreementId,
            _documentId,
            _grantee,
            _id
        );

        return state;
    }
    
   /**
    * @notice grantPermission is called only by DID owner or provider
    * @param _grantee is the address of the granted user or the DID provider
    * @param _documentId refers to the DID in which secret store will issue the decryption keys
    */
    function grantPermission(
        address _grantee,
        bytes32 _documentId
        
    )
        public
        onlyDIDOwnerOrProvider(_documentId)
    {
        nftPermissions[_documentId].permission[_grantee] = true;
    }
    
   /**
    * @notice checkPermissions is called to validate the permissions of user related to the NFT attached to an asset
    * @param _documentId refers to the DID 
    * @param _grantee is the address of the granted user or the DID provider
    * @return permissionGranted true if the access was granted
    */
    function checkPermissions(
        address _grantee,
        bytes32 _documentId
    )
        external view
        returns(bool permissionGranted)
    {
        return (
            didRegistry.isDIDProvider(_documentId, _grantee) || 
            didRegistry.isDIDOwner(_grantee, _documentId) ||
            nftPermissions[_documentId].permission[_grantee]
        );
    }
}

