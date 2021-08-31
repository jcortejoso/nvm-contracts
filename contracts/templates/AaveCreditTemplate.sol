pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './BaseEscrowTemplate.sol';
import '../conditions/rewards/EscrowPaymentCondition.sol';
import '../registry/DIDRegistry.sol';
import '../conditions/NFTs/INFTLock.sol';
import '../conditions/NFTs/ITransferNFT.sol';
import '../conditions/defi/aave/AaveCollateralDepositCondition.sol';
import '../conditions/defi/aave/AaveBorrowCondition.sol';
import '../conditions/defi/aave/AaveRepayCondition.sol';

/**
 * @title Aaven Credit Agreement Template 
 * @author Keyko
 *
 * @dev Implementation of the Aaven Credit Agreement Template 
 *
 */
contract AaveCreditTemplate is BaseEscrowTemplate {

    DIDRegistry internal didRegistry;
    
    INFTLock internal nftLockCondition;
    AaveCollateralDepositCondition internal depositCondition;
    AaveBorrowCondition internal borrowCondition;
    AaveRepayCondition internal repayCondition;
    ITransferNFT internal transferCondition;
    
//    EscrowPaymentCondition internal escrowReward;

    /**
     * @notice initialize init the  contract with the following parameters.
     * @dev this function is called only once during the contract
     *       initialization. It initializes the ownable feature, and 
     *       set push the required condition types including 
     *       access , lock payment and escrow payment conditions.
     * @param _owner contract's owner account address
     * @param _agreementStoreManagerAddress agreement store manager contract address
     * @param _nftLockConditionAddress NFT Lock Condition contract address
     * @param _depositConditionAddress Aave collateral deposit Condition address
     * @param _borrowConditionAddress Aave borrow deposit Condition address
     * @param _repayConditionAddress Aave repay credit Condition address
     * @param _transferConditionAddress NFT Transfer Condition address     
     */
    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
        address _nftLockConditionAddress,
        address _depositConditionAddress,
        address _borrowConditionAddress,
        address _repayConditionAddress,
        address _transferConditionAddress
        //address payable _escrowConditionAddress
    )
    external
    initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0) &&
            _nftLockConditionAddress != address(0) &&
            _depositConditionAddress != address(0) &&
            _borrowConditionAddress != address(0) &&
            _repayConditionAddress != address(0) &&
            _transferConditionAddress != address(0),
//            _escrowConditionAddress != address(0),
            'Invalid address'
        );

        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        didRegistry = DIDRegistry(
            agreementStoreManager.getDIDRegistryAddress()
        );

        nftLockCondition = INFTLock(
            _nftLockConditionAddress
        );

        depositCondition = AaveCollateralDepositCondition(
            _depositConditionAddress
        );

        borrowCondition = AaveBorrowCondition(
            _borrowConditionAddress
        );

        repayCondition = AaveRepayCondition(
            _repayConditionAddress
        );

        transferCondition = ITransferNFT(
            _transferConditionAddress
        );        
//        escrowReward = EscrowPaymentCondition(
//            _escrowConditionAddress
//        );

        conditionTypes.push(address(nftLockCondition));
        conditionTypes.push(address(depositCondition));
        conditionTypes.push(address(borrowCondition));
        conditionTypes.push(address(repayCondition));
        conditionTypes.push(address(transferCondition));
//        conditionTypes.push(address(escrowReward));
    }
}
