pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../Condition.sol';


interface INFTLock {

    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _lockAddress,
        bytes32 _conditionId,
        uint256 _amount
    );

    /**
     * @notice hashValues generates the hash of condition inputs 
     *        with the following parameters
     * @param _did the DID of the asset with NFTs attached to lock    
     * @param _lockAddress the contract address where the NFT will be locked
     * @param _amount is the amount of the locked tokens
     * @return bytes32 hash of all these values 
     */
    function hashValues(
        bytes32 _did,
        address _lockAddress,
        uint256 _amount
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
     * @param _lockAddress the contract address where the NFT will be locked
     * @param _amount is the amount of the locked tokens
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _lockAddress,
        uint256 _amount
    )
    external
    returns (ConditionStoreLibrary.ConditionState);

}
