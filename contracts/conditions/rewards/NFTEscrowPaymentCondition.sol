pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Reward.sol';
import '../../Common.sol';
import '../ConditionStoreLibrary.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

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
contract NFTEscrowPaymentCondition is Reward, Common, ReentrancyGuardUpgradeable {

    using SafeERC20Upgradeable for IERC20Upgradeable;

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
     */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress
    )
    external
    initializer()
    {
        require(         
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
    }

    
    /**
     * @notice hashValues generates the hash of condition inputs 
     *        with the following parameters
     * @param _did asset decentralized identifier               
     * @param _amounts token amounts to be locked/released
     * @param _receivers receiver's addresses
     * @param _tokenAddress the ERC20 contract address to use during the payment 
     * @param _lockCondition lock condition identifier
     * @param _releaseConditions release condition identifier
     * @return bytes32 hash of all these values 
     */
    function hashValues(
        bytes32 _did,
        uint[3] memory _types,
        uint256[][] memory _amounts,
        address[][] memory _receivers,
        address[] memory _tokenAddress,
        bytes32[] memory _lockCondition,
        bytes32[] memory _releaseConditions
    )
    public pure
    returns (bytes32)
    {
        require(
            _amounts.length == _receivers.length,
            'Amounts and Receivers arguments have wrong length'
        );
        return keccak256(
            abi.encode(
                _did,
                _types,
                _amounts,
                _receivers,
                _tokenAddress,
                _lockCondition,
                _releaseConditions
            )
        );
    }
    
   /**
    * @notice hashValuesLockPayment generates the hash of condition inputs 
    *        with the following parameters
    * @param _did the asset decentralized identifier 
    * @param _rewardAddress the contract address where the reward is locked       
    * @param _tokenAddress the ERC20 contract address to use during the lock payment. 
    *        If the address is 0x0 means we won't use a ERC20 but ETH for payment     
    * @param _amounts token amounts to be locked/released
    * @param _receivers receiver's addresses
    * @return bytes32 hash of all these values 
    */
    function hashValuesLockPayment(
        bytes32 _did,
        address _rewardAddress,
        address _tokenAddress,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(
            _did,
            _rewardAddress,
            _tokenAddress,
            _amounts,
            _receivers
        ));
    }

    function matchLockPayment(
        bytes32 _agreementId,
        bytes32 _did,
        uint256[][] memory _amounts,
        address[][] memory _receivers,
        address[] memory _tokenAddress,
        bytes32[] memory _lockConditions,
        uint256 idx
    )
    internal
    view
    returns (bool)
    {
        return keccak256(
            abi.encode(
                _agreementId,
                conditionStoreManager.getConditionTypeRef(_lockConditions[idx]),
                hashValuesLockPayment(_did, address(this), _tokenAddress[idx], _amounts[idx], _receivers[idx])
            )
        ) == _lockConditions[idx];
    }

    function cancelPayments(
        bytes32 _agreementId,
        uint[3] memory _types,
        uint256[][] memory _amounts,
        address[] memory _tokenAddress,
        bytes32[] memory _lockConditions,
        bytes32 id
    )
    internal
    returns (ConditionStoreLibrary.ConditionState)
    {
        for (uint256 i = 0; i < _types[0]; i++) {
            // TODO: check that it was fulfilled
            cancelPayment(_agreementId, _amounts, _tokenAddress, _lockConditions, i, id);
        }

        return super.fulfill(
            id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

    }

    function cancelPayment(
        bytes32 _agreementId,
        uint256[][] memory _amounts,
        address[] memory _tokenAddress,
        bytes32[] memory _lockConditions,
        uint256 idx,
        bytes32 id
    )
    internal {
        uint256[] memory _totalAmounts = new uint256[](1);
        _totalAmounts[0] = calculateTotalAmount(_amounts[idx]);
        address[] memory _originalSender = new address[](1);
        _originalSender[0] = conditionStoreManager.getConditionCreatedBy(_lockConditions[idx]);

        if (_tokenAddress[idx] != address(0)) {
            _transferAndFulfillERC20(_tokenAddress[idx], _originalSender, _totalAmounts);
        } else {
            _transferAndFulfillETH(_originalSender, _totalAmounts);
        }
        emit Fulfilled(_agreementId, _tokenAddress[idx], _originalSender, id, _totalAmounts);

    }

    function makePayment(
        bytes32 _agreementId,
        uint256[][] memory _amounts,
        address[][] memory _receivers,
        address[] memory _tokenAddress,
        uint256 idx,
        bytes32 id
    )
    internal {
        if (_tokenAddress[idx] != address(0)) {
            _transferAndFulfillERC20(_tokenAddress[idx], _receivers[idx], _amounts[idx]);
        } else {
            _transferAndFulfillETH(_receivers[idx], _amounts[idx]);
        }
        emit Fulfilled(_agreementId, _tokenAddress[idx], _receivers[idx], id, _amounts[idx]);
    }

    /*
     * @notice fulfill escrow reward condition
     * @dev fulfill method checks whether the lock and 
     *      release conditions are fulfilled in order to 
     *      release/refund the reward to receiver/sender 
     *      respectively.
     * @param _agreementId agreement identifier
     * @param _did asset decentralized identifier          
     * @param _amounts token amounts to be locked/released
     * @param _receivers receiver's address
     * @param _tokenAddress the ERC20 contract address to use during the payment
     * @param _lockCondition lock condition identifier
     * @param _releaseConditions release condition identifier
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        /*
        uint256[] memory _nft721Amounts,
        address[] memory _nft721Receivers,
        address[] memory _nft721TokenAddress,
        bytes32[] memory _nft721LockConditions,
        uint256[] memory _nftAmounts,
        address[] memory _nftReceivers,
        address[] memory _nftTokenAddress,
        bytes32[] memory _nftLockConditions,
        */
        bytes32 _agreementId,
        bytes32 _did,
        uint[3] memory _types,
        uint256[][] memory _amounts,
        address[][] memory _receivers,
        address[] memory _tokenAddress,
        bytes32[] memory _lockConditions,
        bytes32[] memory _releaseConditions
    )
    external
    nonReentrant
    returns (ConditionStoreLibrary.ConditionState)
    {
        bytes32 id = generateId(
            _agreementId,
            hashValues(
                _did,
                _types,
                _amounts,
                _receivers,
                _tokenAddress,
                _lockConditions,
                _releaseConditions
            )
        );        
        
        // Check that all lock conditions are fulfilled or if one of them is aborted
        bool lockFulfilled = true;
        bool lockAborted = false;
        bool lockFinished = true;

        for (uint i = 0; i < _lockConditions.length; i++) {
            ConditionStoreLibrary.ConditionState cur = conditionStoreManager.getConditionState(_lockConditions[i]);

            if (cur != ConditionStoreLibrary.ConditionState.Fulfilled) {
                lockFulfilled = false;
            }
            if (cur != ConditionStoreLibrary.ConditionState.Fulfilled && cur != ConditionStoreLibrary.ConditionState.Aborted) {
                lockFinished = false;
            }
            if (cur == ConditionStoreLibrary.ConditionState.Aborted) {
                lockAborted = true;
            }
        }

        if (lockAborted && lockFinished) {
            return cancelPayments(_agreementId, _types, _amounts, _tokenAddress, _lockConditions, id);
        }

        // Check that lock conditions match this escrow
        for (uint256 i = 0; i < _types[0]; i++) {
            require(
                matchLockPayment(_agreementId, _did, _amounts, _receivers, _tokenAddress, _lockConditions, i),
                'Lock payment does not match'
            );
        }

        bool allFulfilled = true;
        bool allAborted = true;
        for (uint i = 0; i < _releaseConditions.length; i++) {
            ConditionStoreLibrary.ConditionState cur = conditionStoreManager.getConditionState(_releaseConditions[i]);
            if (cur != ConditionStoreLibrary.ConditionState.Fulfilled) {
                allFulfilled = false;
            }
            if (cur != ConditionStoreLibrary.ConditionState.Aborted) {
                allAborted = false;
            }
        }
        
        if (allFulfilled) {
            for (uint256 i = 0; i < _types[0]; i++) {
                makePayment(_agreementId, _amounts, _receivers, _tokenAddress, i, id);
            }

            return super.fulfill(
                id,
                ConditionStoreLibrary.ConditionState.Fulfilled
            );
        } else if (allAborted) {
            return cancelPayments(_agreementId, _types, _amounts, _tokenAddress, _lockConditions, id);
        } else {
            return conditionStoreManager.getConditionState(id);
        }
    }

    /**
    * @notice _transferAndFulfill transfer ERC20 tokens and 
    *       fulfill the condition
    * @param _tokenAddress the ERC20 contract address to use during the payment    
    * @param _receivers receiver's address
    * @param _amounts token amount to be locked/released
    */
    function _transferAndFulfillERC20(
        address _tokenAddress,
        address[] memory _receivers,
        uint256[] memory _amounts
    )
    private
    {
        
        IERC20Upgradeable token = ERC20Upgradeable(_tokenAddress);
        
        for(uint i = 0; i < _receivers.length; i++)    {
            require(
                _receivers[i] != address(this),
                'Escrow contract can not be a receiver'
            );
            token.safeTransfer(_receivers[i], _amounts[i]);
        }

    }

    /**
    * @notice _transferAndFulfill transfer ETH and 
    *       fulfill the condition
    * @param _receivers receiver's address
    * @param _amounts token amount to be locked/released
    */
    function _transferAndFulfillETH(
        address[] memory _receivers,
        uint256[] memory _amounts
    )
    private
    {
        for(uint i = 0; i < _receivers.length; i++)    {
            require(
                _receivers[i] != address(this),
                'Escrow contract can not be a receiver'
            );
            
            require(
                address(this).balance >= _amounts[i],
                'Contract balance too low'
            );
            
            // solhint-disable-next-line
            (bool sent,) = _receivers[i].call{value: _amounts[i]}('');
            require(sent, 'Failed to send Ether');
        }

    }    
    
}
