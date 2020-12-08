pragma solidity 0.6.12;


// Contain upgraded version of the contracts for test
import '../../templates/TemplateStoreManager.sol';


contract TemplateStoreExtraFunctionality is TemplateStoreManager {
    //returns a boolean
    function dummyFunction()
        public pure
        returns(bool)
    {
        return true;
    }
}
