pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import './ITransferNFT.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';

/**
 * @title Transfer NFT Condition
 * @author Keyko
 *
 * @dev Implementation of condition allowing to transfer an NFT
 *      between the original owner and a receiver
 *
 */
contract TransferNFT721Condition is Condition, ITransferNFT {

    bytes32 constant public CONDITION_TYPE = keccak256('TransferNFTCondition');
    
   /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
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

    function hashValues(
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockCondition,
        address _nftContractAddress
    )
    public
    pure
    override
    returns (bytes32)
    {
        return keccak256(abi.encode(_did, _nftHolder, _nftReceiver, _nftAmount, _lockCondition, _nftContractAddress));
    }
    
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockPaymentCondition,
        address _nftContractAddress
    )
    public
    override
    returns (ConditionStoreLibrary.ConditionState)
    {

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _nftHolder, _nftReceiver, _nftAmount, _lockPaymentCondition, _nftContractAddress)
        );

        address lockConditionTypeRef;
        ConditionStoreLibrary.ConditionState lockConditionState;
        (lockConditionTypeRef,lockConditionState,,,,,,) = conditionStoreManager
        .getCondition(_lockPaymentCondition);

        require(
            lockConditionState == ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );
        
        IERC721Upgradeable token = IERC721Upgradeable(_nftContractAddress);

        require(
            _nftAmount == 0 || (_nftAmount == 1 && token.ownerOf(uint256(_did)) == _nftHolder),
            'Not enough balance'
        );

        if (_nftAmount == 1) {
            token.safeTransferFrom(_nftHolder, _nftReceiver, uint256(_did));
        }

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _did,
            _nftReceiver,
            _nftHolder,
            _nftAmount,
            _id,
            _nftContractAddress
        );

        return state;
    }    
    
}

