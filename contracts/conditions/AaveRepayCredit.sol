pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import "./Condition.sol";
import "../registry/DIDRegistry.sol";
import "../AaveCreditVault.sol";
import "../Common.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/**
 * @title Lock Payment Condition
 * @author Keyko
 *
 * @dev Implementation of the Lock Payment Condition
 * This condition allows to lock payment for multiple receivers taking
 * into account the royalties to be paid to the original creators in a secondary market.
 */
contract AaveRepayCredit is Condition, Common {
  DIDRegistry internal didRegistry;
  AaveCreditVault internal aaveCreditVault;

  bytes32 public constant CONDITION_TYPE = keccak256("AaveRepayCredit");

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
  ) external initializer() {
    require(
      _didRegistryAddress != address(0) &&
        _conditionStoreManagerAddress != address(0),
      "Invalid address"
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
    address _borrower,
    address _assetToRepay,
    uint256 _amount
  ) public pure returns (bytes32) {
        return
      keccak256(
        abi.encodePacked(
          _did,
          _borrower,
          _assetToRepay,
          _amount
        )
      );
  }

  function fulfill(
    bytes32 _agreementId,
    bytes32 _did,
    address _vaultAddress,
    address _assetToRepay,
    uint256 _amount
  ) external  returns (ConditionStoreLibrary.ConditionState) {
    ERC20Upgradeable token = ERC20Upgradeable(_assetToRepay);
    token.transferFrom(msg.sender, _vaultAddress, _amount);
    
    AaveCreditVault vault = AaveCreditVault(_vaultAddress);
    vault.repay(_amount, _assetToRepay);

    bytes32 _id = generateId(
      _agreementId,
      hashValues(_did, msg.sender, _assetToRepay, _amount)
    );

    ConditionStoreLibrary.ConditionState state = super.fulfill(
      _id,
      ConditionStoreLibrary.ConditionState.Fulfilled
    );

    return state;
  }
}
