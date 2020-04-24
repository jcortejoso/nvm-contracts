pragma solidity 0.5.6;



/**
 * @title Parity Secret Store Interface
 * @author Keyko & Ocean Protocol
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
