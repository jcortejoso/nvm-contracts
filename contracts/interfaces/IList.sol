pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


/**
 * @title List Interface
 * @author Keyko & Ocean Protocol
 */
interface IList {
    
    function has(
        bytes32 value
    ) 
        virtual
        external 
        view
        returns(bool);
    
    function has(
        bytes32 value,
        bytes32 id
    )
        virtual
        external
        view
        returns(bool);
}
