pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './AgreementStoreLibrary.sol';
import '../conditions/ConditionStoreManager.sol';
import '../registry/DIDRegistry.sol';
import '../templates/TemplateStoreManager.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Agreement Store Manager
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Agreement Store.
 *      TODO: link to OEP
 *
 *      The agreement store generates conditions for an agreement template.
 *      Agreement templates must to be approved in the Template Store
 *      Each agreement is linked to the DID of an asset.
 */
contract AgreementStoreManager is Ownable {

    /**
     * @dev The Agreement Store Library takes care of the basic storage functions
     */
    using AgreementStoreLibrary for AgreementStoreLibrary.AgreementList;

    /**
     * @dev state storage for the agreements
     */
    AgreementStoreLibrary.AgreementList internal agreementList;

    ConditionStoreManager internal conditionStoreManager;
    TemplateStoreManager internal templateStoreManager;
    DIDRegistry internal didRegistry;

    using AgreementStoreLibrary for AgreementStoreLibrary.AgreementActors;
    AgreementStoreLibrary.AgreementActors internal agreementActors;

    // this meant as template ID resolver to avoid memory layout corruption
    mapping (address => bytes32) templateIdAddressToBytes32;

    using AgreementStoreLibrary for AgreementStoreLibrary.AgreementActorsList;
    AgreementStoreLibrary.AgreementActorsList internal agreementActorsList;

    event AgreementCreated(
        bytes32 indexed agreementId,
        bytes32 indexed did,
        address indexed createdBy,
        uint256 createdAt
    );

    event AgreementActorAdded(
        bytes32 indexed agreementId,
        address indexed actor,
        bytes32 actorType
    );

    /**
     * @dev initialize AgreementStoreManager Initializer
     *      Initializes Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract
     * @param _conditionStoreManagerAddress is the address of the connected condition store
     * @param _templateStoreManagerAddress is the address of the connected template store
     * @param _didRegistryAddress is the address of the connected DID Registry
     */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _templateStoreManagerAddress,
        address _didRegistryAddress
    )
        public
        initializer
    {
        require(
            _owner != address(0) &&
            _conditionStoreManagerAddress != address(0) &&
            _templateStoreManagerAddress != address(0) &&
            _didRegistryAddress != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        templateStoreManager = TemplateStoreManager(
            _templateStoreManagerAddress
        );
        didRegistry = DIDRegistry(
            _didRegistryAddress
        );
    }

    /**
     * @dev THIS METHOD HAS BEEN DEPRECATED PLEASE DON'T USE IT.
     *      WE KEEP THIS METHOD INTERFACE TO AVOID ANY CONTRACT 
     *      UPGRADEABILITY ISSUES IN THE FUTURE.
     *      THE NEW METHOD DON'T ACCEPT CONDITIONS, INSTEAD IT USES 
     *      TEMPLATE ID. FOR MORE INFORMATION PLEASE REFER TO THE BELOW LINK
     *      https://github.com/oceanprotocol/keeper-contracts/pull/623
     */
    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        address[] memory _conditionTypes,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts
    )
        public
        returns (uint size)
    {
        require(
            templateStoreManager.isTemplateApproved(msg.sender) == true,
            'Template not Approved'
        );
        require(
            didRegistry.getBlockNumberUpdated(_did) > 0,
            'DID not registered'
        );
        require(
            _conditionIds.length == _conditionTypes.length &&
            _timeLocks.length == _conditionTypes.length &&
            _timeOuts.length == _conditionTypes.length,
            'Arguments have wrong length'
        );

        // create the conditions in condition store. Fail if conditionId already exists.
        for (uint256 i = 0; i < _conditionTypes.length; i++) {
            conditionStoreManager.createCondition(
                _conditionIds[i],
                _conditionTypes[i],
                _timeLocks[i],
                _timeOuts[i]
            );
        }
        agreementList.create(
            _id,
            _did,
            msg.sender,
            _conditionIds
        );

        emit AgreementCreated(
            _id,
            _did,
            msg.sender,
            block.number
        );
        return getAgreementListSize();
    }

    /**
     * @dev Create a new agreement.
     *      The agreement will create conditions of conditionType with conditionId.
     *      Only "approved" templates can access this function.
     * @param _id is the ID of the new agreement. Must be unique.
     * @param _did is the bytes32 DID of the asset. The DID must be registered beforehand.
     * @param _templateId template ID.
     * @param _conditionIds is a list of bytes32 content-addressed Condition IDs
     * @param _timeLocks is a list of uint time lock values associated to each Condition
     * @param _timeOuts is a list of uint time out values associated to each Condition
     * @param _actors array includes actor address such as consumer, provider, publisher, or verifier, ect.
     * For each template, the actors array order should follow the same order in templateStoreManager 
     * actor types definition.
     * @return the size of the agreement list after the create action.
     */
    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32 _templateId,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts,
        address[] memory _actors
    )
        public
        returns (uint size)
    {
        require(
            templateStoreManager.isTemplateIdApproved(_templateId) == true,
            'Template not Approved'
        );
        require(
            didRegistry.getBlockNumberUpdated(_did) > 0,
            'DID not registered'
        );
        address[] memory _conditionTypes;
        bytes32[] memory _actorTypes;


        (,,,,_conditionTypes, _actorTypes) = templateStoreManager.getTemplate(
            _templateId
        );

        require(
            _conditionIds.length == _conditionTypes.length &&
            _timeLocks.length == _conditionTypes.length &&
            _timeOuts.length == _conditionTypes.length &&
            _actors.length == _actorTypes.length,
            'Arguments have wrong length'
        );

        // create the conditions in condition store. Fail if conditionId already exists.
        for (uint256 i = 0; i < _conditionTypes.length; i++) {
            conditionStoreManager.createCondition(
                _conditionIds[i],
                _conditionTypes[i],
                _timeLocks[i],
                _timeOuts[i]
            );
        }

        address templateAddress = convertBytes32ToAddress(_templateId);
        templateIdAddressToBytes32[templateAddress] = _templateId;
        agreementList.create(
            _id,
            _did,
            templateAddress,
            _conditionIds
        );

        // set agreement actors
        for(uint256 i = 0; i < _actors.length; i++)
        {
            agreementActors.setActorType(
                _id,
                _actors[i],
                _actorTypes[i]
            );
            emit AgreementActorAdded(
                _id,
                _actors[i],
                _actorTypes[i]
            );
        }
        agreementActorsList.setActors(
            _id,
            _actors
        );

        emit AgreementCreated(
            _id,
            _did,
            msg.sender,
            block.number
        );
        return getAgreementListSize();
    }

    /**
     * @dev Get agreement with _id.
     *      The agreement will create conditions of conditionType with conditionId.
     *      Only "approved" templates can access this function.
     * @param _id is the ID of the agreement.
     * @return the agreement attributes.
     */
    function getAgreement(bytes32 _id)
        external
        view
        returns (
            bytes32 did,
            address didOwner,
            bytes32 templateId,
            bytes32[] memory conditionIds,
            address lastUpdatedBy,
            uint256 blockNumberUpdated
        )
    {
        address _templateAddress = agreementList.agreements[_id].templateId;
        did = agreementList.agreements[_id].did;
        didOwner = didRegistry.getDIDOwner(did);
        templateId = templateIdAddressToBytes32[_templateAddress];
        conditionIds = agreementList.agreements[_id].conditionIds;
        lastUpdatedBy = agreementList.agreements[_id].lastUpdatedBy;
        blockNumberUpdated = agreementList.agreements[_id].blockNumberUpdated;
    }

    /**
     * @dev getAgreementActors for a given agreement Id retrieves actors addresses list 
     * @param _id is the ID of the agreement.
     * @return agreement actors list of addresses
     */
    function getAgreementActors(
        bytes32 _id
    )
        external
        view
        returns(
            address[] memory actors
        )
    {
        actors = agreementActorsList.getActors(_id);
    }

    /**
     * @dev getActorType for a given agreement Id, and actor address retrieves actors type  
     * @param _id is the ID of the agreement
     * @param _actor agreement actor address
     * @return agreement actor type
     */
    function getActorType(
        bytes32 _id,
        address _actor
    )
        external
        view
        returns(bytes32 actorType)
    {
        actorType = agreementActors.getActorType(_id, _actor);
    }
    
    /**
     * @dev get the DID owner for this agreement with _id.
     * @param _id is the ID of the agreement.
     * @return the DID owner associated with agreement.did from the DID registry.
     */
    function getAgreementDIDOwner(bytes32 _id)
        external
        view
        returns (address didOwner)
    {
        bytes32 did = agreementList.agreements[_id].did;
        didOwner = didRegistry.getDIDOwner(did);
    }

    /**
     * @dev check the DID owner for this agreement with _id.
     * @param _id is the ID of the agreement.
     * @param _owner is the DID owner
     * @return the DID owner associated with agreement.did from the DID registry.
     */
    function isAgreementDIDOwner(bytes32 _id, address _owner)
        external
        view
        returns (bool)
    {
        bytes32 did = agreementList.agreements[_id].did;
        return (_owner == didRegistry.getDIDOwner(did));
    }

    /**
     * @dev isAgreementDIDProvider for a given agreement Id 
     * and address check whether a DID provider is associated with this agreement
     * @param _id is the ID of the agreement
     * @param _provider is the DID provider
     * @return true if a DID provider is associated with the agreement ID
     */
    function isAgreementDIDProvider(bytes32 _id, address _provider)
        external
        view
        returns(bool)
    {
        bytes32 did = agreementList.agreements[_id].did;
        return didRegistry.isDIDProvider(did, _provider);
    }

    /**
     * @return the length of the agreement list.
     */
    function getAgreementListSize()
        public
        view
        returns (uint size)
    {
        size = agreementList.agreementIds.length;
    }

    /**
     * @param _did is the bytes32 DID of the asset.
     * @return the agreement IDs for a given DID
     */
    function getAgreementIdsForDID(bytes32 _did)
        public
        view
        returns (bytes32[] memory)
    {
        return agreementList.didToAgreementIds[_did];
    }

    /**
     * @param _templateId is the address of the agreement template.
     * @return the agreement IDs for a given DID
     */
    function getAgreementIdsForTemplateId(bytes32 _templateId)
        public
        view
        returns (bytes32[] memory)
    {
        address templateId = convertBytes32ToAddress(_templateId);
        return agreementList.templateIdToAgreementIds[templateId];
    }

    /**
     * @dev getDIDRegistryAddress utility function 
     * used by other contracts or any EOA.
     * @return the DIDRegistry address
     */
    function getDIDRegistryAddress()
        public
        view
        returns(address)
    {
        return address(didRegistry);
    }

    /**
     * @dev convertBytes32ToAddress 
     * @param input a 32 bytes input
     * @return bytes 20 output
     */
    function convertBytes32ToAddress(
        bytes32 input
    )
        private
        pure
        returns(address)
    {
        return address(ripemd160(abi.encodePacked(input)));
    }
}
