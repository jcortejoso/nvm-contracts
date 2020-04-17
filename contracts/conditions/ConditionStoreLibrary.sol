pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title Condition Store Library
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Condition Store Library.
 *      
 *      Condition is a key component in the service execution agreement. 
 *      This library holds the logic for creating and updating condition 
 *      Any Condition has only four state transitions starts with Uninitialized,
 *      Unfulfilled, Fulfilled, and Aborted. Condition state transition goes only 
 *      forward from Unintialized -> Unfulfilled -> {Fulfilled || Aborted} 
 *      For more information: https://github.com/oceanprotocol/OEPs/issues/119
 *      TODO: update the OEP link
 */
library ConditionStoreLibrary {

    enum ConditionState { Uninitialized, Unfulfilled, Fulfilled, Aborted }

    struct Condition {
        address typeRef;
        ConditionState state;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
    }

    struct ConditionList {
        mapping(bytes32 => Condition) conditions;
        bytes32[] conditionIds;
    }

   /**
    * @notice create new condition
    * @dev check whether the condition exists, assigns 
    *       condition type, condition state, last updated by, 
    *       and update at (which is the current block number)
    * @param _self is the ConditionList storage pointer
    * @param _id valid condition identifier
    * @param _typeRef condition contract address
    * @return size is the condition index
    */
    function create(
        ConditionList storage _self,
        bytes32 _id,
        address _typeRef
    )
        internal
        returns (uint size)
    {
        require(
            _self.conditions[_id].blockNumberUpdated == 0,
            'Id already exists'
        );

        _self.conditions[_id] = Condition({
            typeRef: _typeRef,
            state: ConditionState.Unfulfilled,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number
        });

        _self.conditionIds.push(_id);

        return _self.conditionIds.length;
    }

    /**
    * @notice updateState update the condition state
    * @dev check whether the condition state transition is right,
    *       assign the new state, update last updated by and
    *       updated at.
    * @param _self is the ConditionList storage pointer
    * @param _id condition identifier
    * @param _newState the new state of the condition
    * @return ConditionState 
    */
    function updateState(
        ConditionList storage _self,
        bytes32 _id,
        ConditionState _newState
    )
        internal
    {
        require(
            _self.conditions[_id].state == ConditionState.Unfulfilled &&
            _newState > _self.conditions[_id].state,
            'Invalid state transition'
        );

        _self.conditions[_id].state = _newState;
        _self.conditions[_id].lastUpdatedBy = msg.sender;
        _self.conditions[_id].blockNumberUpdated = block.number;

    }
}
