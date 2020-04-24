pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../OceanToken.sol';


contract OceanTokenExtraFunctionality is OceanToken {
    //returns a boolean
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
