pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155BurnableUpgradeable.sol';

/**
 * @title Nft Holder Condition
 * Allows to fulfill a condition to users holding some amount of NFTs for a specific DID
 * @author Keyko
 *
 * @dev Implementation of the Nft Holder Condition
 */
contract NFTHolderCondition is Condition {

    ERC1155BurnableUpgradeable private nftRegistry;
    
    bytes32 constant public CONDITION_TYPE = keccak256('NFTHolderCondition');

    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _address,
        bytes32 _conditionId,
        uint256 _amount
    );

   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _didRegistryAddress DIDRegistry address
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
        transferOwnership(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        nftRegistry = ERC1155BurnableUpgradeable(_didRegistryAddress);
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did the Decentralized Identifier of the asset
    * @param _holderAddress the address of the NFT holder
    * @param _amount is the amount NFTs that need to be hold by the holder
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _holderAddress,
        uint256 _amount
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_did, _holderAddress, _amount));
    }

   /**
    * @notice fulfill requires a validation that holder has enough
    *       NFTs for a specific DID
    * @param _agreementId SEA agreement identifier
    * @param _did the Decentralized Identifier of the asset    
    * @param _holderAddress the contract address where the reward is locked
    * @param _amount is the amount of NFT to be hold
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _holderAddress,
        uint256 _amount
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(
            nftRegistry.balanceOf(_holderAddress, uint256(_did)) >= _amount,
            'The holder doesnt have enough NFT balance for the did given'
        );

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _holderAddress, _amount)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _did, 
            _holderAddress,
            _id,
            _amount
        );
        return state;
    }
}
