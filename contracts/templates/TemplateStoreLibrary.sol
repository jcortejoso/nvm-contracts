pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../interfaces/ICondition.sol';

/**
 * @title Template Store Library
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Template Store Library.
 *      
 *      Templates are blueprints for modular SEAs. When 
 *      creating an Agreement, a templateId defines the condition 
 *      and reward types that are instantiated in the ConditionStore.
 *      For more information: https://github.com/oceanprotocol/OEPs/issues/132
 *      TODO: update the OEP link 
 */
library TemplateStoreLibrary {

    enum TemplateState {
        Uninitialized,
        Proposed,
        Approved,
        Revoked
    }

    // deprecated template definition
    struct TemplateDeprecated {
        TemplateState state;
        address owner;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
    }

    // deprecated template list definition 
    struct TemplateListDeprecated {
        mapping(address => TemplateDeprecated) templates;
        address[] templateIds;
    }


    struct Template {
        TemplateState state;
        address owner;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
        address[] conditionTypes;
        bytes32[] actorTypes;
    }
    
    struct TemplateList {
        mapping(bytes32 => Template) templates;
        bytes32[] templateIds;
    }
    
    enum ActorTypeState {
        Uninitialized,
        Registered,
        Deregistered
    }
    
    struct ActorType {
        string value;
        ActorTypeState state;
    }
    
    struct TemplateActorTypeList {
        // actor id (bytes32) = keccak256(string)
        mapping(bytes32 => ActorType) actorTypes;
        bytes32[] actorTypeIds;
    }
    
   /**
    * @notice propose new template
    * @param _self is the TemplateList storage pointer
    * @param _id proposed template contract address 
    * @return size which is the index of the proposed template
    */
    function propose(
        TemplateList storage _self,
        bytes32 _id,
        address[] memory _conditionTypes,
        bytes32[] memory _actorTypeIds
    )
        internal
        returns (uint size)
    {
        require(
            _self.templates[_id].state == TemplateState.Uninitialized,
            'Id already exists'
        );
        
        require(
            isValidTemplateConditionTypes(_id, _conditionTypes),
            'Invalid proposed condition types'
        );
        
        _self.templates[_id] = Template({
            state: TemplateState.Proposed,
            owner: msg.sender,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            conditionTypes: _conditionTypes,
            actorTypes: _actorTypeIds
        });
        
        _self.templateIds.push(_id);

        return _self.templateIds.length;
    }

   /**
    * @notice approve new template
    * @param _self is the TemplateList storage pointer
    * @param _id proposed template contract address
    */
    function approve(
        TemplateList storage _self,
        bytes32 _id
    )
        internal
    {
        require(
            _self.templates[_id].state == TemplateState.Proposed,
            'Template not Proposed'
        );

        _self.templates[_id].state = TemplateState.Approved;
        _self.templates[_id].lastUpdatedBy = msg.sender;
        _self.templates[_id].blockNumberUpdated = block.number;
    }

   /**
    * @notice revoke new template
    * @param _self is the TemplateList storage pointer
    * @param _id approved template contract address
    */
    function revoke(
        TemplateList storage _self,
        bytes32 _id
    )
        internal
    {
        require(
            _self.templates[_id].state == TemplateState.Approved,
            'Template not Approved'
        );

        _self.templates[_id].state = TemplateState.Revoked;
        _self.templates[_id].lastUpdatedBy = msg.sender;
        _self.templates[_id].blockNumberUpdated = block.number;
    }
    
    function registerActorType(
        TemplateActorTypeList storage _self,
        string memory _actorType
    )
        internal
        returns (bytes32)
    {
        bytes32 Id = keccak256(abi.encodePacked(_actorType));
        
        require(
            _self.actorTypes[Id].state != ActorTypeState.Registered,
            'Actor type already exists'
        );

        _self.actorTypes[Id] = ActorType({
            value: _actorType,
            state: ActorTypeState.Registered
        });

        _self.actorTypeIds.push(Id);
        
        return Id;
    }
    
    function deregisterActorType(
        TemplateActorTypeList storage _self,
        bytes32 _Id
    )
        internal
    {
        _self.actorTypes[_Id].state = ActorTypeState.Deregistered;
    }
    
    function getActorTypeId(
        TemplateActorTypeList storage _self,
        string memory _actorType
    )
        internal
        view
        returns(bytes32)
    {
        bytes32 Id = keccak256(abi.encodePacked(_actorType));
        
        require(
            _self.actorTypes[Id].state == ActorTypeState.Registered,
            'Actor type does not exist!'
        );
        return Id;
    }
    
    function isValidTemplateConditionTypes(
        bytes32 _Id,
        address[] memory _conditionTypes
    )
        private
        view
        returns(bool isValidConditionTypes)
    {
        isValidConditionTypes = false;
        for(uint256 i = 0; i < _conditionTypes.length; i++) {
            bytes32 conditionId = keccak256(
                abi.encodePacked(
                    _Id, 
                    _conditionTypes[i], 
                    _Id
                )
            );
            
            ICondition conditionType = ICondition(_conditionTypes[i]);
            
            require(
                conditionId == conditionType.generateId(_Id, _Id),
                'Invalid condition type'
            );
        }
        isValidConditionTypes = true;
    }
}
