pragma solidity 0.6.12;


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



