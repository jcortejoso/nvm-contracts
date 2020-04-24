pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../agreements/AgreementStoreManager.sol';


contract AgreementStoreManagerExtraFunctionality is AgreementStoreManager {
    //returns a boolean
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
