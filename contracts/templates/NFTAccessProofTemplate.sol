pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './BaseEscrowTemplate.sol';
import '../conditions/AccessProofCondition.sol';
import '../conditions/NFTs/INFTHolder.sol';
import '../registry/DIDRegistry.sol';

/**
 * @title Agreement Template
 * @author Keyko
 *
 * @dev Implementation of NFT Access Template
 *
 *      The NFT Access template is use case specific template.
 *      Anyone (consumer/provider/publisher) can use this template in order
 *      to setup an agreement allowing NFT holders to get access to Nevermined services. 
 *      The template is a composite of 2 basic conditions: 
 *      - NFT Holding Condition
 *      - Access Condition
 * 
 *      Once the agreement is created, the consumer can demonstrate is holding a NFT
 *      for a specific DID. If that's the case the Access condition can be fulfilled
 *      by the asset owner or provider and all the agreement is fulfilled.
 *      This can be used in scenarios where a data or services owner, can allow 
 *      users to get access to exclusive services only when they demonstrate the 
 *      are holding a specific number of NFTs of a DID.
 *      This is very useful in use cases like arts.  
 */
contract NFTAccessProofTemplate is BaseEscrowTemplate {

    DIDRegistry internal didRegistry;
    INFTHolder internal nftHolderCondition;
    AccessProofCondition internal accessCondition;

   /**
    * @notice initialize init the 
    *       contract with the following parameters.
    * @dev this function is called only once during the contract
    *       initialization. It initializes the ownable feature, and 
    *       set push the required condition types including 
    *       access secret store, lock reward and escrow reward conditions.
    * @param _owner contract's owner account address
    * @param _agreementStoreManagerAddress agreement store manager contract address
    * @param _nftHolderConditionAddress lock reward condition contract address
    * @param _accessConditionAddress access condition contract address
    */
    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
        address _nftHolderConditionAddress,
        address _accessConditionAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0) &&
            _nftHolderConditionAddress != address(0) &&
            _accessConditionAddress != address(0),
            'Invalid address'
        );

        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        didRegistry = DIDRegistry(
            agreementStoreManager.getDIDRegistryAddress()
        );

        nftHolderCondition = INFTHolder(
            _nftHolderConditionAddress
        );

        accessCondition = AccessProofCondition(
            _accessConditionAddress
        );
        
        conditionTypes.push(address(nftHolderCondition));
        conditionTypes.push(address(accessCondition));
    }
}
