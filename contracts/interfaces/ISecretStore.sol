pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


/**
 * @title Parity Secret Store Interface
 * @author Ocean Protocol Team
 */
interface ISecretStore {

   /**
    * @notice checkPermissions is called by Parity secret store
    */
    function checkPermissions(
        address user,
        bytes32 documentKeyId
    )
    external view
    returns (bool permissionGranted);
}
