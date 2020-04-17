pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title Condition Interface
 * @author Ocean Protocol Team
 */
interface ICondition {
    function generateId(
        bytes32 _agreementId,
        bytes32 _valueHash
    )
        external
        view
        returns (bytes32);
}
