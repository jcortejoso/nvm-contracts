pragma solidity 0.5.6;



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
    external;
    
    /**
    * @notice renouncePermission is called only by documentKeyId Owner or provider
    */
    function renouncePermission(
        address user,
        bytes32 documentKeyId
    )
    external;
}
