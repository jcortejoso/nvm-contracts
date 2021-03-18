pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './Condition.sol';
import '../registry/DIDRegistry.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';

/**
 * @title Lock Payment Condition
 * @author Keyko
 *
 * @dev Implementation of the Lock Payment Condition
 * This condition allows to lock payment for multiple receivers taking
 * into account the royalties to be paid to the original creators in a secondary market.  
 */
contract LockPaymentCondition is Condition {

    IERC20Upgradeable private token;
    DIDRegistry internal didRegistry;

    bytes32 constant public CONDITION_TYPE = keccak256('LockPaymentCondition');

    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        bytes32 indexed _conditionId,
        address _rewardAddress,
        address[] _receivers,
        uint256[] _amounts
    );

   /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _tokenAddress Token contract address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _tokenAddress,
        address _didRegistryAddress
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
        
        didRegistry = DIDRegistry(
            _didRegistryAddress
        );
        
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did the asset decentralized identifier 
    * @param _rewardAddress the contract address where the reward is locked       
    * @param _amounts token amounts to be locked/released
    * @param _receivers receiver's addresses
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _rewardAddress,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_did, _rewardAddress, _amounts, _receivers));
    }

   /**
    * @notice fulfill requires valid token transfer in order 
    *           to lock the amount of tokens based on the SEA
    * @param _agreementId the agreement identifier
    * @param _did the asset decentralized identifier
    * @param _rewardAddress the contract address where the reward is locked
    * @param _amounts token amounts to be locked/released
    * @param _receivers receiver's addresses
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _rewardAddress,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
        external
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
        
        uint256 _totalAmount = 0;
        for(uint i = 0; i < _amounts.length; i++)
            _totalAmount = _totalAmount + _amounts[i];
        
        require(
            token.transferFrom(msg.sender, _rewardAddress, _totalAmount),
            'Could not transfer token'
        );

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _rewardAddress, _amounts, _receivers)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId, 
            _did,
            _id,
            _rewardAddress,
            _receivers, 
            _amounts
        );
        return state;
    }
}
