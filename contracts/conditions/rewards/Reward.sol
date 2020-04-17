pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../Condition.sol';
import '../ConditionStoreManager.sol';
import '../../OceanToken.sol';

/**
 * @title Reward
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Reward.
 *
 *      Generic reward condition
 *      For more information, please refer the following link:
 *      https://github.com/oceanprotocol/OEPs/issues/133
 *      TODO: update the OEP link 
 */
contract Reward is Condition {
    IERC20 internal token;
}



