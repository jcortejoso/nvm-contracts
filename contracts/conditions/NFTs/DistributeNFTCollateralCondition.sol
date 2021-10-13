pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '../../registry/DIDRegistry.sol';
import '../defi/aave/AaveCreditVault.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';

/**
 * @title Distribute NFT Collateral Condition
 * @author Keyko
 *
 * @dev Implementation of a condition allowing to transfer a NFT
 *      to an account or another depending on the final state of a lock condition
 */
contract DistributeNFTCollateralCondition is Condition, ReentrancyGuardUpgradeable {

    bytes32 private constant CONDITION_TYPE = keccak256('DistributeNFTCollateralCondition');

    AaveCreditVault internal aaveCreditVault;

    address private _lockConditionAddress;


    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _receiver,
        bytes32 _conditionId,
        address _contract
    );    
    
   /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address    
    * @param _lockNFTConditionAddress Lock NFT Condition address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _lockNFTConditionAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _conditionStoreManagerAddress != address(0) &&
            _lockNFTConditionAddress != address(0),
            'Invalid address'
        );
        
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );

        _lockConditionAddress = _lockNFTConditionAddress;
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did refers to the DID in which secret store will issue the decryption keys
    * @param _nftReceiver is the address of the user who will receive the NFT if the lock condition was fulfilled
    * @param _nftReceiverIfAborted is the address of the user who will receive the NFT if the lock condition is in aborted state
    * @param _lockCondition lock condition identifier    
    * @param _nftContractAddress NFT contract to use
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        address _nftReceiverIfAborted,
        bytes32 _lockCondition,
        address _nftContractAddress
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                _did, _nftHolder, _nftReceiver, _nftReceiverIfAborted, _lockCondition, _nftContractAddress
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
     * @param _nftReceiver is the address of the user who will receive the NFT if the lock condition was fulfilled
     * @param _nftReceiverIfAborted is the address of the user who will receive the NFT if the lock condition is in aborted state
     * @param _lockPaymentCondition lock payment condition identifier
     * @param _nftContractAddress NFT contract to use
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        address _nftReceiverIfAborted,
        bytes32 _lockPaymentCondition,
        address _nftContractAddress
    )
        public
        nonReentrant
        returns (ConditionStoreLibrary.ConditionState)
    {

        AaveCreditVault vault = AaveCreditVault(_nftHolder);
        require(vault.isBorrower(_nftReceiver) && vault.isLender(_nftReceiverIfAborted),
            'Invalid users'
        );
        
        ConditionStoreLibrary.ConditionState lockConditionState;
        (,lockConditionState,,,,,,) = conditionStoreManager
            .getCondition(_lockPaymentCondition);

        IERC721Upgradeable token = IERC721Upgradeable(_nftContractAddress);
        require(
            (_nftHolder == msg.sender || _nftHolder == token.ownerOf(uint256(_did))),
            'Not enough balance'
        );

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _nftHolder, _nftReceiver, _nftReceiverIfAborted, _lockPaymentCondition, _nftContractAddress)
        );

        if (lockConditionState == ConditionStoreLibrary.ConditionState.Fulfilled) {
            vault.transferNFT(uint256(_did), _nftReceiver);
            emit Fulfilled(_agreementId, _did, _nftReceiver, _id, _nftContractAddress);
        } else if (lockConditionState == ConditionStoreLibrary.ConditionState.Aborted) {
            vault.transferNFT(uint256(_did), _nftReceiverIfAborted);
            emit Fulfilled(_agreementId, _did, _nftReceiverIfAborted, _id, _nftContractAddress);
        }   else {
            require(false, 'Still not fulfilled or aborted');
        }
        
        return super.fulfill(_id, ConditionStoreLibrary.ConditionState.Fulfilled);

    }    
    
}

