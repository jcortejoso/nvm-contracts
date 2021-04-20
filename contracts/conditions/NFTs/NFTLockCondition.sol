pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Condition.sol';
import '../../registry/DIDRegistry.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol';

/**
 * @title NFT Lock Condition
 * @author Keyko
 *
 * @dev Implementation of the NFT Lock Condition
 */
contract NFTLockCondition is Condition, IERC1155ReceiverUpgradeable {

    IERC1155Upgradeable private registry;
    
    bytes32 constant public CONDITION_TYPE = keccak256('NFTLockCondition');

    bytes4 constant internal ERC1155_ACCEPTED = 0xf23a6e61; // bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))
    bytes4 constant internal ERC1155_BATCH_ACCEPTED = 0xbc197c81; // bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))

    bytes public lastData;
    address public lastOperator;
    address public lastFrom;
    uint256 public lastId;
    uint256 public lastValue;
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        address indexed _rewardAddress,
        bytes32 _conditionId,
        uint256 _amount
    );

   /**
    * @notice initialize init the  contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _didRegistryAddress DIDRegistry contract address
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
            _conditionStoreManagerAddress != address(0) &&
            _didRegistryAddress != address(0),
            'Invalid address'
        );
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
        
        registry = IERC1155Upgradeable(_didRegistryAddress);
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _did the DID of the asset with NFTs attached to lock    
    * @param _rewardAddress the final address to receive the NFTs
    * @param _amount is the amount of the locked tokens
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _did,
        address _rewardAddress,
        uint256 _amount
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_did, _rewardAddress, _amount));
    }

   /**
    * @notice fulfill requires valid NFT transfer in order 
    *           to lock the amount of DID NFTs based on the SEA
    * @param _agreementId SEA agreement identifier
    * @param _did Asset Decentralized Identifier    
    * @param _rewardAddress the contract address where the reward is locked
    * @param _amount is the amount of tokens to be transferred 
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _rewardAddress,
        uint256 _amount
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        registry.safeTransferFrom(msg.sender, address(this), uint256(_did), _amount, '');
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _rewardAddress, _amount)
        );
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );

        emit Fulfilled(
            _agreementId,
            _did,
            _rewardAddress,
            _id,
            _amount
        );
        return state;
    }

    // solhint-disable-next-line
    function onERC1155Received(
        address _operator, 
        address _from, 
        uint256 _id, 
        uint256 _value, 
        bytes calldata _data
    ) 
    external
    override
    returns(bytes4) 
    {
        lastOperator = _operator;
        lastFrom = _from;
        lastId = _id;
        lastValue = _value;
        lastData = _data;
        return ERC1155_ACCEPTED;
    }

    function onERC1155BatchReceived(
        address _operator, 
        address _from, 
        uint256[] calldata _ids, 
        uint256[] calldata _values, 
        bytes calldata _data
    ) 
    external
    override
    returns(bytes4) 
    {
        lastOperator = _operator;
        lastFrom = _from;
        lastId = _ids[0];
        lastValue = _values[0];
        lastData = _data;
        return ERC1155_BATCH_ACCEPTED;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) 
    external
    override
    view 
    returns (bool) 
    {
        return  interfaceId == 0x01ffc9a7 ||    // ERC165
        interfaceId == 0x4e2312e0;      // ERC1155_ACCEPTED ^ ERC1155_BATCH_ACCEPTED;        
    }

}
