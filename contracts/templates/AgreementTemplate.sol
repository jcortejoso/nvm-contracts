pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './TemplateStoreLibrary.sol';
import '../agreements/AgreementStoreManager.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Agreement Template
 * @author Ocean Protocol Team
 *
 * @dev Implementation of Agreement Template
 *
 *      Agreement template is a reference template where it
 *      has the ability to create agreements from whitelisted 
 *      template
 */
contract AgreementTemplate is Ownable {

    using TemplateStoreLibrary for TemplateStoreLibrary.TemplateList;

    TemplateStoreLibrary.TemplateList internal templateList;
    address[] internal conditionTypes;

    AgreementStoreManager internal agreementStoreManager;

    /**
     * @notice createAgreement create new agreement
     * @param _id agreement unique identifier
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _conditionIds list of condition identifiers
     * @param _timeLocks list of time locks, each time lock will be assigned to the 
     *          same condition that has the same index
     * @param _timeOuts list of time outs, each time out will be assigned to the 
     *          same condition that has the same index
     * @return the index of the created agreement
     */
    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts
    )
        public
        returns (uint size)
    {
        return agreementStoreManager.createAgreement(
            _id,
            _did,
            getConditionTypes(),
            _conditionIds,
            _timeLocks,
            _timeOuts
        );
    }

    /**
     * @notice getConditionTypes gets the conditions addresses list
     * @dev for the current template returns list of condition contracts 
     *      addresses
     * @return list of conditions contract addresses
     */
    function getConditionTypes()
        public
        view
        returns (address[] memory)
    {
        return conditionTypes;
    }
}
