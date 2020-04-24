pragma solidity 0.5.6;


import '../../conditions/ConditionStoreManager.sol';

contract ConditionStoreChangeFunctionSignature is ConditionStoreManager {

    function createCondition(
        bytes32 _id,
        address _typeRef,
        address _sender
    )
        public
        returns (uint size)
    {
        // change function signature
        require(
            msg.sender == _sender,
            'Invalid _sender address change signature test should fail'
        );

        return createCondition(
            _id,
            _typeRef,
            uint(0),
            uint(0)
        );
    }
}
