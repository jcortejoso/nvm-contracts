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
  ReentrancyGuardUpgradeable
{
  DIDRegistry internal didRegistry;
  AaveCreditVault internal aaveCreditVault;

  bytes32 public constant CONDITION_TYPE =
    keccak256('AaveCollateralWithdrawCondition');

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
  ) external initializer {
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

  function hashValues(
    bytes32 _did,
    address _delegator,
    address _collateralAsset
  ) public pure returns (bytes32) {
    return keccak256(abi.encode(_did, _delegator, _collateralAsset));
  }

  function fulfill(
    bytes32 _agreementId,
    bytes32 _did,
    address _vaultAddress,
    address _delegator,
    address _collateralAsset
  )
    external
    payable
    nonReentrant
    returns (ConditionStoreLibrary.ConditionState)
  {
    // Withdraw the collateral from the Aave Lending pool contract and the agreement fees
    AaveCreditVault vault = AaveCreditVault(_vaultAddress);
    vault.withdrawCollateral(_collateralAsset, _delegator);

    bytes32 _id = generateId(
      _agreementId,
      hashValues(_did, _delegator, _collateralAsset)
    );

    ConditionStoreLibrary.ConditionState state = super.fulfill(
      _id,
      ConditionStoreLibrary.ConditionState.Fulfilled
    );

    return state;
  }
}
