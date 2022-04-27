pragma solidity ^0.8.0;
// Copyright 2022 Nevermined AG.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../../token/erc721/NFT721Upgradeable.sol';
import '../Condition.sol';
import './ITransferNFT.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';

/**
 * @title Transfer NFT Condition
 * @author Nevermined
 *
 * @dev Implementation of condition allowing to transfer an NFT
 *      between the original owner and a receiver
 *
 */
contract TransferNFT721Condition is Condition, ITransferNFT, ReentrancyGuardUpgradeable, AccessControlUpgradeable {

    bytes32 private constant CONDITION_TYPE = keccak256('TransferNFT721Condition');

    bytes32 private constant MARKET_ROLE = keccak256('MARKETPLACE_ROLE');

    NFT721Upgradeable private erc721;
    address private _lockConditionAddress;

    bytes32 public constant PROXY_ROLE = keccak256('PROXY_ROLE');

    function grantProxyRole(address _address) public onlyOwner {
        grantRole(PROXY_ROLE, _address);
    }

    function revokeProxyRole(address _address) public onlyOwner {
        revokeRole(PROXY_ROLE, _address);
    }

   /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address    
    * @param _ercAddress Nevermined ERC-721 address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _ercAddress,
        address _lockNFTConditionAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _conditionStoreManagerAddress != address(0) &&
            _ercAddress != address(0) &&
            _lockNFTConditionAddress != address(0),
            'Invalid address'
        );
        
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );

        erc721 = NFT721Upgradeable(
            _ercAddress
        );
        _lockConditionAddress = _lockNFTConditionAddress;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);

    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did refers to the DID in which secret store will issue the decryption keys
    * @param _nftReceiver is the address of the granted user or the DID provider
    * @param _nftAmount amount of NFTs to transfer   
    * @param _lockCondition lock condition identifier    
    * @param _contract NFT contract to use
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockCondition,
        address _contract,
        bool _transfer
    )
        public
        pure
        override
        returns (bytes32)
    {
        return keccak256(abi.encode(_did, _nftHolder, _nftReceiver, _nftAmount, _lockCondition, _contract, _transfer));
    }

    function encodeParams(
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockPaymentCondition,
        address _nftContractAddress,
        bool _transfer
    ) external pure returns (bytes memory) {
        return abi.encode(_did, _nftHolder, _nftReceiver, _nftAmount, _lockPaymentCondition, _nftContractAddress, _transfer);
    }

    /**
     * @notice fulfill the transfer NFT condition
     * @dev Fulfill method transfer a certain amount of NFTs 
     *       to the _nftReceiver address. 
     *       When true then fulfill the condition
     * @param _agreementId agreement identifier
     * @param _did refers to the DID in which secret store will issue the decryption keys
     * @param _nftReceiver is the address of the account to receive the NFT
     * @param _nftAmount amount of NFTs to transfer  
     * @param _lockPaymentCondition lock payment condition identifier
     * @param _contract NFT contract to use
     * @param _transfer Indicates if the NFT will be transferred (true) or minted (false)          
     * @return condition state (Fulfilled/Aborted)
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockPaymentCondition,
        address _contract,
        bool _transfer
    )
        public
        override
        nonReentrant
        returns (ConditionStoreLibrary.ConditionState)
    {
        return fulfillInternal(msg.sender, _agreementId, _did, _nftReceiver, _nftAmount, _lockPaymentCondition, _contract, _transfer);
    }

    function fulfillProxy(
        address _account,
        bytes32 _agreementId,
        bytes memory params
    )
    external
    payable
    nonReentrant
    {
        bytes32 _did;
        address _nftReceiver;
        address _nftHolder;
        uint256 _nftAmount;
        bytes32 _lockPaymentCondition;
        address _nftContractAddress;
        bool _transfer;
        (_did, _nftHolder, _nftReceiver, _nftAmount, _lockPaymentCondition, _nftContractAddress, _transfer) = abi.decode(params, (bytes32, address, address, uint256, bytes32, address, bool));

        require(hasRole(PROXY_ROLE, msg.sender), 'Invalid access role');
        fulfillInternal(_account, _agreementId, _did, _nftReceiver, _nftAmount, _lockPaymentCondition, _nftContractAddress, _transfer);
    }

    function fulfillInternal(
        address _account,
        bytes32 _agreementId,
        bytes32 _did,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockPaymentCondition,
        address _contract,
        bool _transfer
    )
        internal
        returns (ConditionStoreLibrary.ConditionState)
    {

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _account, _nftReceiver, _nftAmount, _lockPaymentCondition, _contract, _transfer)
        );

        require(
            conditionStoreManager.getConditionState(_lockPaymentCondition) == ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );

        NFT721Upgradeable token = NFT721Upgradeable(_contract);
        address nftOwner = token.ownerOf(uint256(_did));
        if (_transfer)  {
            require(
                _nftAmount == 0 || (_nftAmount == 1 && nftOwner == _account),
                'Not enough balance'
            );

            if (_nftAmount == 1)
                token.safeTransferFrom(nftOwner, _nftReceiver, uint256(_did));
            
        }   else {
            token.mint(_nftReceiver, uint256(_did));
        }

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _did,
            _nftReceiver,
            _nftAmount,
            _id,
            _contract
        );

        return state;
    }    

    function fulfillForDelegate(
        bytes32 _agreementId,
        bytes32 _did,
        address _nftHolder,
        address _nftReceiver,
        uint256 _nftAmount,
        bytes32 _lockPaymentCondition,
        bool _transfer
    )
        public
    
    returns (ConditionStoreLibrary.ConditionState)
    {
        require(hasRole(MARKET_ROLE, msg.sender) || erc721.isApprovedForAll(_nftHolder, msg.sender), 'Invalid access role');
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _nftHolder, _nftReceiver, _nftAmount, _lockPaymentCondition, address(erc721), _transfer)
        );
        
        require(
            conditionStoreManager.getConditionState(_lockPaymentCondition) == ConditionStoreLibrary.ConditionState.Fulfilled,
            'LockCondition needs to be Fulfilled'
        );
        
        address nftOwner = erc721.ownerOf(uint256(_did));
        
        if (_transfer)  {
            require(
                _nftAmount == 0 || (_nftAmount == 1 && nftOwner == msg.sender),
                'Not enough balance'
            );

            if (_nftAmount == 1)
                erc721.safeTransferFrom(nftOwner, _nftReceiver, uint256(_did));
        }   else {
            erc721.mint(_nftReceiver, uint256(_did));
        }

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _did,
            _nftReceiver,
            _nftAmount,
            _id,
            address(erc721)
        );

        return state;
    }
}

