pragma solidity 0.6.12;


// Contain upgraded version of the contracts for test
import '../../conditions/ConditionStoreManager.sol';

contract ConditionStoreChangeInStorage is ConditionStoreManager {

    // New variables should be added after the last variable
    // Old variables should be kept even if unused
    // No base contracts swap
    // https://github.com/jackandtheblockstalk/upgradeable-proxy#331-you-can-1
    uint256 public conditionCount;
}
