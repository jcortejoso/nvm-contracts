pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0



/**
 * @title Parity Secret Store Permission Interface
 * @author Keyko & Ocean Protocol
 */
interface ISecretStorePermission {

   /**
    * @notice grantPermission is called only by documentKeyId Owner or provider
    */
    function grantPermission(
        address user,
        bytes32 documentKeyId
    )
    virtual
    external;
    
    /**
    * @notice renouncePermission is called only by documentKeyId Owner or provider
    */
    function renouncePermission(
        address user,
        bytes32 documentKeyId
    )
    virtual
    external;
}
