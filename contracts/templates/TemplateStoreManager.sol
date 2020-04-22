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

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList internal templateList;

    modifier onlyOwnerOrTemplateOwner(address _id){
        require(
            isOwner() ||
            templateList.templates[_id].owner == msg.sender,
            'Invalid UpdateRole'
        );
        _;
    }

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

    /**
     * @notice proposeTemplate proposes a new template
     * @param _id unique template identifier which is basically
     *        the template contract address
     */
    function proposeTemplate(address _id)
        external
        returns (uint size)
    {
        return templateList.propose(_id);
    }

    /**
     * @notice approveTemplate approves a template
     * @param _id unique template identifier which is basically
     *        the template contract address. Only template store
     *        manager owner (i.e OPNF) can approve this template.
     */
    function approveTemplate(address _id)
        external
        onlyOwner
    {
        return templateList.approve(_id);
    }

    /**
     * @notice revokeTemplate revoke a template
     * @param _id unique template identifier which is basically
     *        the template contract address. Only template store
     *        manager owner (i.e OPNF) or template owner
     *        can revoke this template.
     */
    function revokeTemplate(address _id)
        external
        onlyOwnerOrTemplateOwner(_id)
    {
        return templateList.revoke(_id);
    }

    /**
     * @notice getTemplate get more information about a template
     * @param _id unique template identifier which is basically
     *        the template contract address.
     * @return template status, template owner, last updated by and
     *        last updated at.
     */
    function getTemplate(address _id)
        external
        view
        returns (
            TemplateStoreLibrary.TemplateState state,
            address owner,
            address lastUpdatedBy,
            uint blockNumberUpdated
        )
    {
        state = templateList.templates[_id].state;
        owner = templateList.templates[_id].owner;
        lastUpdatedBy = templateList.templates[_id].lastUpdatedBy;
        blockNumberUpdated = templateList.templates[_id].blockNumberUpdated;
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
     * @notice isTemplateApproved check whether the template is approved
     * @param _id unique template identifier which is basically
     *        the template contract address.
     * @return true if the template is approved
     */
    function isTemplateApproved(address _id) external view returns (bool) {
        return templateList.templates[_id].state ==
            TemplateStoreLibrary.TemplateState.Approved;
    }
}
