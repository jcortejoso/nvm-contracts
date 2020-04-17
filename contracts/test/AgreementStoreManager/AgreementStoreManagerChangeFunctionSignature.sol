pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../agreements/AgreementStoreManager.sol';


contract AgreementStoreManagerChangeFunctionSignature is
    AgreementStoreManager
{
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
            msg.sender == _actors[0],
            'Invalid sender address, should fail in function signature check'
        );
        require(
            templateStoreManager.isTemplateIdApproved(_templateId) == true,
            'Template not Approved'
        );
        address[] memory _conditionTypes;
        
        (,,,,_conditionTypes,) = templateStoreManager.getTemplate(_templateId);
        
        require(
            _conditionIds.length == _conditionTypes.length &&
            _timeLocks.length == _conditionTypes.length &&
            _timeOuts.length == _conditionTypes.length,
            'Arguments have wrong length'
        );

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

        return getAgreementListSize();
    }
}
