pragma solidity 0.5.6;


import '../../conditions/ConditionStoreManager.sol';

contract ConditionStoreWithBug is ConditionStoreManager {
    function getConditionState(bytes32 _id)
        public
        view
        returns (ConditionStoreLibrary.ConditionState)
    {
        // adding Bug here: shouldn't return fulfilled
        if (conditionList.conditions[_id].state ==
           ConditionStoreLibrary.ConditionState.Uninitialized) {
            return ConditionStoreLibrary.ConditionState.Fulfilled;
        }

        return ConditionStoreLibrary.ConditionState.Fulfilled;
    }
}
