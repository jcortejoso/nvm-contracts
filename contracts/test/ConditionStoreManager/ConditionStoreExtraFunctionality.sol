pragma solidity 0.6.12;


// Contain upgraded version of the contracts for test
import '../../conditions/ConditionStoreManager.sol';


contract ConditionStoreExtraFunctionality is ConditionStoreManager {
    //returns a boolean
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
