pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './ConditionStoreManager.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
/**
 * @title Condition
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Condition
 *
 *      Each condition has a validation function that returns either FULFILLED, 
 *      ABORTED or UNFULFILLED. When a condition is successfully solved, we call 
 *      it FULFILLED. If a condition cannot be FULFILLED anymore due to a timeout 
 *      or other types of counter-proofs, the condition is ABORTED. UNFULFILLED 
 *      values imply that a condition has not been provably FULFILLED or ABORTED. 
 *      All initialized conditions start out as UNFULFILLED.
 *      For more information please refer to this link: 
 *      https://github.com/oceanprotocol/OEPs/issues/133
 *      TODO: update the OEP link
 */
contract Condition is Ownable {

    ConditionStoreManager internal conditionStoreManager;

   /**
    * @notice generateId condition Id from the following 
    *       parameters
    * @param _agreementId SEA agreement ID
    * @param _valueHash hash of all the condition input values
    */
    function generateId(
        bytes32 _agreementId,
        bytes32 _valueHash
    )
        public
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                _agreementId,
                address(this),
                _valueHash
            )
        );
    }

   /**
    * @notice fulfill set the condition state to Fulfill | Abort
    * @param _id condition identifier
    * @param _newState new condition state (Fulfill/Abort)
    * @return the updated condition state 
    */
    function fulfill(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        internal
        returns (ConditionStoreLibrary.ConditionState)
    {
        // _newState can be Fulfilled or Aborted
        return conditionStoreManager.updateConditionState(_id, _newState);
    }


    /**
    * @notice abortByTimeOut set condition state to Aborted 
    *         if the condition is timed out
    * @param _id condition identifier
    * @return the updated condition state
    */
    function abortByTimeOut(
        bytes32 _id
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            conditionStoreManager.isConditionTimedOut(_id),
            'Condition needs to be timed out'
        );

        return conditionStoreManager.updateConditionState(
            _id,
            ConditionStoreLibrary.ConditionState.Aborted
        );
    }
}
