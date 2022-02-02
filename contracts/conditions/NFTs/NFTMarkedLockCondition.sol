pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '../../registry/DIDRegistry.sol';
import './INFTMarkedLock.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

/**
 * @title NFT Lock Condition
 * @author Keyko
 *
 * @dev Implementation of the NFT Lock Condition
 */
contract NFTMarkedLockCondition is Condition, INFTMarkedLock, ReentrancyGuardUpgradeable, IERC1155ReceiverUpgradeable {

    bytes32 constant public CONDITION_TYPE = keccak256('NFTMarkedLockCondition');

    bytes4 constant internal ERC1155_ACCEPTED = 0xf23a6e61; // bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))
    bytes4 constant internal ERC1155_BATCH_ACCEPTED = 0xbc197c81; // bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))

   /**
    * @notice initialize init the  contract with the following parameters
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

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did the DID of the asset with NFTs attached to lock    
    * @param _lockAddress the contract address where the NFT will be locked
    * @param _amount is the amount of the locked tokens
    * @param _nftContractAddress Is the address of the NFT (ERC-1155) contract to use    
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _lockAddress,
        uint256 _amount,
        address _receiver,
        address _nftContractAddress
    )
        public
        override
        pure
        returns (bytes32)
    {
        return keccak256(
                abi.encode(
                    _did, 
                    _lockAddress, 
                    _amount, 
                    _receiver,
                    _nftContractAddress
                )
        );
    }

    /**
     * @notice fulfill the transfer NFT condition
     * @dev Fulfill method transfer a certain amount of NFTs 
     *       to the _nftReceiver address. 
     *       When true then fulfill the condition
     * @param _agreementId agreement identifier
     * @param _did refers to the DID in which secret store will issue the decryption keys
     * @param _lockAddress the contract address where the NFT will be locked
     * @param _amount is the amount of the locked tokens
     * @param _nftContractAddress Is the address of the NFT (ERC-1155) contract to use                   
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _lockAddress,
        uint256 _amount,
        address _receiver,
        address _nftContractAddress
    )
        public
        override
        nonReentrant
        returns (ConditionStoreLibrary.ConditionState)
    {
        IERC1155Upgradeable(_nftContractAddress).safeTransferFrom(msg.sender, _lockAddress, uint256(_did), _amount, '');
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _lockAddress, _amount, _receiver, _nftContractAddress)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _did,
            _lockAddress,
            _id,
            _amount,
            _receiver,
            _nftContractAddress
        );
        return state;
    }

    // solhint-disable-next-line
    function onERC1155Received(
        address, 
        address, 
        uint256, 
        uint256, 
        bytes calldata
    ) 
    external
    override
    pure
    returns(bytes4) 
    {
        return ERC1155_ACCEPTED;
    }

    function onERC1155BatchReceived(
        address, 
        address, 
        uint256[] calldata, 
        uint256[] calldata, 
        bytes calldata
    ) 
    external
    override
    pure
    returns(bytes4) 
    {
        return ERC1155_BATCH_ACCEPTED;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) 
    external
    override
    pure 
    returns (bool) 
    {
        return  interfaceId == 0x01ffc9a7 ||    // ERC165
        interfaceId == 0x4e2312e0;      // ERC1155_ACCEPTED ^ ERC1155_BATCH_ACCEPTED;        
    }

}
