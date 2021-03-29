pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Reward.sol';
import '../ConditionStoreLibrary.sol';

/**
 * @title Escrow Reward
 * @author Keyko & Ocean Protocol
 * 
 *
 * @dev Implementation of the Escrow Reward.
 * @dev This condition is DEPRECATED. Please use the EscrowPaymentCondition
 *
 *      The Escrow reward is reward condition in which only 
 *      can release reward if lock and release conditions
 *      are fulfilled.
 */
contract EscrowReward is Reward {

    bytes32 constant public CONDITION_TYPE = keccak256('EscrowReward');

    event Fulfilled(
        bytes32 indexed _agreementId,
        address[] _receivers,
        bytes32 _conditionId,
        uint256[] _amounts
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
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        token = ERC20Upgradeable(_tokenAddress);
    }


    /**
     * @notice hashValues generates the hash of condition inputs 
     *        with the following parameters
     * @param _amounts token amounts to be locked/released
     * @param _receivers receiver's addresses
     * @param _sender sender's address
     * @param _lockCondition lock condition identifier
     * @param _releaseCondition release condition identifier
     * @return bytes32 hash of all these values 
     */
    function hashValues(
        uint256[] memory _amounts,
        address[] memory _receivers,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
    public pure
    returns (bytes32)
    {
        require(
            _amounts.length == _receivers.length,
            'Amounts and Receivers arguments have wrong length'
        );
        return keccak256(
            abi.encodePacked(
                _amounts,
                _receivers,
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
     * @param _amounts token amounts to be locked/released
     * @param _receivers receiver's address
     * @param _sender sender's address
     * @param _lockCondition lock condition identifier
     * @param _releaseCondition release condition identifier
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        uint256[] memory _amounts,
        address[] memory _receivers,
        address _sender,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
    external
    returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            _amounts.length == _receivers.length,
            'Amounts and Receivers arguments have wrong length'
        );

        bytes32 id = generateId(
            _agreementId,
            hashValues(
                _amounts,
                _receivers,
                _sender,
                _lockCondition,
                _releaseCondition
            )
        );
        address lockConditionTypeRef;
        ConditionStoreLibrary.ConditionState lockConditionState;
        (lockConditionTypeRef,lockConditionState,,,,,,) = conditionStoreManager
        .getCondition(_lockCondition);

        uint256 _totalAmount = 0;
        for(uint i = 0; i < _amounts.length; i++)
            _totalAmount = _totalAmount + _amounts[i];

        bytes32 generatedLockConditionId = keccak256(
            abi.encodePacked(
                _agreementId,
                lockConditionTypeRef,
                keccak256(
                    abi.encodePacked(
                        address(this),
                        _totalAmount
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
            token.balanceOf(address(this)) >= _totalAmount,
            'Not enough balance'
        );

        ConditionStoreLibrary.ConditionState state = conditionStoreManager
        .getConditionState(_releaseCondition);

        if (state == ConditionStoreLibrary.ConditionState.Fulfilled)
        {
            state = _transferAndFulfill(id, _receivers, _amounts);
            emit Fulfilled(_agreementId, _receivers, id, _amounts);

        } else if (state == ConditionStoreLibrary.ConditionState.Aborted)
        {
            uint256[] memory _totalAmounts = new uint256[](1);
            _totalAmounts[0] = _totalAmount;
            address[] memory _originalSender = new address[](1);
            _originalSender[0] = _sender;
            state = _transferAndFulfill(id, _originalSender, _totalAmounts);
            emit Fulfilled(_agreementId, _originalSender, id, _totalAmounts);
        } else
        {
            return conditionStoreManager.getConditionState(id);
        }

        return state;
    }

    /**
    * @notice _transferAndFulfill transfer tokens and 
    *       fulfill the condition
    * @param _id condition identifier
    * @param _receivers receiver's address
    * @param _amounts token amount to be locked/released
    * @return condition state (Fulfilled/Aborted)
    */
    function _transferAndFulfill(
        bytes32 _id,
        address[] memory _receivers,
        uint256[] memory _amounts
    )
    private
    returns (ConditionStoreLibrary.ConditionState)
    {
        for(uint i = 0; i < _receivers.length; i++)    {
            require(
                _receivers[i] != address(0),
                'Null address is impossible to fulfill'
            );
            require(
                _receivers[i] != address(this),
                'EscrowReward contract can not be a receiver'
            );
            require(
                token.transfer(_receivers[i], _amounts[i]),
                'Could not transfer token'
            );
        }
        return super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }

}
