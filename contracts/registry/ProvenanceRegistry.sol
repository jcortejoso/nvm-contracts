pragma solidity 0.5.6;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './ProvenanceRegistryLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Provenance Registry
 * @author Keyko
 *
 * @dev Implementation of the Provenance Registry following the W3C PROV Specifications

 */
contract ProvenanceRegistry is Ownable {

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


    /**
     * @dev The ProvenanceRegistry Library takes care of the basic storage functions.
     */
    using ProvenanceRegistryLibrary for ProvenanceRegistryLibrary.ProvenanceRegisterList;

    /**
     * @dev state storage for the Provenance registry
     */
    ProvenanceRegistryLibrary.ProvenanceRegisterList internal provenanceRegisterList;


    modifier onlyProvenanceOwnerOrDelegated(bytes32 _did)
    {
        require(
            msg.sender == provenanceRegisterList.provenanceRegisters[_did].owner ||
            isProvenanceDelegate(_did, msg.sender),
            'Invalid Provenance owner can perform this operation.'
        );
        _;
    }

    modifier onlyProvenanceOwner(bytes32 _did)
    {
        require(
            msg.sender == provenanceRegisterList.provenanceRegisters[_did].owner,
            'Invalid Provenance owner can perform this operation.'
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

    /**
     * @dev This implementation does not store _attributes on-chain,
     *      but emits ProvenanceAttributeRegistered events to store it in the event log.
     */
    event ProvenanceAttributeRegistered(
        bytes32 indexed _did,
        address indexed _agentId,
        bytes32 indexed _activityId,
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
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event Used(
        bytes32 indexed _did,
        address indexed _agentId,
        bytes32 indexed _activityId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event WasDerivedFrom(
        bytes32 indexed _newEntityDid,
        bytes32 indexed _usedEntityDid,
        address indexed _agentId,
        bytes32 _activityId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event WasAssociatedWith(
        address indexed _agentId,
        bytes32 indexed _activityId,
        bytes32 indexed _entityDid,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    event ActedOnBehalf(
        address indexed _delegateAgentId,
        address indexed _responsibleAgentId,
        bytes32 indexed _entityDid,
        bytes32 _activityId,
        string _attributes,
        uint256 _blockNumberUpdated
    );

    /**
     * @dev ProvenanceRegistry Initializer
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
     * @notice Implements the W3C PROV Generation action
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _delegates refers to the array of delegates able to interact with the provenance record
     * @param _attributes referes to the provenance attributes
     * @return the number of the new provenance size
     */
    function wasGeneratedBy(
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        address[] memory _delegates,
        string memory _attributes
    )
        public
        onlyProvenanceOwner(_did)
        onlyValidAttributes(_attributes)
        returns (uint size)
    {

        uint updatedSize = provenanceRegisterList
            .create(_did, _agentId, msg.sender, _activityId);

        // push delegates to storage
        for (uint256 i = 0; i < _delegates.length; i++) {
            provenanceRegisterList.addDelegate(
                _did,
                _delegates[i]
            );

        }

        /* emitting _value here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _did,
            provenanceRegisterList.provenanceRegisters[_did].owner,
            _activityId,
            _did,
            msg.sender,
            ProvenanceMethod.WAS_GENERATED_BY,
            _attributes,
            block.number
        );

        emit WasGeneratedBy(
            _did,
            provenanceRegisterList.provenanceRegisters[_did].owner,
            _activityId,
            _attributes,
            block.number
        );

        return updatedSize;

    }

    /**
     * @notice Implements the W3C PROV Usage action
     *
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _attributes referes to the provenance attributes
     * @return true if the action was properly registered
    */
    function used(
        address _agentId,
        bytes32 _activityId,
        bytes32 _did,
        string memory _attributes
    )
        public
        onlyProvenanceOwnerOrDelegated(_did)
        onlyValidAttributes(_attributes)
        returns (bool success)
    {

      emit ProvenanceAttributeRegistered(
          _did,
          _agentId,
          _activityId,
          _did,
          msg.sender,
          ProvenanceMethod.USED,
          _attributes,
          block.number
      );

      emit Used(
          _did,
          _agentId,
          _activityId,
          _attributes,
          block.number
      );

      return true;
    }


    /**
     * @notice Implements the W3C PROV Derivation action
     *
     * @param _newEntityDid refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _usedEntityDid refers to decentralized identifier (a bytes32 length ID) of the entity used to derive the new did
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _delegates refers to the array of delegates able to interact with the provenance record
     * @param _attributes referes to the provenance attributes
     * @return true if the action was properly registered
     */
    function wasDerivedFrom(
        bytes32 _newEntityDid,
        bytes32 _usedEntityDid,
        address _agentId,
        bytes32 _activityId,
        address[] memory _delegates,
        string memory _attributes
    )
        public
        onlyProvenanceOwnerOrDelegated(_usedEntityDid)
        onlyValidAttributes(_attributes)
        returns (bool success)
    {
      emit ProvenanceAttributeRegistered(
          _usedEntityDid,
          _agentId,
          _activityId,
          _newEntityDid,
          msg.sender,
          ProvenanceMethod.WAS_DERIVED_FROM,
          _attributes,
          block.number
      );

      emit WasDerivedFrom(
          _newEntityDid,
          _usedEntityDid,
          _agentId,
          _activityId,
          _attributes,
          block.number
      );

      return true;
    }


    /**
     * @notice Implements the W3C PROV Association action
     *
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _entityDid refers to decentralized identifier (a bytes32 length ID) of the entity
     * @param _signatures refers to the digital signatures provided during the process by the parties
     * @param _attributes referes to the provenance attributes
     * @return true if the action was properly registered
    */
    function wasAssociatedWith(
        address _agentId,
        bytes32 _activityId,
        bytes32 _entityDid,
        bytes32[] memory _signatures,
        string memory _attributes
    )
        public
        onlyProvenanceOwnerOrDelegated(_entityDid)
        onlyValidAttributes(_attributes)
        returns (bool success)
    {
      emit ProvenanceAttributeRegistered(
          _entityDid,
          msg.sender,
          _activityId,
          _entityDid,
          _agentId,
          ProvenanceMethod.WAS_ASSOCIATED_WITH,
          _attributes,
          block.number
      );

      emit WasAssociatedWith(
          _agentId,
          _activityId,
          _entityDid,
          _attributes,
          block.number
      );

      return true;
    }

    /**
     * @notice Implements the W3C PROV Delegation action
     *
     * @param _delegateAgentId refers to address acting on behalf of the provenance record
     * @param _responsibleAgentId refers to address responsible of the provenance record
     * @param _entityDid refers to decentralized identifier (a bytes32 length ID) of the entity
     * @param _activityId refers to activity
     * @param _signatures refers to the digital signature provided by the parties involved
     * @param _attributes referes to the provenance attributes
     * @return true if the action was properly registered
     */
    function actedOnBehalf(
        address _delegateAgentId,
        address _responsibleAgentId,
        bytes32 _entityDid,
        bytes32 _activityId,
        bytes32[] memory _signatures,
        string memory _attributes
    )
        public
        onlyProvenanceOwnerOrDelegated(_entityDid)
        onlyValidAttributes(_attributes)
        returns (bool success)
    {

      emit ProvenanceAttributeRegistered(
          _entityDid,
          _responsibleAgentId,
          _activityId,
          _entityDid,
          _delegateAgentId,
          ProvenanceMethod.ACTED_ON_BEHALF,
          _attributes,
          block.number
      );

      emit ActedOnBehalf(
          _delegateAgentId,
          msg.sender,
          _entityDid,
          _activityId,
          _attributes,
          block.number
      );

      return true;
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
        return provenanceRegisterList.isDelegate(_did, _delegate);
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
        return provenanceRegisterList.provenanceRegisters[_did].blockNumberUpdated;
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
        return provenanceRegisterList.provenanceRegisters[_did].owner;
    }

    /**
     * @return the length of the Provenance registry.
     */
    function getProvenanceRegistrySize()
        public
        view
        returns (uint size)
    {
        return provenanceRegisterList.provenanceRegisterIds.length;
    }

    /**
     * @return the length of the DID registry.
     */
    function getProvenanceRegisterIds()
        public
        view
        returns (bytes32[] memory)
    {
        return provenanceRegisterList.provenanceRegisterIds;
    }


}
