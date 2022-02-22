pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


/**
 * @title Agreement Store Library
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of the Agreement Store Library.
 *      For more information: https://github.com/oceanprotocol/OEPs/issues/125    
 *      TODO: update the OEP link 
 *      The agreement store library holds the business logic
 *      in which manages the life cycle of SEA agreement, each 
 *      agreement is linked to the DID of an asset, template, and
 *      condition IDs.
 */
library AgreementStoreLibrary {

    struct Agreement {
        // bytes32 did;
        address templateId;
        // bytes32[] conditionIds___;
        // address lastUpdatedBy;
        // uint256 blockNumberUpdated;
        mapping (uint => bytes32) conditionIds;
    }

    struct AgreementList {
        mapping(bytes32 => Agreement) agreements;
        mapping(bytes32 => bytes32[]) didToAgreementIds;
        mapping(address => bytes32[]) templateIdToAgreementIds;
        // bytes32[] agreementIds;
    }

    /**
     * @dev create new agreement
     *      checks whether the agreement Id exists, creates new agreement 
     *      instance, including the template, conditions and DID.
     * @param _self is AgreementList storage pointer
     * @param _id agreement identifier
     * @param _did asset decentralized identifier
     * @param _templateId template identifier
     * @param _conditionIds array of condition identifiers
     */
    function create(
        AgreementList storage _self,
        bytes32 _id,
        bytes32 _did,
        address _templateId,
        bytes32[] memory _conditionIds
    )
        internal
    {
        require(
            _self.agreements[_id].templateId == address(0),
            'Id already exists'
        );

        _self.agreements[_id].templateId = _templateId;
        /*
        for (uint i = 0; i < _conditionIds.length; i++) {
            _self.agreements[_id].conditionIds[i] = _conditionIds[i];
        }*/
         /*Agreement({
            // did: _did,
            templateId: _templateId,
            conditionIds: _conditionIds
            // lastUpdatedBy: msg.sender,
            // blockNumberUpdated: block.number
        });*/

        // _self.agreementIds.push(_id);
        // _self.didToAgreementIds[_did].push(_id);
        // _self.templateIdToAgreementIds[_templateId].push(_id);
        // return _self.agreementIds.length;
    }
}
