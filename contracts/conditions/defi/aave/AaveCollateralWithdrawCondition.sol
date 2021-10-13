pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../Condition.sol';
import '../../../registry/DIDRegistry.sol';
import './AaveCreditVault.sol';
import '../../../Common.sol';
import '../../../templates/AaveCreditTemplate.sol';
import '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';

/**
 * @title Aave Collateral Withdraw Condition
 * @author Keyko
 *
 * @dev Implementation of the Collateral Withdraw Condition
 * This condition allows to credit delegator withdraw the collateral and fees
 * after the agreement expiration
 */
contract AaveCollateralWithdrawCondition is
    Condition,
    Common,
    ReentrancyGuardUpgradeable {

    AaveCreditVault internal aaveCreditVault;
    
    bytes32 public constant CONDITION_TYPE = keccak256('AaveCollateralWithdrawCondition');
    
    event Fulfilled(
        bytes32 indexed _agreementId,
        bytes32 indexed _did,
        bytes32 indexed _conditionId
    );
    
    /**
    * @notice initialize init the contract with the following parameters
    * @dev this function is called only once during the contract initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress
    ) 
    external 
    initializer 
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
     * @param _did the DID of the asset
     * @param _vaultAddress Address of the vault
     * @param _collateralAsset the address of the asset used as collateral (i.e DAI) 
     * @param _lockCondition the condition that needs to be fulfill to allow the withdraw             
     * @return bytes32 hash of all these values 
     */
    function hashValues(
        bytes32 _did,
        address _vaultAddress,
        address _collateralAsset,
        bytes32 _lockCondition

    ) 
    public 
    pure 
    returns (bytes32) 
    {
        return keccak256(abi.encode(_did, _vaultAddress, _collateralAsset, _lockCondition));
    }


    /**
     * @notice It allows the borrower to repay the loan
     * @param _agreementId the identifier of the agreement     
     * @param _did the DID of the asset
     * @param _vaultAddress Address of the vault     
     * @param _collateralAsset the address of the asset used as collateral (i.e DAI)
     * @param _lockCondition the condition that needs to be fulfill to allow the withdraw                        
     * @return ConditionStoreLibrary.ConditionState the state of the condition (Fulfilled if everything went good) 
     */    
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _vaultAddress,
        address _collateralAsset,
        bytes32 _lockCondition
    )
    external
    payable
    nonReentrant
    returns (ConditionStoreLibrary.ConditionState)
    {
        // Withdraw the collateral from the Aave Lending pool contract and the agreement fees
        AaveCreditVault vault = AaveCreditVault(_vaultAddress);

        address lockConditionTypeRef;
        ConditionStoreLibrary.ConditionState lockConditionState;
        (lockConditionTypeRef,lockConditionState,,,,,,) = conditionStoreManager
            .getCondition(_lockCondition);

        require(
            lockConditionState == ConditionStoreLibrary.ConditionState.Fulfilled,
            'Lock Condition needs to be Fulfilled'
        );        
        
        require(vault.isLender(msg.sender), 'Only lender');
        vault.withdrawCollateral(_collateralAsset, vault.lender());
        
        bytes32 _id = generateId(
            _agreementId,
            hashValues(_did, _vaultAddress, _collateralAsset, _lockCondition)
        );
        
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
        
        return state;
    }
}
