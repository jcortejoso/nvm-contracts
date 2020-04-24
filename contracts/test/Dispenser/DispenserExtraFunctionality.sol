pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../Dispenser.sol';


contract DispenserExtraFunctionality is Dispenser {
    //returns a boolean
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
