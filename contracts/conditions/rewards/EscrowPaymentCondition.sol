pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Reward.sol';
import '../../Common.sol';
import '../ConditionStoreLibrary.sol';

/**
 * @title Escrow Payment Condition
 * @author Keyko
 *
 * @dev Implementation of the Escrow Payment Condition
 *
 *      The Escrow payment is reward condition in which only 
 *      can release reward if lock and release conditions
 *      are fulfilled.
 */
contract EscrowPaymentCondition is Reward, Common {

    bytes32 constant public CONDITION_TYPE = keccak256('EscrowPayment');

    event Fulfilled(
        bytes32 indexed _agreementId,
        address indexed _tokenAddress,
        address[] _receivers,
        bytes32 _conditionId,
        uint256[] _amounts
    );

    event Received(
        address indexed _from, 
        uint _value
    );
    
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice initialize init the 
     *       contract with the following parameters
     * @param _owner contract's owner account address
     * @param _conditionStoreManagerAddress condition store manager address
     * @param _tokenAddress Default token contract address
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
        defaultTokenAddress = _tokenAddress;
    }

    
    /**
     * @notice hashValues generates the hash of condition inputs 
     *        with the following parameters
     * @param _did asset decentralized identifier               
     * @param _amounts token amounts to be locked/released
     * @param _receivers receiver's addresses
     * @param _lockPaymentAddress lock payment contract address
     * @param _tokenAddress the ERC20 contract address to use during the payment 
     * @param _lockCondition lock condition identifier
     * @param _releaseCondition release condition identifier
     * @return bytes32 hash of all these values 
     */
    function hashValues(
        bytes32 _did,
        uint256[] memory _amounts,
        address[] memory _receivers,
        address _lockPaymentAddress,
        address _tokenAddress,
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
                _did,
                _amounts,
                _receivers,
                _lockPaymentAddress, 
                _tokenAddress,
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
     * @param _did asset decentralized identifier          
     * @param _amounts token amounts to be locked/released
     * @param _receivers receiver's address
     * @param _lockPaymentAddress lock payment contract address
     * @param _tokenAddress the ERC20 contract address to use during the payment
     * @param _lockCondition lock condition identifier
     * @param _lockPaymentAddress release condition identifier
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        uint256[] memory _amounts,
        address[] memory _receivers,
        address _lockPaymentAddress,
        address _tokenAddress,
        bytes32 _lockCondition,
        bytes32 _releaseCondition
    )
    external
    returns (ConditionStoreLibrary.ConditionState)
    {

        require(keccak256(
            abi.encodePacked(
                _agreementId,
                conditionStoreManager.getConditionTypeRef(_lockCondition),
                keccak256(
                    abi.encodePacked(_did, _lockPaymentAddress, _tokenAddress, _amounts, _receivers)
                )
            )
        ) == _lockCondition,
            'LockCondition ID does not match'
        );
        
        require(
            conditionStoreManager.getConditionState(_lockCondition) ==
            ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );

        ConditionStoreLibrary.ConditionState state = conditionStoreManager
        .getConditionState(_releaseCondition);
        
        bytes32 id = generateId(
            _agreementId,
            hashValues(
                _did,
                _amounts,
                _receivers,
                _lockPaymentAddress,
                _tokenAddress,
                _lockCondition,
                _releaseCondition
            )
        );        
        
        if (state == ConditionStoreLibrary.ConditionState.Fulfilled) {
            if (_tokenAddress != address(0))
                state = _transferAndFulfillERC20(id, _tokenAddress, _receivers, _amounts);
            else
                state = _transferAndFulfillETH(id, _receivers, _amounts);
            
            emit Fulfilled(_agreementId, _tokenAddress, _receivers, id, _amounts);

        } else if (state == ConditionStoreLibrary.ConditionState.Aborted) {
            
            uint256[] memory _totalAmounts = new uint256[](1);
            _totalAmounts[0] = calculateTotalAmount(_amounts);
            address[] memory _originalSender = new address[](1);
            _originalSender[0] = conditionStoreManager.getConditionCreatedBy(_lockCondition);
            
            if (_tokenAddress != address(0))
                state = _transferAndFulfillERC20(id, _tokenAddress, _originalSender, _totalAmounts);
            else
                state = _transferAndFulfillETH(id, _originalSender, _totalAmounts);
            
            emit Fulfilled(_agreementId, _tokenAddress, _originalSender, id, _totalAmounts);
            
        } else {
            return conditionStoreManager.getConditionState(id);
        }

        return state;
    }

    /**
    * @notice _transferAndFulfill transfer tokens and 
    *       fulfill the condition
    * @param _id condition identifier
    * @param _tokenAddress the ERC20 contract address to use during the payment    
    * @param _receivers receiver's address
    * @param _amounts token amount to be locked/released
    * @return condition state (Fulfilled/Aborted)
    */
    function _transferAndFulfillERC20(
        bytes32 _id,
        address _tokenAddress,
        address[] memory _receivers,
        uint256[] memory _amounts
    )
    private
    returns (ConditionStoreLibrary.ConditionState)
    {
        
        IERC20Upgradeable token = ERC20Upgradeable(_tokenAddress);
        
        for(uint i = 0; i < _receivers.length; i++)    {
            require(
                _receivers[i] != address(this),
                'Escrow contract can not be a receiver'
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

    /**
    * @notice _transferAndFulfill transfer ETH and 
    *       fulfill the condition
    * @param _id condition identifier
    * @param _receivers receiver's address
    * @param _amounts token amount to be locked/released
    * @return condition state (Fulfilled/Aborted)
    */
    function _transferAndFulfillETH(
        bytes32 _id,
        address[] memory _receivers,
        uint256[] memory _amounts
    )
    private
    returns (ConditionStoreLibrary.ConditionState)
    {

        for(uint i = 0; i < _receivers.length; i++)    {
            require(
                _receivers[i] != address(this),
                'Escrow contract can not be a receiver'
            );
            (bool sent,) = _receivers[i].call{value: _amounts[i]}("");
            require(sent, "Failed to send Ether");
//            _receivers[i].transfer(_amounts[i]);
        }

        return super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }    
    
}
