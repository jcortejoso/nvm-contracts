pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../templates/TemplateStoreManager.sol';

contract TemplateStoreChangeFunctionSignature is TemplateStoreManager {

    function proposeTemplate(
        bytes32 _id, 
        address[] calldata _conditionTypes,
        bytes32[] calldata _actorTypeIds,
        string calldata name,
        address sender
    )
        external
        returns (uint size)
    {
        require(
            _id == keccak256(abi.encodePacked(sender, name)),
            'Invalid address hash'
        );
        return templateList.propose(_id, _conditionTypes, _actorTypeIds);
    }
}
