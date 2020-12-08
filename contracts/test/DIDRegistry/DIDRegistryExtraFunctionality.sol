pragma solidity 0.6.12;


// Contain upgraded version of the contracts for test
import '../../registry/DIDRegistry.sol';


contract DIDRegistryExtraFunctionality is DIDRegistry {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
