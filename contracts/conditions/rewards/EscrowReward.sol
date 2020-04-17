pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Reward.sol';
import '../ConditionStoreLibrary.sol';

/**
 * @title Escrow Reward
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Escrow Reward.
 *
 *      The Escrow reward is reward condition in which only 
 *      can release reward if lock and release conditions
 *      are fulfilled.
 *      For more information, please refer the following link: 
 *      https://github.com/oceanprotocol/OEPs/issues/133
 *      TODO: update the OEP link 
 */
contract EscrowReward is Reward {

    event Fulfilled(
        bytes32 indexed _agreementId,
        address indexed _receiver,
        bytes32 _conditionId,
        uint256 _amount
    );

   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _tokenAddress Ocean token contract address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _tokenAddress
    )
        external
        initializer()
    {
        require(
            _tokenAddress != address(0) &&
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        token = OceanToken(_tokenAddress);
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _amount token amount to be locked/released
    * @param _receiver receiver's address
    * @param _sender sender's address
    * @param _lockCondition lock condition identifier
    * @param _releaseCondition release condition identifier
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        uint256 _amount,
        address _receiver,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
        public pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                _amount,
                _receiver,
                _sender,
                _lockCondition,
                _releaseCondition
            )
        );
    }

   /**
    * @notice fulfill escrow reward condition
    * @dev fulfill method checks whether the lock and 
    *      release conditions are fulfilled in order to 
    *      release/refund the reward to receiver/sender 
    *      respectively.
    * @param _agreementId agreement identifier
    * @param _amount token amount to be locked/released
    * @param _receiver receiver's address
    * @param _sender sender's address
    * @param _lockCondition lock condition identifier
    * @param _releaseCondition release condition identifier
    * @return condition state (Fulfilled/Aborted)
    */
    function fulfill(
        bytes32 _agreementId,
        uint256 _amount,
        address _receiver,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        bytes32 id = generateId(
            _agreementId,
            hashValues(
                _amount,
                _receiver,
                _sender,
                _lockCondition,
                _releaseCondition
            )
        );
        address lockConditionTypeRef;
        ConditionStoreLibrary.ConditionState lockConditionState;
        (lockConditionTypeRef,lockConditionState,,,,,) = conditionStoreManager
            .getCondition(_lockCondition);

        bytes32 generatedLockConditionId = keccak256(
            abi.encodePacked(
                _agreementId,
                lockConditionTypeRef,
                keccak256(
                    abi.encodePacked(
                        address(this),
                        _amount
                    )
                )
            )
        );
        require(
            generatedLockConditionId == _lockCondition,
            'LockCondition ID does not match'
        );
        require(
            lockConditionState ==
            ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );
        require(
            token.balanceOf(address(this)) >= _amount,
            'Not enough balance'
        );

        ConditionStoreLibrary.ConditionState state = conditionStoreManager
            .getConditionState(_releaseCondition);

        address escrowReceiver = address(0x0);
        if (state == ConditionStoreLibrary.ConditionState.Fulfilled)
        {
            escrowReceiver = _receiver;
            state = _transferAndFulfill(id, _receiver, _amount);
        } else if (state == ConditionStoreLibrary.ConditionState.Aborted)
        {
            escrowReceiver = _sender;
            state = _transferAndFulfill(id, _sender, _amount);
        } else
        {
            return conditionStoreManager.getConditionState(id);
        }

        emit Fulfilled(
            _agreementId,
            escrowReceiver,
            id,
            _amount
        );

        return state;
    }

    /**
    * @notice _transferAndFulfill transfer tokens and 
    *       fulfill the condition
    * @param _id condition identifier
    * @param _receiver receiver's address
    * @param _amount token amount to be locked/released
    * @return condition state (Fulfilled/Aborted)
    */
    function _transferAndFulfill(
        bytes32 _id,
        address _receiver,
        uint256 _amount
    )
        private
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            _receiver != address(0),
            'Null address is impossible to fulfill'
        );
        require(
            _receiver != address(this),
            'EscrowReward contract can not be a receiver'
        );
        require(
            token.transfer(_receiver, _amount),
            'Could not transfer token'
        );
        return super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}



