pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../templates/TemplateStoreManager.sol';

contract TemplateStoreWithBug is TemplateStoreManager {
    function getTemplateListSize()
        external
        view
        returns (uint size)
    {
        if (templateList.templateIds.length == 0)
            return templateList.templateIds.length;
        return 0;
    }
}
