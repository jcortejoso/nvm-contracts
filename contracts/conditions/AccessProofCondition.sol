pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './Condition.sol';
import '../registry/DIDRegistry.sol';
import '../interfaces/ISecretStore.sol';
import '../interfaces/ISecretStorePermission.sol';
import '../agreements/AgreementStoreManager.sol';

interface IDisputeManager {
    function accepted(address provider, address buyer, bytes32 orig, bytes32 crypted) external returns (bool);
}

/**
 * @title Access Condition with transfer proof
 * @author Keyko
 *
 * @dev Implementation of the Access Condition
 *
 */
contract AccessProofCondition is Condition {

    bytes32 constant public CONDITION_TYPE = keccak256('AccessProofCondition');

    AgreementStoreManager private agreementStoreManager;
    IDisputeManager private disputeManager;
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 _origHash,
        bytes32 _cryptedHash,
        address indexed _provider,
        address indexed _grantee,
        bytes32 _conditionId
    );
    
   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    * @param _agreementStoreManagerAddress agreement store manager address
    * @param _disputeManagerAddress dispute manager address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _agreementStoreManagerAddress,
        address _disputeManagerAddress
    )
        external
        initializer()
    {
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        disputeManager = IDisputeManager(
            _disputeManagerAddress
        );
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _origHash is the hash of data to access
    * @param _cryptedHash is the hash of data downloaded by buyer
    * @param _provider is the address of the data provider
    * @param _grantee is the address of the granted user
    * @return bytes32 hash of all these values 
    */
    function hashValues(
        bytes32 _origHash,
        bytes32 _cryptedHash,
        address _provider,
        address _grantee
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(_origHash, _cryptedHash, _provider, _grantee));
    }

   /**
    * @notice fulfill access secret store condition
    * @dev only DID owner or DID provider can call this
    *       method. Fulfill method sets the permissions 
    *       for the granted consumer's address to true then
    *       fulfill the condition
    * @param _origHash is the hash of data to access
    * @param _cryptedHash is the hash of data downloaded by buyer
    * @param _provider is the address of the data provider
    * @param _grantee is the address of the granted user
    * @return condition state (Fulfilled/Aborted)
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _origHash,
        bytes32 _cryptedHash,
        address _provider,
        address _grantee
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        require(disputeManager.accepted(_provider, _grantee, _origHash, _cryptedHash), 'Transfer proof not finished');

        bytes32 _id = generateId(
            _agreementId,
            hashValues(_origHash, _cryptedHash, _provider, _grantee)
        );

        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
        
        emit Fulfilled(
            _agreementId,
            _origHash,
            _cryptedHash,
            _provider,
            _grantee,
            _id
        );

        return state;
    }
    
}

