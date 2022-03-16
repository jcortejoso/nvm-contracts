pragma solidity ^0.8.0;
// Copyright 2022 Nevermined AG.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
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
