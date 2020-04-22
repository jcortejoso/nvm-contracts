pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './BaseEscrowTemplate.sol';
import '../registry/DIDRegistry.sol';
import '../conditions/LockRewardCondition.sol';
import '../conditions/rewards/EscrowReward.sol';
import '../conditions/ComputeExecutionCondition.sol';

/**
 * @title Service Execution Template
 * @author Ocean Protocol Team
 *
 * @dev Implementation of Service Execution Template
 */
 
contract EscrowComputeExecutionTemplate is BaseEscrowTemplate {

    DIDRegistry internal didRegistry;
    ComputeExecutionCondition internal computeExecutionCondition;
    LockRewardCondition internal lockRewardCondition;
    EscrowReward internal escrowReward;

   /**
    * @notice initialize init the 
    *       contract with the following parameters.
    * @dev this function is called only once during the contract
    *       initialization. It initializes the ownable feature, and 
    *       set push the required condition types including 
    *       service executor condition, lock reward and escrow reward conditions.
    * @param _owner contract's owner account address
    * @param _agreementStoreManagerAddress agreement store manager contract address
    * @param _didRegistryAddress DID registry contract address
    * @param _computeExecutionConditionAddress service executor condition contract address
    * @param _lockRewardConditionAddress lock reward condition contract address
    * @param _escrowRewardAddress escrow reward contract address
    */
    function initialize(
        address _owner,
        address _agreementStoreManagerAddress,
        address _didRegistryAddress,
        address _computeExecutionConditionAddress,
        address _lockRewardConditionAddress,
        address _escrowRewardAddress
    )
        external
        initializer()
    {
        require(
            _owner != address(0) &&
            _agreementStoreManagerAddress != address(0) &&
            _didRegistryAddress != address(0) &&
            _computeExecutionConditionAddress != address(0) &&
            _lockRewardConditionAddress != address(0) &&
            _escrowRewardAddress != address(0),
            'Invalid address'
        );

        Ownable.initialize(_owner);

        agreementStoreManager = AgreementStoreManager(
            _agreementStoreManagerAddress
        );

        didRegistry = DIDRegistry(
            _didRegistryAddress
        );

        computeExecutionCondition = ComputeExecutionCondition(
            _computeExecutionConditionAddress
        );

        lockRewardCondition = LockRewardCondition(
            _lockRewardConditionAddress
        );

        escrowReward = EscrowReward(
            _escrowRewardAddress
        );

        conditionTypes.push(address(computeExecutionCondition));
        conditionTypes.push(address(lockRewardCondition));
        conditionTypes.push(address(escrowReward));
    }
}
