pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './AgreementStoreLibrary.sol';
import '../conditions/ConditionStoreManager.sol';
import '../conditions/LockPaymentCondition.sol';
import '../registry/DIDRegistry.sol';
import '../templates/TemplateStoreManager.sol';

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

interface Template {
    function getConditionTypes() external view returns (address[] memory);
}

/**
 * @title Agreement Store Manager
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of the Agreement Store.
 *
 *      The agreement store generates conditions for an agreement template.
 *      Agreement templates must to be approved in the Template Store
 *      Each agreement is linked to the DID of an asset.
 */
contract AgreementStoreManager is OwnableUpgradeable, AccessControlUpgradeable {

    bytes32 private constant PROXY_ROLE = keccak256('PROXY_ROLE');

    function grantProxyRole(address _address) public onlyOwner {
        grantRole(PROXY_ROLE, _address);
    }

    function revokeProxyRole(address _address) public onlyOwner {
        revokeRole(PROXY_ROLE, _address);
    }

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
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
        
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        templateStoreManager = TemplateStoreManager(
            _templateStoreManagerAddress
        );
        didRegistry = DIDRegistry(
            _didRegistryAddress
        );
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);

    }
    
    /**
     * @dev Create a new agreement.
     *      The agreement will create conditions of conditionType with conditionId.
     *      Only "approved" templates can access this function.
     * @param _id is the ID of the new agreement. Must be unique.
     * @param _did is the bytes32 DID of the asset. The DID must be registered beforehand.
     * @param _conditionTypes is a list of addresses that point to Condition contracts.
     * @param _conditionIds is a list of bytes32 content-addressed Condition IDs
     * @param _timeLocks is a list of uint time lock values associated to each Condition
     * @param _timeOuts is a list of uint time out values associated to each Condition
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

        // same as above
        // return getAgreementListSize();
    }

    function createAgreementAndPay(
        bytes32 _id,
        bytes32 _did,
        address[] memory _conditionTypes,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts,
        address _creator,
        uint _idx,
        address payable _rewardAddress,
        address _tokenAddress,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
        public payable
    {
        require(hasRole(PROXY_ROLE, msg.sender), 'Invalid access role');
        createAgreement(_id, _did, _conditionTypes, _conditionIds, _timeLocks, _timeOuts);
        LockPaymentCondition(_conditionTypes[_idx]).fulfillProxy{value: msg.value}(_creator, _id, _did, _rewardAddress, _tokenAddress, _amounts, _receivers);
    }


    /**
     * @dev Get agreement with _id.
     *      The agreement will create conditions of conditionType with conditionId.
     *      Only "approved" templates can access this function.
     * @param _id is the ID of the agreement.
     * @return did
     * @return didOwner
     * @return templateId
     * @return conditionIds
     * @return lastUpdatedBy
     * @return blockNumberUpdated
     */
    function getAgreement(bytes32 _id)
        external
        view
        returns (
            bytes32 did,
            address didOwner,
            address templateId,
            bytes32[] memory conditionIds,
            address lastUpdatedBy,
            uint256 blockNumberUpdated
        )
    {
        // did = agreementList.agreements[_id].did;
        didOwner = didRegistry.getDIDOwner(did);
        templateId = agreementList.agreements[_id].templateId;
        /*
        address[] memory types = Template(templateId).getConditionTypes();
        conditionIds = new bytes32[](types.length);
        for (uint i = 0; i < types.length; i++) {
            conditionIds = agreementList.agreements[_id].conditionIds[i];
        }*/
        // conditionIds = agreementList.agreements[_id].conditionIds;
        // lastUpdatedBy = agreementList.agreements[_id].lastUpdatedBy;
        // blockNumberUpdated = agreementList.agreements[_id].blockNumberUpdated;
    }

    /**
     * @dev get the DID owner for this agreement with _id.
     * @param _id is the ID of the agreement.
     * @return didOwner the DID owner associated with agreement.did from the DID registry.
    function getAgreementDIDOwner(bytes32 _id)
        external
        view
        returns (address didOwner)
    {
        bytes32 did = agreementList.agreements[_id].did;
        return didRegistry.getDIDOwner(did);
    }
     */

    /**
     * @dev check the DID owner for this agreement with _id.
     * @param _id is the ID of the agreement.
     * @param _owner is the DID owner
     * @return the DID owner associated with agreement.did from the DID registry.
    function isAgreementDIDOwner(bytes32 _id, address _owner)
        external
        view
        returns (bool)
    {
        bytes32 did = agreementList.agreements[_id].did;
        return (_owner == didRegistry.getDIDOwner(did));
    }
     */

    /**
     * @dev isAgreementDIDProvider for a given agreement Id 
     * and address check whether a DID provider is associated with this agreement
     * @param _id is the ID of the agreement
     * @param _provider is the DID provider
     * @return true if a DID provider is associated with the agreement ID
    function isAgreementDIDProvider(bytes32 _id, address _provider)
        external
        view
        returns(bool)
    {
        bytes32 did = agreementList.agreements[_id].did;
        return didRegistry.isDIDProvider(did, _provider);
    }
     */

    /**
     * @return size the length of the agreement list.
    function getAgreementListSize()
        public
        view
        virtual
        returns (uint size)
    {
        return agreementList.agreementIds.length;
    }
     */

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
    function getAgreementIdsForTemplateId(address _templateId)
        public
        view
        returns (bytes32[] memory)
    {
        return agreementList.templateIdToAgreementIds[_templateId];
    }
    
    /**
     * @dev getDIDRegistryAddress utility function 
     * used by other contracts or any EOA.
     * @return the DIDRegistry address
     */
    function getDIDRegistryAddress()
        public
        virtual
        view
        returns(address)
    {
        return address(didRegistry);
    }
}
