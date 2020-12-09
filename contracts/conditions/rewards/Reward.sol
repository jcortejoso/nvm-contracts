pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../Condition.sol';
import '../ConditionStoreManager.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';

/**
 * @title Reward
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of the Reward.
 *
 *      Generic reward condition
 *      For more information, please refer the following link:
 *      https://github.com/oceanprotocol/OEPs/issues/133
 *      TODO: update the OEP link 
 */
contract Reward is Condition {
    IERC20Upgradeable internal token;
}



