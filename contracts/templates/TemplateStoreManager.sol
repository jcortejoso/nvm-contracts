pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './TemplateStoreLibrary.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Template Store Manager
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Template Store Manager.
 *      Templates are blueprints for modular SEAs. When creating an Agreement, 
 *      a templateId defines the condition and reward types that are instantiated 
 *      in the ConditionStore. This contract manages the life cycle 
 *      of the template ( Propose --> Approve --> Revoke ).
 *      For more information please refer to this link:
 *      https://github.com/oceanprotocol/OEPs/issues/132
 *      TODO: link to OEP
 *      
 */
contract TemplateStoreManager is Ownable {

    using TemplateStoreLibrary for 
    TemplateStoreLibrary.TemplateListDeprecated;
    TemplateStoreLibrary.TemplateListDeprecated internal 
    templateListDeprecated; 
    
    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;
    TemplateStoreLibrary.TemplateList internal templateList;

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateActorTypeList;
    TemplateStoreLibrary.TemplateActorTypeList internal templateActorTypeList;
    
    modifier onlyOwnerOrTemplateOwner(bytes32 _id){
        require(
            isOwner() ||
            templateList.templates[_id].owner == msg.sender,
            'Invalid contract owner or template owner'
        );
        _;
    }

    event TemplateProposed(
        bytes32 indexed Id,
        string indexed name,
        address[] conditionTypes,
        bytes32[] actorTypeIds
    );
    
    event TemplateApproved(
        bytes32 indexed Id,
        bool state
    );
    
    event TemplateRevoked(
        bytes32 indexed Id,
        bool state
    );
    
    /**
     * @dev initialize TemplateStoreManager Initializer
     *      Initializes Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract
     */
    function initialize(
        address _owner
    )
        public
        initializer()
    {
        require(
            _owner != address(0),
            'Invalid address'
        );

        Ownable.initialize(_owner);
    }

    function generateId(string memory templateName)
        public
        pure
        returns(bytes32 Id)
    {
        Id = keccak256(abi.encodePacked(templateName));
    }
    
    function proposeTemplate(
        address _id,
        address[] calldata _conditionTypes,
        bytes32[] calldata _actorTypeIds,
        string calldata name
    )
        external
        returns (uint size)
    {
        bytes32 id = keccak256(abi.encodePacked(_id));
        return proposeTemplate(
            id,
            _conditionTypes,
            _actorTypeIds,
            name
        );
    }
    
    
    /**
     * @notice proposeTemplate proposes a new template
     * @param _id unique template identifier which is basically
     *        the template contract address
     */
    function proposeTemplate(
        bytes32 _id,
        address[] memory _conditionTypes,
        bytes32[] memory _actorTypeIds,
        string memory name
    )
        public
        returns (uint size)
    { 
        uint256 currentSize = templateList.templateIds.length;
        uint256 newSize = templateList.propose(
            _id, 
            _conditionTypes, 
            _actorTypeIds
        );
        
        require (
            newSize > currentSize,
            'Unable to propose template'
        );
        
        emit TemplateProposed(
            _id,
            name,
            _conditionTypes,
            _actorTypeIds
        );
        
        return newSize;
    }

    /**
     * @notice approveTemplate approves a template
     * @param _id unique template identifier which is basically
     *        the template contract address. Only template store
     *        manager owner (i.e OPNF) can approve this template.
     */
    function approveTemplate(
        bytes32 _id
    )
        external
        onlyOwner
    {
        templateList.approve(_id);
        require(
            templateList.templates[_id].state == TemplateStoreLibrary.TemplateState.Approved,
            'Unable to approve template'
        );
        
        emit TemplateApproved(
            _id,
            true
        );
    }

    /**
     * @notice revokeTemplate revoke a template
     * @param _id unique template identifier which is basically
     *        the template contract address. Only template store
     *        manager owner (i.e OPNF) or template owner
     *        can revoke this template.
     */
    function revokeTemplate(bytes32 _id)
        external
        onlyOwnerOrTemplateOwner(_id)
    {
        templateList.revoke(_id);
        require(
            templateList.templates[_id].state == TemplateStoreLibrary.TemplateState.Revoked,
            'Unable to revoke template'
        );
        
        emit TemplateRevoked(
            _id,
            true
        );
    }

    function registerTemplateActorType(
        string calldata _actorType
    )
        external
        onlyOwner
        returns (bytes32 actorTypeId)
    {
        actorTypeId = templateActorTypeList.registerActorType(
            _actorType
        );
    }
    
    function deregisterTemplateActorType(
        bytes32 _Id
    )
        external
        onlyOwner
    {
        templateActorTypeList.deregisterActorType(
            _Id
        );
    }
    
    /**
     * @notice getTemplate get more information about a template
     * @param _id unique template identifier which is basically
     *        the template contract address.
     * @return template status, template owner, last updated by and
     *        last updated at.
     */
    function getTemplate(bytes32 _id)
        external
        view
        returns (
            TemplateStoreLibrary.TemplateState state,
            address owner,
            address lastUpdatedBy,
            uint blockNumberUpdated,
            address[] memory conditionTypes,
            bytes32[] memory actorTypes
        )
    {
        state = templateList.templates[_id].state;
        owner = templateList.templates[_id].owner;
        lastUpdatedBy = templateList.templates[_id].lastUpdatedBy;
        blockNumberUpdated = templateList.templates[_id].blockNumberUpdated;
        conditionTypes = templateList.templates[_id].conditionTypes;
        actorTypes = templateList.templates[_id].actorTypes;
    }
    
    /**
     * @notice 
     *
     */
    function getTemplateActorTypeIds()
        external
        view
        returns (
            bytes32[] memory actorTypes
        )
    {
        actorTypes = templateActorTypeList.actorTypeIds;
    }
    
    function getTemplateActorTypeId(
        string calldata actorType
    )
        external
        view
        returns(bytes32)
    {
        return templateActorTypeList.getActorTypeId(actorType);
    }
    
    /**
     * @notice 
     *
     */
    function getTemplateActorTypeValue(bytes32 _Id)
        external
        view
        returns (
            string memory actorType
        )
    {
        actorType = templateActorTypeList.actorTypes[_Id].value;
    }
    
    /**
     * @notice 
     *
     */
    function getTemplateActorTypeState(bytes32 _Id)
        external
        view
        returns (
            uint256 state
        )
    {
        state = uint256(templateActorTypeList.actorTypes[_Id].state);
    }

    /**
     * @notice getTemplateListSize number of templates
     * @return number of templates
     */
    function getTemplateListSize()
        external
        view
        returns (uint size)
    {
        return templateList.templateIds.length;
    }

    /**
     * @notice isTemplateIdApproved check whether the template is approved
     * @param _id bytes32 unique template identifier which is basically
     *        the template contract address.
     * @return true if the template is approved
     */
    function isTemplateIdApproved(bytes32 _id) external view returns (bool) {
        return templateList.templates[_id].state ==
            TemplateStoreLibrary.TemplateState.Approved;
    }
    
    /**
     * @notice THIS METHOD HAS BEEN DEPRECATED, PLEASE DON'T USE IT.
     */
    function isTemplateApproved(address _id) external view returns (bool) {
        return templateListDeprecated.templates[_id].state ==
            TemplateStoreLibrary.TemplateState.Approved;
    }
}
