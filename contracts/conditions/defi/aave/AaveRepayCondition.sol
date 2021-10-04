pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../../Common.sol';
import '../../Condition.sol';
import '../../../registry/DIDRegistry.sol';
import './AaveCreditVault.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol';

/**
 * @title Lock Payment Condition
 * @author Keyko
 *
 * @dev Implementation of the Aave Repay Condition
 * This condition allows to a borrower to repay a credit as part of a credit template
 */
contract AaveRepayCondition is Condition, Common {
    using SafeMathUpgradeable for uint256;
    
    DIDRegistry internal didRegistry;
    AaveCreditVault internal aaveCreditVault;
    
    bytes32 public constant CONDITION_TYPE = keccak256('AaveRepayCondition');
    
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
    * @param _didRegistryAddress DID Registry address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress,
        address _didRegistryAddress
    ) 
    external 
    initializer 
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
        
        didRegistry = DIDRegistry(_didRegistryAddress);
    }

    /**
     * @notice hashValues generates the hash of condition inputs 
     *        with the following parameters
     * @param _did the DID of the asset
     * @param _borrower the address of the borrower/delegatee
     * @param _assetToRepay the address of the asset to repay (i.e DAI)  
     * @param _amountToRepay Amount to repay        
     * @return bytes32 hash of all these values 
     */    
    function hashValues(
        bytes32 _did,
        address _borrower,
        address _assetToRepay,
        uint256 _amountToRepay
    ) 
    public 
    pure 
    returns (bytes32) 
    {
        return keccak256(abi.encode(_did, _borrower, _assetToRepay, _amountToRepay));
    }

    /**
     * @notice It allows the borrower to repay the loan
     * @param _agreementId the identifier of the agreement     
     * @param _did the DID of the asset
     * @param _vaultAddress the address of vault locking the deposited collateral and the asset
     * @param _assetToRepay the address of the asset to repay (i.e DAI)
     * @param _amountToRepay Amount to repay                  
     * @return ConditionStoreLibrary.ConditionState the state of the condition (Fulfilled if everything went good) 
     */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _did,
        address _vaultAddress,
        address _assetToRepay,
        uint256 _amountToRepay,
        uint256 _interestRateMode
    ) 
    external 
    returns (ConditionStoreLibrary.ConditionState) 
    {
        ERC20Upgradeable token = ERC20Upgradeable(_assetToRepay);
        AaveCreditVault vault = AaveCreditVault(_vaultAddress);
        
        uint256 totalDebt = vault.getTotalActualDebt();
        uint256 initialBorrow = vault.getBorrowedAmount();
        require(initialBorrow == _amountToRepay, 'Amount to repay is not the same borrowed amount');
        
        token.transferFrom(msg.sender, _vaultAddress, totalDebt);
        
        vault.repay(_assetToRepay, _interestRateMode);
        
        bytes32 _id = generateId(
            _agreementId, 
            hashValues(_did, msg.sender, _assetToRepay, _amountToRepay)
        );
        
        ConditionStoreLibrary.ConditionState state = super.fulfill(
            _id, 
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
        
        return state;
    }
}
