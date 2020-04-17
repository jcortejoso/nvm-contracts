pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Condition.sol';
import '../OceanToken.sol';

/**
 * @title Lock Reward Condition
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Lock Reward Condition
 *
 *      For more information, please refer the following link
 *      https://github.com/oceanprotocol/OEPs/issues/122
 *      TODO: update the OEP link 
 */
contract LockRewardCondition is Condition {

    OceanToken private token;

    event Fulfilled(
        bytes32 indexed _agreementId,
        address indexed _rewardAddress,
        bytes32 _conditionId,
        uint256 _amount
    );

   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _tokenAddress Ocean Token contract address
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
    * @param _rewardAddress the contract address where the reward will be locked
    * @param _amount is the amount of the locked tokens
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        address _rewardAddress,
        uint256 _amount
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_rewardAddress, _amount));
    }

   /**
    * @notice fulfill requires valid token transfer in order 
    *           to lock the amount of tokens based on the SEA
    * @param _agreementId SEA agreement identifier
    * @param _rewardAddress the contract address where the reward is locked
    * @param _amount is the amount of tokens to be transferred 
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        address _rewardAddress,
        uint256 _amount
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            token.transferFrom(msg.sender, _rewardAddress, _amount),
            'Could not transfer token'
        );

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_rewardAddress, _amount)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _rewardAddress,
            _id,
            _amount
        );
        return state;
    }
}
