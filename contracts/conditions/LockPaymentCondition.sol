pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './Condition.sol';
import '../registry/DIDRegistry.sol';
import '../Common.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import './ILockPayment.sol';

/**
 * @title Lock Payment Condition
 * @author Keyko
 *
 * @dev Implementation of the Lock Payment Condition
 * This condition allows to lock payment for multiple receivers taking
 * into account the royalties to be paid to the original creators in a secondary market.  
 */
contract LockPaymentCondition is ILockPayment, ReentrancyGuardUpgradeable, Condition, Common {

    using SafeERC20Upgradeable for IERC20Upgradeable;

    DIDRegistry internal didRegistry;

    bytes32 constant public CONDITION_TYPE = keccak256('LockPaymentCondition');
    bytes32 constant public KEY_ASSET_RECEIVER = keccak256('_assetReceiverAddress');

   /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _didRegistryAddress DID Registry address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _didRegistryAddress
    )
        external
        initializer()
    {
        require(
            _didRegistryAddress != address(0) &&
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        OwnableUpgradeable.__Ownable_init();
        ReentrancyGuardUpgradeable.__ReentrancyGuard_init();
        transferOwnership(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        
        didRegistry = DIDRegistry(
            _didRegistryAddress
        );
        
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did the asset decentralized identifier 
    * @param _rewardAddress the contract address where the reward is locked       
    * @param _tokenAddress the ERC20 contract address to use during the lock payment. 
    *        If the address is 0x0 means we won't use a ERC20 but ETH for payment     
    * @param _amounts token amounts to be locked/released
    * @param _receivers receiver's addresses
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _rewardAddress,
        address _tokenAddress,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
        public
        pure
        override
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

   /**
    * @notice fulfill requires valid token transfer in order 
    *           to lock the amount of tokens based on the SEA
    * @param _agreementId the agreement identifier
    * @param _did the asset decentralized identifier
    * @param _rewardAddress the contract address where the reward is locked
    * @param _tokenAddress the ERC20 contract address to use during the lock payment. 
    * @param _amounts token amounts to be locked/released
    * @param _receivers receiver's addresses
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address payable _rewardAddress,
        address _tokenAddress,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
    external
    override
    payable
    nonReentrant
    returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            _amounts.length == _receivers.length,
            'Amounts and Receivers arguments have wrong length'
        );

        require(
            didRegistry.areRoyaltiesValid(_did, _amounts, _receivers),
            'Royalties are not satisfied'
        );

        if (_tokenAddress != address(0))
            _transferERC20(_rewardAddress, _tokenAddress, calculateTotalAmount(_amounts));
        else
            _transferETH(_rewardAddress, calculateTotalAmount(_amounts));

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _rewardAddress, _tokenAddress, _amounts, _receivers)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        if (state == ConditionStoreLibrary.ConditionState.Fulfilled)    {
            conditionStoreManager.updateConditionMapping(
                _id,
                KEY_ASSET_RECEIVER,
                Common.addressToBytes32(msg.sender)
            );
        }
        
        emit Fulfilled(
            _agreementId, 
            _did,
            _id,
            _rewardAddress,
            _tokenAddress,
            _receivers, 
            _amounts
        );
        return state;
    }
 
   /**
    * @notice _transferERC20 transfer ERC20 tokens 
    * @param _rewardAddress the address to receive the tokens
    * @param _tokenAddress the ERC20 contract address to use during the payment
    * @param _amount token amount to be locked/released
    * @dev Will throw if transfer fails
    */
    function _transferERC20(
        address _rewardAddress,
        address _tokenAddress,
        uint256 _amount
    )
    internal
    {
        IERC20Upgradeable token = ERC20Upgradeable(_tokenAddress);
        token.safeTransferFrom(msg.sender, _rewardAddress, _amount);
    }

   /**
    * @notice _transferETH transfer ETH 
    * @param _rewardAddress the address to receive the ETH
    * @param _amount ETH amount to be locked/released
    */    
    function _transferETH(
        address payable _rewardAddress,
        uint256 _amount
    )
    internal
    {
        require(
            msg.value == _amount, 
            'Transaction value does not match amount'
        );
        // solhint-disable-next-line
        (bool sent,) = _rewardAddress.call{value: _amount}('');
        require(sent, 'Failed to send Ether');
    }

}
