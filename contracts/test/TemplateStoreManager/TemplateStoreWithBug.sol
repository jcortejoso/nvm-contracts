pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../templates/TemplateStoreManager.sol';

contract TemplateStoreWithBug is TemplateStoreManager {
    function getTemplateListSize()
        external
        view
        override
        returns (uint size)
    {
        if (templateList.templateIds.length == 0)
            return templateList.templateIds.length;
        return 0;
    }
}
