pragma solidity 0.5.6;


import '../../agreements/AgreementStoreManager.sol';


contract AgreementStoreManagerWithBug is AgreementStoreManager {
    function getAgreementListSize()
        public
        view
        returns (uint size)
    {
        if (agreementList.agreementIds.length == 0)
            return agreementList.agreementIds.length;
        return 0;
    }
}
