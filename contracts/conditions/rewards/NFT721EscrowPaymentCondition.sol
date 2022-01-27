pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Reward.sol';
import '../../Common.sol';
import '../ConditionStoreLibrary.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
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
contract NFT721EscrowPaymentCondition is Reward, Common, ReentrancyGuardUpgradeable {

    bytes32 constant public CONDITION_TYPE = keccak256('NFTEscrowPayment');

    event Fulfilled(
        bytes32 indexed _agreementId,
        address indexed _tokenAddress,
        bytes32 _did,
        address _receivers,
        bytes32 _conditionId,
        uint256 _amounts
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
     * @param _lockPaymentAddress lock payment contract address
     * @param _tokenAddress the ERC20 contract address to use during the payment 
     * @param _lockCondition lock condition identifier
     * @param _releaseConditions release condition identifier
     * @return bytes32 hash of all these values 
     */
    function hashValues(
        bytes32 _did,
        uint256 _amounts,
        address _receivers,
        address _lockPaymentAddress,
        address _tokenAddress,
        bytes32 _lockCondition,
        bytes32[] memory _releaseConditions
    )
    public pure
    returns (bytes32)
    {
        return keccak256(
            abi.encode(
                _did,
                _amounts,
                _receivers,
                _lockPaymentAddress, 
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
    * @param _lockAddress the contract address where the reward is locked       
    * @param _nftContractAddress the ERC20 contract address to use during the lock payment. 
    *        If the address is 0x0 means we won't use a ERC20 but ETH for payment     
    * @param _amount token amounts to be locked/released
    * @param _receiver receiver's addresses
    * @return bytes32 hash of all these values 
    */
    function hashValuesLockPayment(
        bytes32 _did,
        address _lockAddress,
        address _nftContractAddress,
        uint256 _amount,
        address _receiver
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(
            _did, 
            _lockAddress, 
            _amount,
            _receiver, 
            _nftContractAddress
        ));
    }
    
    /**
     * @notice fulfill escrow reward condition
     * @dev fulfill method checks whether the lock and 
     *      release conditions are fulfilled in order to 
     *      release/refund the reward to receiver/sender 
     *      respectively.
     * @param _agreementId agreement identifier
     * @param _did asset decentralized identifier          
     * @param _amount token amounts to be locked/released
     * @param _receiver receiver's address
     * @param _lockPaymentAddress lock payment contract address
     * @param _tokenAddress the ERC20 contract address to use during the payment
     * @param _lockCondition lock condition identifier
     * @param _releaseConditions release condition identifier
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        uint256 _amount,
        address _receiver,
        address _lockPaymentAddress,
        address _tokenAddress,
        bytes32 _lockCondition,
        bytes32[] memory _releaseConditions
    )
    external
    nonReentrant
    returns (ConditionStoreLibrary.ConditionState)
    {

        require(keccak256(
            abi.encode(
                _agreementId,
                conditionStoreManager.getConditionTypeRef(_lockCondition),
                hashValuesLockPayment(_did, _lockPaymentAddress, _tokenAddress, _amount, _receiver)
            )
        ) == _lockCondition,
            'LockCondition ID does not match'
        );
        
        require(
            conditionStoreManager.getConditionState(_lockCondition) ==
            ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );

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
        
        bytes32 id = generateId(
            _agreementId,
            hashValues(
                _did,
                _amount,
                _receiver,
                _lockPaymentAddress,
                _tokenAddress,
                _lockCondition,
                _releaseConditions
            )
        );        
        
        if (allFulfilled) {
            return _transferAndFulfillNFT(_agreementId, id, _did, _tokenAddress, _receiver, _amount);

        } else if (allAborted) {
            return _transferAndFulfillNFT(_agreementId, id, _did, _tokenAddress, conditionStoreManager.getConditionCreatedBy(_lockCondition), _amount);
            
            
        } else {
            return conditionStoreManager.getConditionState(id);
        }

    }

    /**
    * @notice _transferAndFulfill transfer ERC20 tokens and 
    *       fulfill the condition
    * @param _id condition identifier
    * @param _tokenAddress the ERC20 contract address to use during the payment    
    * @param _receiver receiver's address
    * @param _amount token amount to be locked/released
    * @return condition state (Fulfilled/Aborted)
    */
    function _transferAndFulfillNFT(
        bytes32 _agreementId,
        bytes32 _id,
        bytes32 _did,
        address _tokenAddress,
        address _receiver,
        uint256 _amount
    )
    private
    returns (ConditionStoreLibrary.ConditionState)
    {
        
        if (_amount == 1) {
            IERC721Upgradeable(_tokenAddress).safeTransferFrom(address(this), _receiver, uint256(_did));
        }
        emit Fulfilled(_agreementId, _tokenAddress, _did, _receiver, _id, _amount);

        return super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
    
}
