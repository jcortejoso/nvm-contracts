pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './DIDRegistryLibrary.sol';
import './ProvenanceRegistry.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

/**
 * @title DID Factory
 * @author Keyko
 *
 * @dev Implementation of the DID Registry.
 */
contract DIDFactory is OwnableUpgradeable, ProvenanceRegistry {

    /**
     * @dev The DIDRegistry Library takes care of the basic DID storage functions.
     */
    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;

    /**
     * @dev state storage for the DID registry
     */
    DIDRegistryLibrary.DIDRegisterList internal didRegisterList;
    
    // DID -> Address -> Boolean Permission
    mapping(bytes32 => mapping(address => bool)) internal didPermissions;
    

    //////////////////////////////////////////////////////////////
    ////////  MODIFIERS   ////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    
    modifier onlyDIDOwner(bytes32 _did)
    {
        require(// solhint-disable-next-line avoid-tx-origin
            tx.origin == didRegisterList.didRegisters[_did].owner,
            'Only DID Owner allowed'
        );
        _;
    }
    
    modifier onlyOwnerProviderOrDelegated(bytes32 _did)
    {
        require(
            msg.sender == didRegisterList.didRegisters[_did].owner ||
            isProvenanceDelegate(_did, msg.sender) ||
            isDIDProvider(_did, msg.sender),
            'Only DID Owner, Provider or Delegate allowed'
        );
        _;
    }

    modifier onlyValidAttributes(string memory _attributes)
    {
        require(
            bytes(_attributes).length <= 2048,
            'Invalid attributes size'
        );
        _;
    }
    
    //////////////////////////////////////////////////////////////
    ////////  EVENTS  ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    /**
     * DID Events
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

    event DIDProvenanceDelegateRemoved(
        bytes32 _did,
        address _delegate,
        bool state
    );

    event DIDProvenanceDelegateAdded(
        bytes32 _did,
        address _delegate
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
    virtual
    initializer
    {
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
    }

    /**
     * @notice Register DID attributes.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _url refers to the attribute value, limited to 2048 bytes.
     * @return size refers to the size of the registry after the register action.
     */
    function registerAttribute(
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _url
    )
    public
    virtual
    returns (uint size)
    {
        return registerDID(_did, _checksum, _providers, _url, '', '');
    }


    /**
     * @notice Register DID attributes.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
     * @param _activityId refers to activity
     * @param _attributes refers to the provenance attributes     
     * @return size refers to the size of the registry after the register action.
     */
    function registerDID(
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _url,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    virtual
    onlyValidAttributes(_attributes)
    returns (uint size)
    {
        require(
            didRegisterList.didRegisters[_did].owner == address(0x0) ||
            didRegisterList.didRegisters[_did].owner == msg.sender,
            'Attributes must be registered by the DID owners.'
        );

        require(
        //TODO: 2048 should be changed in the future
            bytes(_url).length <= 2048,
            'Invalid value size'
        );

        uint updatedSize = didRegisterList.update(_did, _checksum, _url);

        // push providers to storage
        for (uint256 i = 0; i < _providers.length; i++) {
            didRegisterList.addProvider(
                _did,
                _providers[i]
            );
        }

        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum,
            _url,
            msg.sender,
            block.number
        );

        wasGeneratedBy(
            _did, _did, msg.sender, _activityId, _attributes);
        
        return updatedSize;
    }
    
    function wasGeneratedBy(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    internal
    override
    onlyDIDOwner(_did)
    returns (bool)
    {
        return super.wasGeneratedBy(
            _provId, _did, _agentId, _activityId, _attributes);
    }

    
    function used(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        bytes memory _signatureUsing,    
        string memory _attributes
    )
    public
    override
    onlyOwnerProviderOrDelegated(_did)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {
        return super.used(
            _provId, _did, _agentId, _activityId, _signatureUsing, _attributes);
    }
    
    
    function wasDerivedFrom(
        bytes32 _provId,
        bytes32 _newEntityDid,
        bytes32 _usedEntityDid,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    override
    onlyOwnerProviderOrDelegated(_usedEntityDid)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {
        return super.wasDerivedFrom(
            _provId, _newEntityDid, _usedEntityDid, _agentId, _activityId, _attributes);
    }

    
    function wasAssociatedWith(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    override
    onlyOwnerProviderOrDelegated(_did)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {
        return super.wasAssociatedWith(
            _provId, _did, _agentId, _activityId, _attributes);
    }

    
    /**
     * @notice Implements the W3C PROV Delegation action
     * Each party involved in this method (_delegateAgentId & _responsibleAgentId) must provide a valid signature.
     * The content to sign is a representation of the footprint of the event (_did + _delegateAgentId + _responsibleAgentId + _activityId) 
     *
     * @param _provId unique identifier referring to the provenance entry
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity
     * @param _delegateAgentId refers to address acting on behalf of the provenance record
     * @param _responsibleAgentId refers to address responsible of the provenance record
     * @param _activityId refers to activity
     * @param _signatureDelegate refers to the digital signature provided by the did delegate.     
     * @param _attributes refers to the provenance attributes
     * @return success true if the action was properly registered
     */
    function actedOnBehalf(
        bytes32 _provId,
        bytes32 _did,
        address _delegateAgentId,
        address _responsibleAgentId,
        bytes32 _activityId,
        bytes memory _signatureDelegate,
        string memory _attributes
    )
    public
    override
    onlyOwnerProviderOrDelegated(_did)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {
        super.actedOnBehalf(
            _provId, _did, _delegateAgentId, _responsibleAgentId, _activityId, _signatureDelegate, _attributes);
        addDIDProvenanceDelegate(_did, _delegateAgentId);
        return true;
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
     * @notice addDIDProvenanceDelegate add new DID provenance delegate.
     *
     * @dev it adds new DID provenance delegate to the delegates list. 
     * A delegate is any entity that interact with the provenance entries of one DID
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _delegate delegates's address.
     */
    function addDIDProvenanceDelegate(
        bytes32 _did,
        address _delegate
    )
    public
    onlyOwnerProviderOrDelegated(_did)
    {
        didRegisterList.addDelegate(_did, _delegate);

        emit DIDProvenanceDelegateAdded(
            _did,
            _delegate
        );
    }

    /**
     * @notice removeDIDProvenanceDelegate delete an existing DID delegate.
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _delegate delegate's address.
     */
    function removeDIDProvenanceDelegate(
        bytes32 _did,
        address _delegate
    )
    external
    onlyOwnerProviderOrDelegated(_did)
    {
        bool state = didRegisterList.removeDelegate(_did, _delegate);

        emit DIDProvenanceDelegateRemoved(
            _did,
            _delegate,
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
     * @return owner the did owner
     * @return lastChecksum 
     * @return url 
     * @return lastUpdatedBy 
     * @return blockNumberUpdated 
     * @return providers
     * @return nftSupply
     * @return mintCap
     * @return royalties
     */
    function getDIDRegister(
        bytes32 _did
    )
    public
    view
    returns (
        address owner,
        bytes32 lastChecksum,
        string memory url,
        address lastUpdatedBy,
        uint256 blockNumberUpdated,
        address[] memory providers,
        uint256 nftSupply,
        uint256 mintCap,
        uint256 royalties
    )
    {
        owner = didRegisterList.didRegisters[_did].owner;
        lastChecksum = didRegisterList.didRegisters[_did].lastChecksum;
        url = didRegisterList.didRegisters[_did].url;
        lastUpdatedBy = didRegisterList.didRegisters[_did].lastUpdatedBy;
        blockNumberUpdated = didRegisterList
            .didRegisters[_did].blockNumberUpdated;
        providers = didRegisterList.didRegisters[_did].providers;
        nftSupply = didRegisterList.didRegisters[_did].nftSupply;
        mintCap = didRegisterList.didRegisters[_did].mintCap;
        royalties = didRegisterList.didRegisters[_did].royalties;
    }
    
    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return blockNumberUpdated last modified (update) block number of a DID.
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
     * @return didOwner the address of the DID owner.
     */
    function getDIDOwner(bytes32 _did)
    public
    view
    returns (address didOwner)
    {
        return didRegisterList.didRegisters[_did].owner;
    }

    /**
     * @return size the length of the DID registry.
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
        didPermissions[_did][_grantee] = true;
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
            didPermissions[_did][_grantee],
            'Grantee already was revoked'
        );
        didPermissions[_did][_grantee] = false;
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
        return didPermissions[_did][_grantee];
    }


    //// PROVENANCE SUPPORT METHODS

    /**
     * Fetch the complete provenance entry attributes
     * @param _provId refers to the provenance identifier
     * @return did 
     * @return relatedDid 
     * @return agentId
     * @return activityId 
     * @return agentInvolvedId 
     * @return method
     * @return createdBy 
     * @return blockNumberUpdated 
     * @return signature 
     * 
     */
    function getProvenanceEntry(
        bytes32 _provId
    )
    public
    view
    returns (     
        bytes32 did,
        bytes32 relatedDid,
        address agentId,
        bytes32 activityId,
        address agentInvolvedId,
        uint8   method,
        address createdBy,
        uint256 blockNumberUpdated,
        bytes memory signature
    )
    {
        did = provenanceRegistry.list[_provId].did;
        relatedDid = provenanceRegistry.list[_provId].relatedDid;
        agentId = provenanceRegistry.list[_provId].agentId;
        activityId = provenanceRegistry.list[_provId].activityId;
        agentInvolvedId = provenanceRegistry.list[_provId].agentInvolvedId;
        method = provenanceRegistry.list[_provId].method;
        createdBy = provenanceRegistry.list[_provId].createdBy;
        blockNumberUpdated = provenanceRegistry
            .list[_provId].blockNumberUpdated;
        signature = provenanceRegistry.list[_provId].signature;
    }
    
    /**
     * @notice isProvenanceDelegate check whether a given DID delegate exists
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _delegate delegate's address.
     */
    function isProvenanceDelegate(
        bytes32 _did,
        address _delegate
    )
    public
    view
    returns (bool)
    {
        return didRegisterList.isDelegate(_did, _delegate);
    }

    /**
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @return provenanceOwner the address of the Provenance owner.
     */
    function getProvenanceOwner(bytes32 _did)
    public
    view
    returns (address provenanceOwner)
    {
        return provenanceRegistry.list[_did].createdBy;
    }

}
