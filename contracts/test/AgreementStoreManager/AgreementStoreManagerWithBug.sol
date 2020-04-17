pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

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
