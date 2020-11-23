pragma solidity 0.5.6;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './DIDRegistryLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'openzeppelin-eth/contracts/cryptography/ECDSA.sol';

/**
 * @title DID Registry
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of the DID Registry.
 */
contract DIDRegistry is Ownable {

    /**
     * @dev The DIDRegistry Library takes care of the basic DID storage functions.
     */
    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;

    /**
     * @dev state storage for the DID registry
     */
    DIDRegistryLibrary.DIDRegisterList internal didRegisterList;

    // DID -> Address -> Boolean Permission
    mapping(bytes32 => mapping(address => bool)) DIDPermissions;

    /**
     * @dev The DIDRegistryLibrary Library takes care of the basic provenance storage functions.
     */
    /* solium-disable-next-line */
    using DIDRegistryLibrary for DIDRegistryLibrary.ProvenanceRegistryList;

    /**
     * @dev state storage for the Provenance registry
     */
    /* solium-disable-next-line */
    DIDRegistryLibrary.ProvenanceRegistryList internal provenanceRegisterList;

    // W3C Provenance Methods
    enum ProvenanceMethod {
        ENTITY,
        ACTIVITY,
        WAS_GENERATED_BY,
        USED,
        WAS_INFORMED_BY,
        WAS_STARTED_BY,
        WAS_ENDED_BY,
        WAS_INVALIDATED_BY,
        WAS_DERIVED_FROM,
        AGENT,
        WAS_ATTRIBUTED_TO,
        WAS_ASSOCIATED_WITH,
        ACTED_ON_BEHALF
    }

    bytes32 NULL_B32;
    address NULL_ADDRESS;
    uint NULL_INT;
    bytes NULL_BYTES;
    bytes[] EMPTY_LIST;

    //////////////////////////////////////////////////////////////
    ////////  MODIFIERS   ////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    modifier onlyDIDOwner(bytes32 _did)
    {
        require(
            msg.sender == didRegisterList.didRegisters[_did].owner,
            'Invalid DID owner can perform this operation.'
        );
        _;
    }

    modifier onlyOwnerProviderOrDelegated(bytes32 _did)
    {
        require(
            msg.sender == didRegisterList.didRegisters[_did].owner ||
            isProvenanceDelegate(_did, msg.sender) ||
            isDIDProvider(_did, msg.sender),
            'Invalid DID Owner, Provider or Delegate can perform this operation.'
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
    * Provenance Events
    */
    event ProvenanceAttributeRegistered(
        bytes32 indexed provId,
        bytes32 indexed _did,
        address indexed _agentId,
        bytes32 _activityId,
        bytes32 _relatedDid,
        address _agentInvolvedId,
        ProvenanceMethod _method,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event WasGeneratedBy(
        bytes32 indexed _did,
        address indexed _agentId,
        bytes32 indexed _activityId,
        bytes32 provId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event Used(
        bytes32 indexed _did,
        address indexed _agentId,
        bytes32 indexed _activityId,
        bytes32 provId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event WasDerivedFrom(
        bytes32 indexed _newEntityDid,
        bytes32 indexed _usedEntityDid,
        address indexed _agentId,
        bytes32 _activityId,
        bytes32 provId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event WasAssociatedWith(
        bytes32 indexed _entityDid,
        address indexed _agentId,
        bytes32 indexed _activityId,
        bytes32 provId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event ActedOnBehalf(
        bytes32 indexed _entityDid,
        address indexed _delegateAgentId,
        address indexed _responsibleAgentId,
        bytes32 _activityId,
        bytes32 provId,
        string _attributes,
        uint256 _blockNumberUpdated
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
        NULL_B32 = '';
        NULL_ADDRESS = address(0x0);
        NULL_INT = 0;
        NULL_BYTES = new bytes(0);
        EMPTY_LIST = new bytes[](0);
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
     * @return the size of the registry after the register action.
     */
    function registerAttribute(
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _url
    )
    public
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
     * @return the size of the registry after the register action.
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


    /**
     * @notice Implements the W3C PROV Generation action
     *
     * @param _provId unique identifier referring to the provenance entry     
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _attributes refers to the provenance attributes
     * @return the number of the new provenance size
     */
    function wasGeneratedBy(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    onlyDIDOwner(_did)
    onlyValidAttributes(_attributes)
    returns (bool)
    {

        provenanceRegisterList.createProvenanceEvent(
            _provId,
            _did,
            NULL_B32,
            _agentId,
            _activityId,
            NULL_ADDRESS,
            uint8(ProvenanceMethod.WAS_GENERATED_BY),
            msg.sender,
            NULL_BYTES // No signatures between parties needed 
        );

        /* emitting _attributes here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _provId,
            _did,
            provenanceRegisterList.provenanceRegistry[_did].createdBy,
            _activityId,
            NULL_B32,
            NULL_ADDRESS,
            ProvenanceMethod.WAS_GENERATED_BY,
            _attributes,
            block.number
        );

        emit WasGeneratedBy(
            _did,
            provenanceRegisterList.provenanceRegistry[_did].createdBy,
            _activityId,
            _provId,
            _attributes,
            block.number
        );

        return true;
    }


    /**
     * @notice Implements the W3C PROV Usage action
     *
     * @param _provId unique identifier referring to the provenance entry     
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _signatureUsing refers to the digital signature provided by the agent using the _did     
     * @param _attributes refers to the provenance attributes
     * @return true if the action was properly registered
    */
    function used(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        bytes memory _signatureUsing,    
        string memory _attributes
    )
    public
    onlyOwnerProviderOrDelegated(_did)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {
        
//        require(
//            provenanceSignatureIsCorrect(_agentId, _provId, _signatureUsing),
//            'The agent signature is not valid');
        
        provenanceRegisterList.createProvenanceEvent(
            _provId,
            _did,
            NULL_B32,
            _agentId,
            _activityId,
            NULL_ADDRESS,
            uint8(ProvenanceMethod.USED),
            msg.sender,
            _signatureUsing
        );

        /* emitting _attributes here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _provId,
            _did,
            _agentId,
            _activityId,
            NULL_B32,
            NULL_ADDRESS,
            ProvenanceMethod.USED,
            _attributes,
            block.number
        );

        emit Used(
            _did,
            _agentId,
            _activityId,
            _provId,
            _attributes,
            block.number
        );

        return true;
    }

    /**
     * @notice Implements the W3C PROV Derivation action
     *
     * @param _provId unique identifier referring to the provenance entry     
     * @param _newEntityDid refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _usedEntityDid refers to decentralized identifier (a bytes32 length ID) of the entity used to derive the new did
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _attributes refers to the provenance attributes
     * @return true if the action was properly registered
     */
    function wasDerivedFrom(
        bytes32 _provId,
        bytes32 _newEntityDid,
        bytes32 _usedEntityDid,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    onlyOwnerProviderOrDelegated(_usedEntityDid)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {

        provenanceRegisterList.createProvenanceEvent(
            _provId,
            _newEntityDid,
            _usedEntityDid,
            _agentId,
            _activityId,
            NULL_ADDRESS,
            uint8(ProvenanceMethod.WAS_DERIVED_FROM),
            msg.sender,
            NULL_BYTES // No signatures between parties needed 
        );

        /* emitting _attributes here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _provId,
            _newEntityDid,
            _agentId,
            _activityId,
            _usedEntityDid,
            NULL_ADDRESS,
            ProvenanceMethod.WAS_DERIVED_FROM,
            _attributes,
            block.number
        );

        emit WasDerivedFrom(
            _newEntityDid,
            _usedEntityDid,
            _agentId,
            _activityId,
            _provId,
            _attributes,
            block.number
        );

        return true;
    }

    /**
     * @notice Implements the W3C PROV Association action
     *
     * @param _provId unique identifier referring to the provenance entry     
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _attributes referes to the provenance attributes
     * @return true if the action was properly registered
    */
    function wasAssociatedWith(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    onlyOwnerProviderOrDelegated(_did)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {

        provenanceRegisterList.createProvenanceEvent(
            _provId,
            _did,
            NULL_B32,
            _agentId,
            _activityId,
            NULL_ADDRESS,
            uint8(ProvenanceMethod.WAS_ASSOCIATED_WITH),
            msg.sender,
            NULL_BYTES // No signatures between parties needed 
        );

        /* emitting _attributes here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _provId,
            _did,
            _agentId,
            _activityId,
            NULL_B32,
            NULL_ADDRESS,
            ProvenanceMethod.WAS_ASSOCIATED_WITH,
            _attributes,
            block.number
        );

        emit WasAssociatedWith(
            _did,
            _agentId,
            _activityId,
            _provId,
            _attributes,
            block.number
        );

        return true;
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
     * @return true if the action was properly registered
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
    onlyOwnerProviderOrDelegated(_did)
    onlyValidAttributes(_attributes)
    returns (bool success)
    {

        require(
            provenanceSignatureIsCorrect(_delegateAgentId, _provId, _signatureDelegate),
            'The delegate signature is not valid');

        provenanceRegisterList.createProvenanceEvent(
            _provId,
            _did,
            NULL_B32,
            _delegateAgentId,
            _activityId,
            _responsibleAgentId,
            uint8(ProvenanceMethod.ACTED_ON_BEHALF),
            msg.sender,
            _signatureDelegate
        );

        addDIDProvenanceDelegate(_did, _delegateAgentId);

        /* emitting _attributes here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _provId,
            _did,
            _delegateAgentId,
            _activityId,
            NULL_B32,
            _responsibleAgentId,
            ProvenanceMethod.ACTED_ON_BEHALF,
            _attributes,
            block.number
        );

        emit ActedOnBehalf(
            _did,
            _delegateAgentId,
            _responsibleAgentId,
            _activityId,
            _provId,
            _attributes,
            block.number
        );

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
        string memory url,
        address lastUpdatedBy,
        uint256 blockNumberUpdated,
        address[] memory providers
    )
    {
        owner = didRegisterList.didRegisters[_did].owner;
        lastChecksum = didRegisterList.didRegisters[_did].lastChecksum;
        url = didRegisterList.didRegisters[_did].url;
        lastUpdatedBy = didRegisterList.didRegisters[_did].lastUpdatedBy;
        blockNumberUpdated = didRegisterList
            .didRegisters[_did].blockNumberUpdated;
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


    //// PROVENANCE SUPPORT METHODS

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
     * @return the address of the Provenance owner.
     */
    function getProvenanceOwner(bytes32 _did)
    public
    view
    returns (address provenanceOwner)
    {
        return provenanceRegisterList.provenanceRegistry[_did].createdBy;
    }

    /**
    * @param _agentId The address of the agent
    * @param _hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    * @param _signature Signatures provided by the agent
    * @return true if the signature correspond to the agent address        
    */
    function provenanceSignatureIsCorrect(
        address _agentId,
        bytes32 _hash,
        bytes memory _signature
    )
    public
    pure
    returns(bool)
    {
        return ECDSA.recover(_hash, _signature) == _agentId;
    }


}
