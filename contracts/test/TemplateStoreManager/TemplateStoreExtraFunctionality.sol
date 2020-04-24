pragma solidity 0.5.6;


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
