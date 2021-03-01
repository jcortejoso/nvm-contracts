pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

// Contain upgraded version of the contracts for test
import '../../registry/DIDFactory.sol';


contract DIDRegistryExtraFunctionality is DIDFactory {
    //returns a number
    function getNumber()
        public pure
        returns(uint)
    {
        return 42;
    }
}
