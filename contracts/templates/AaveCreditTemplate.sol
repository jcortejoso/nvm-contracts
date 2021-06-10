pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import "./BaseEscrowTemplate.sol";
import "../conditions/AccessCondition.sol";
import "../conditions/LockPaymentCondition.sol";
import "../conditions/AaveCollateralDeposit.sol";
import "../conditions/AaveBorrowCredit.sol";
import "../conditions/AaveRepayCredit.sol";
import "../conditions/rewards/EscrowPaymentCondition.sol";
import "../registry/DIDRegistry.sol";
import "../conditions/NFTs/NFTLockCondition.sol";

/**
 * @title Aave Credit Template
 * @author Keyko
 *
 * @dev Implementation of Access Agreement Template
 *
 *      Access template is use case specific template.
 *      Anyone (consumer/provider/publisher) can use this template in order
 *      to setup an on-chain SEA. The template is a composite of three basic
 *      conditions. Once the agreement is created, the consumer will lock an amount
 *      of tokens (as listed in the DID document - off-chain metadata) to the
 *      the lock reward contract which in turn will fire an event. ON the other hand
 *      the provider is listening to all the emitted events, the provider
 *      will catch the event and grant permissions to the consumer through
 *      secret store contract, the consumer now is able to download the data set
 *      by asking the off-chain component of secret store to decrypt the DID and
 *      encrypt it using the consumer's public key. Then the secret store will
 *      provide an on-chain proof that the consumer had access to the data set.
 *      Finally, the provider can call the escrow reward condition in order
 *      to release the payment. Every condition has a time window (time lock and
 *      time out). This implies that if the provider didn't grant the access to
 *      the consumer through secret store within this time window, the consumer
 *      can ask for refund.
 */
contract AaveCreditTemplate is BaseEscrowTemplate {
  DIDRegistry internal didRegistry;

  /** @dev
        0. Initialize the agreement
        1. LockNFT - Delegatee locks the NFT
        2. AaveCollateralDeposit - Delegator deposits the collateral into Aave. And approves the delegation flow
        3. AaveBorrowCredit - The Delegatee claim the credit amount from Aave
        4. AaveRepayCredit. Options:
        4.a Fulfilled state - The Delegatee pay back the loan (including fee) into Aave and gets back the NFT 
        4.b Aborted state - The Delegatee doesn't pay the loan in time so the Delegator gets the NFT. The Delegator pays the loan to Aave
    */

  NFTLockCondition internal nftLockCondition;
  AaveCollateralDeposit internal aaveCollateralDeposit;
  AaveBorrowCredit internal aaveBorrowCredit;
  AaveRepayCredit internal aaveRepayCredit;
  mapping(bytes32 => address) internal vaultAddress;

  function initialize(
    address _owner,
    address _agreementStoreManagerAddress,
    address _didRegistryAddress,
    address _lockNFTConditionAddress,
    address _aaveCollateralDepositConditionAddress,
    address _aaveBorrowCreditConditionAddress,
    address _aaveRepayCreditConditionAddress
  ) external initializer() {
    require(
      _owner != address(0) &&
        _agreementStoreManagerAddress != address(0) &&
        _didRegistryAddress != address(0) &&
        _lockNFTConditionAddress != address(0) &&
        _aaveCollateralDepositConditionAddress != address(0) &&
        _aaveBorrowCreditConditionAddress != address(0) &&
        _aaveRepayCreditConditionAddress != address(0),
      "Invalid address"
    );

    OwnableUpgradeable.__Ownable_init();
    transferOwnership(_owner);

    agreementStoreManager = AgreementStoreManager(
      _agreementStoreManagerAddress
    );

    didRegistry = DIDRegistry(_didRegistryAddress);

    nftLockCondition = NFTLockCondition(_lockNFTConditionAddress);

    aaveCollateralDeposit = AaveCollateralDeposit(
      _aaveCollateralDepositConditionAddress
    );

    aaveBorrowCredit = AaveBorrowCredit(_aaveBorrowCreditConditionAddress);

    aaveRepayCredit = AaveRepayCredit(_aaveRepayCreditConditionAddress);

    conditionTypes.push(address(nftLockCondition));
    conditionTypes.push(address(aaveCollateralDeposit));
    conditionTypes.push(address(aaveBorrowCredit));
    conditionTypes.push(address(aaveRepayCredit));
  }

  function createAgreement(
    bytes32 _id,
    address _lendingPool,
    address _dataProvider,
    address _weth,
    bytes32 _did,
    bytes32[] memory _conditionIds,
    uint256[] memory _timeLocks,
    uint256[] memory _timeOuts,
    address _accessConsumer
  ) public returns (uint256 size) {
    AaveCreditVault vault = new AaveCreditVault(_lendingPool, _dataProvider, _weth);
    vaultAddress[_id] = address(vault);

    return
      super.createAgreement(
        _id,
        _did,
        _conditionIds,
        _timeLocks,
        _timeOuts,
        _accessConsumer
      );
  }

  function getVaultForAgreement(bytes32 _agreementId)
    public
    view
    returns (address)
  {
    return vaultAddress[_agreementId];
  }
}
