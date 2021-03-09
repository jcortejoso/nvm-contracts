pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '../../registry/DIDRegistry.sol';
import '../../agreements/AgreementStoreManager.sol';

/**
 * @title Transfer NFT Condition
 * @author Keyko
 *
 * @dev Implementation of condition allowing to transfer an NFT
 *      between the original owner and a receiver
 *
 */
contract TransferNFTCondition is Condition {

    bytes32 constant public CONDITION_TYPE = keccak256('TransferNFTCondition');

    AgreementStoreManager internal agreementStoreManager;
    ERC1155Upgradeable private registry;
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _receiver,
        uint256 _amount,
        bytes32 _conditionId
    );
    
   /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address    
    * @param _agreementStoreManagerAddress agreement store manager address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _agreementStoreManagerAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0),
            'Invalid address'
        );
        
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        
        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        registry = ERC1155Upgradeable(
            agreementStoreManager.getDIDRegistryAddress()
        );        
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did refers to the DID in which secret store will issue the decryption keys
    * @param _receiver is the address of the granted user or the DID provider
    * @param _amount amount of NFTs to transfer
    * @param _lockCondition lock condition identifier    
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _receiver,
        uint256 _amount,
        bytes32 _lockCondition
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_did, _receiver, _amount, _lockCondition));
    }

   /**
    * @notice fulfill the transfer NFT condition
    * @dev only DID owner or DID provider can call this
    *       method. Fulfill method transfer a certain amount of NFTs 
    *       to the _receiver address. 
    *       When true then fulfill the condition
    * @param _agreementId agreement identifier
    * @param _did refers to the DID in which secret store will issue the decryption keys
    * @param _receiver is the address of the granted user
    * @param _amount amount of NFTs to transfer    
    * @param _lockCondition lock condition identifier
    * @return condition state (Fulfilled/Aborted)
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _receiver,
        uint256 _amount,
        bytes32 _lockCondition
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _receiver, _amount, _lockCondition)
        );

        address lockConditionTypeRef;
        ConditionStoreLibrary.ConditionState lockConditionState;
        (lockConditionTypeRef,lockConditionState,,,,,) = conditionStoreManager
            .getCondition(_lockCondition);

        require(
            lockConditionState == ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );
    
        bytes32 generatedLockConditionId = keccak256(
            abi.encodePacked(
                _agreementId,
                lockConditionTypeRef,
                keccak256(
                    abi.encodePacked(
                        _did,
                        _receiver,
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
            registry.balanceOf(lockConditionTypeRef, uint256(_did)) >= _amount,
            'Not enough balance'
        );        
        
        registry.safeTransferFrom(lockConditionTypeRef, _receiver, uint256(_did), _amount, '');

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
        
        emit Fulfilled(
            _agreementId,
            _did,
            _receiver,
            _amount,
            _id
        );

        return state;
    }
    
}

