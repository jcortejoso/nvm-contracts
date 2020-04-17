pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './DIDRegistryLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title DID Registry
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the DID Registry.
 *      https://github.com/oceanprotocol/OEPs/tree/master/7#registry
 */
contract DIDRegistry is Ownable {

    /**
     * @dev The DIDRegistry Library takes care of the basic storage functions.
     */
    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;

    /**
     * @dev state storage for the DID registry
     */
    DIDRegistryLibrary.DIDRegisterList internal didRegisterList;
    
    // DID -> Address -> Boolean Permission
    mapping(bytes32 => mapping(address => bool)) DIDPermissions;
    
    modifier onlyDIDOwner(bytes32 _did)
    {
        require(
            msg.sender == didRegisterList.didRegisters[_did].owner,
            'Invalid DID owner can perform this operation.'
        );
        _;
    }

    /**
     * @dev This implementation does not store _value on-chain,
     *      but emits DIDAttributeRegistered events to store it in the event log.
     */
    event DIDAttributeRegistered(
        bytes32 indexed _did,
        address indexed _owner,
        bytes32 indexed _checksum,
        string _value,
        address _lastUpdatedBy,
        uint256 _blockNumberUpdated
    );

    event DIDProviderRemoved(
        bytes32 _did,
        address _provider,
        bool state
    );

    event DIDProviderAdded(
        bytes32 _did,
        address _provider
    );
    
    event DIDOwnershipTransferred(
        bytes32 _did,
        address _previousOwner,
        address _newOwner
    );
    
    event DIDPermissionGranted(
        bytes32 indexed _did,
        address indexed _owner,
        address indexed _grantee
    );
    
    event DIDPermissionRevoked(
        bytes32 indexed _did,
        address indexed _owner,
        address indexed _grantee
    );

    /**
     * @dev DIDRegistry Initializer
     *      Initialize Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract.
     */
    function initialize(
        address _owner
    )
        public
        initializer
    {
        Ownable.initialize(_owner);
    }

    /**
     * @notice Register DID attributes.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _providers list of provider addresses that can provide the services associated with the DID
     * @param _value refers to the attribute value, limited to 2048 bytes.
     * @return the size of the registry after the register action.
     */
    function registerAttribute(
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _value
    )
        public
        returns (uint size)
    {
        require(
            didRegisterList.didRegisters[_did].owner == address(0x0) ||
            didRegisterList.didRegisters[_did].owner == msg.sender,
            'Attributes must be registered by the DID owners.'
        );

        require(
            //TODO: 2048 should be changed in the future
            bytes(_value).length <= 2048,
            'Invalid value size'
        );

        uint updatedSize = didRegisterList.update(_did, _checksum);

        // push providers to storage
        for (uint256 i = 0; i < _providers.length; i++) {
            didRegisterList.addProvider(
                _did,
                _providers[i]
            );

        }

        /* emitting _value here to avoid expensive storage */
        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum,
            _value,
            msg.sender,
            block.number
        );

        return updatedSize;
    }

    /**
     * @notice addDIDProvider add new DID provider.
     *
     * @dev it adds new DID provider to the providers list. A provider
     *      is any entity that can serve the registered asset
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _provider provider's address.
     */
    function addDIDProvider(
        bytes32 _did,
        address _provider
    )
        external
        onlyDIDOwner(_did)
    {
        didRegisterList.addProvider(_did, _provider);

        emit DIDProviderAdded(
            _did,
            _provider
        );
    }

    /**
     * @notice removeDIDProvider delete an existing DID provider.
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _provider provider's address.
     */
    function removeDIDProvider(
        bytes32 _did,
        address _provider
    )
        external
        onlyDIDOwner(_did)
    {
        bool state = didRegisterList.removeProvider(_did, _provider);

        emit DIDProviderRemoved(
            _did,
            _provider,
            state
        );
    }
    
    /**
     * @notice transferDIDOwnership transfer DID ownership
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _newOwner new owner address
     */
    function transferDIDOwnership(bytes32 _did, address _newOwner)
        external
        onlyDIDOwner(_did)
    {
        address _previousOwner = didRegisterList.didRegisters[_did].owner;
        didRegisterList.updateDIDOwner(_did, _newOwner);
        
        emit DIDOwnershipTransferred(
            _did,
            _previousOwner,
            _newOwner
        );
    }

    /**
     * @dev grantPermission grants access permission to grantee 
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     */
    function grantPermission(
        bytes32 _did,
        address _grantee
    )
        external
        onlyDIDOwner(_did)
    {
        _grantPermission(_did, _grantee);
    }
    
    /**
     * @dev revokePermission revokes access permission from grantee 
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     */
    function revokePermission(
        bytes32 _did,
        address _grantee
    )
        external
        onlyDIDOwner(_did)
    {
        _revokePermission(_did, _grantee);
    }
    
    /**
     * @dev getPermission gets access permission of a grantee
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address
     * @return true if grantee has access permission to a DID
     */
    function getPermission(
        bytes32 _did,
        address _grantee
    )
        external
        view
        returns(bool)
    {
        return _getPermission(_did, _grantee);
    }
        
    /**
     * @notice isDIDProvider check whether a given DID provider exists
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _provider provider's address.
     */
    function isDIDProvider(
        bytes32 _did,
        address _provider
    )
        public
        view
        returns (bool)
    {
        return didRegisterList.isProvider(_did, _provider);
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return the address of the DID owner.
     */
    function getDIDRegister(
        bytes32 _did
    )
        public
        view
        returns (
            address owner,
            bytes32 lastChecksum,
            address lastUpdatedBy,
            uint256 blockNumberUpdated,
            address[] memory providers
        )
    {
        owner = didRegisterList.didRegisters[_did].owner;
        lastChecksum = didRegisterList.didRegisters[_did].lastChecksum;
        lastUpdatedBy = didRegisterList.didRegisters[_did].lastUpdatedBy;
        blockNumberUpdated = didRegisterList.didRegisters[_did]
            .blockNumberUpdated;
        providers = didRegisterList.didRegisters[_did].providers;
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return last modified (update) block number of a DID.
     */
    function getBlockNumberUpdated(bytes32 _did)
        public
        view
        returns (uint256 blockNumberUpdated)
    {
        return didRegisterList.didRegisters[_did].blockNumberUpdated;
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return the address of the DID owner.
     */
    function getDIDOwner(bytes32 _did)
        public
        view
        returns (address didOwner)
    {
        return didRegisterList.didRegisters[_did].owner;
    }

    /**
     * @return the length of the DID registry.
     */
    function getDIDRegistrySize()
        public
        view
        returns (uint size)
    {
        return didRegisterList.didRegisterIds.length;
    }

    /**
     * @return the length of the DID registry.
     */
    function getDIDRegisterIds()
        public
        view
        returns (bytes32[] memory)
    {
        return didRegisterList.didRegisterIds;
    }
    
    /**
     * @dev _grantPermission grants access permission to grantee 
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     */
    function _grantPermission(
        bytes32 _did,
        address _grantee
    )
        internal
    {
        require(
            _grantee != address(0),
            'Invalid grantee address'
        );
        DIDPermissions[_did][_grantee] = true;
        emit DIDPermissionGranted(
            _did,
            msg.sender,
            _grantee
        );
    }
    
    /**
     * @dev _revokePermission revokes access permission from grantee 
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     */
    function _revokePermission(
        bytes32 _did,
        address _grantee
    )
        internal
    {
        require(
            DIDPermissions[_did][_grantee],
            'Grantee already was revoked'
        );
        DIDPermissions[_did][_grantee] = false;
        emit DIDPermissionRevoked(
            _did,
            msg.sender,
            _grantee
        );
    }
    
    /**
     * @dev _getPermission gets access permission of a grantee
     * @param _did refers to decentralized identifier (a bytes32 length ID)
     * @param _grantee address 
     * @return true if grantee has access permission to a DID 
     */
    function _getPermission(
        bytes32 _did,
        address _grantee
    )
        internal
        view
        returns(bool)
    {
        return DIDPermissions[_did][_grantee];
    }

}
