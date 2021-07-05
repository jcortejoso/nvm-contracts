pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '../../registry/DIDRegistry.sol';

interface ITransferNFT {

    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _receiver,
        address _holder,
        uint256 _amount,
        bytes32 _conditionId,
        address _nftContractAddress
    );
    

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did refers to the DID in which secret store will issue the decryption keys
    * @param _nftHolder is the address of the account Holding the NFTs    
    * @param _nftReceiver is the address of the NFT receiver
    * @param _nftAmount amount of NFTs to transfer   
    * @param _lockCondition lock condition identifier   
    * @param _nftContractAddress address of the ERC1155 or ERC721 contract address keeping the NFT 
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockCondition,
        address _nftContractAddress
    )
        external
        pure
        returns (bytes32);

    /**
     * @notice fulfill the transfer NFT condition
     * @dev Fulfill method transfer a certain amount of NFTs 
     *       to the _nftReceiver address. 
     *       When true then fulfill the condition
     * @param _agreementId agreement identifier
     * @param _did refers to the DID in which secret store will issue the decryption keys
     * @param _nftHolder is the address of the account Holding the NFTs    
     * @param _nftReceiver is the address of the NFT receiver     
     * @param _nftAmount amount of NFTs to transfer  
     * @param _lockPaymentCondition lock payment condition identifier
     * @param _nftContractAddress address of the ERC1155 or ERC721 contract address keeping the NFT 
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockPaymentCondition,
        address _nftContractAddress
    )
    external
    returns (ConditionStoreLibrary.ConditionState);

}

