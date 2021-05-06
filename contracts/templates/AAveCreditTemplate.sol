pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './BaseEscrowTemplate.sol';
import '../conditions/AccessCondition.sol';
import '../conditions/LockPaymentCondition.sol';
import '../conditions/rewards/EscrowPaymentCondition.sol';
import '../registry/DIDRegistry.sol';

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
    
    /**
        0. Initialize the agreement
        1. LockNFT - Delegatee locks the NFT
        2. AaveCollateralDeposit - Delegator deposits the collateral into Aave. And approves the delegation flow
        3. AaveBorrowCredit - The Delegatee claim the credit amount from Aave
        4. AaveRepayCredit. Options:
        4.a Fulfilled state - The Delegatee pay back the loan (including fee) into Aave and gets back the NFT 
        4.b Aborted state - The Delegatee doesn't pay the loan in time so the Delegator gets the NFT. The Delegator pays the loan to Aave
    */
    
    LockNFTCondition internal lockNFTCondition;
    AaveCollateralDeposit internal aaveCollateralDeposit;
    AaveBorrowCredit internal aaveBorrowCredit;
    AaveRepayCredit internal aaveRepayCredit;

   /**
    * @notice initialize init the 
    *       contract with the following parameters.
    * @dev this function is called only once during the contract
    *       initialization. It initializes the ownable feature, and 
    *       set push the required condition types including 
    *       access , lock payment and escrow payment conditions.
    * @param _owner contract's owner account address
    * @param _agreementStoreManagerAddress agreement store manager contract address
    * @param _didRegistryAddress DID registry contract address
    * @param _accessConditionAddress access condition address
    * @param _lockConditionAddress lock reward condition contract address
    * @param _escrowConditionAddress escrow reward contract address
    */
    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
        address _didRegistryAddress,
        address _lockNFTConditionAddress,
        address _aaveCollateralDepositConditionAddress,
        address _aaveBorrowCreditConditionAddress,
        address _aaveRepayCreditConditionAddress,
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0) &&
            _didRegistryAddress != address(0) &&
            _lockNFTConditionAddress != address(0) &&
            _aaveCollateralDepositConditionAddress != address(0) &&
            _aaveBorrowCreditConditionAddress != address(0) &&
            _aaveRepayCreditConditionAddress != address(0),
            'Invalid address'
        );

        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        didRegistry = DIDRegistry(
            _didRegistryAddress
        );

        lockNFTCondition = LockNFTCondition(
            _lockNFTConditionAddress
        );

        aaveCollateralDeposit = AaveCollateralDeposit(
            _aaveCollateralDepositConditionAddress
        );

        aaveBorrowCredit = AaveBorrowCredit(
            _aaveBorrowCreditConditionAddress
        );

        aaveRepayCredit = AaveRepayCredit(
            _aaveRepayCreditConditionAddress
        );

        conditionTypes.push(address(lockNFTCondition));
        conditionTypes.push(address(aaveCollateralDeposit));
        conditionTypes.push(address(aaveBorrowCredit));
        conditionTypes.push(address(aaveRepayCredit));
    }
}
