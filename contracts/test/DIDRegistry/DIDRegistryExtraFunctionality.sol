pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

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
