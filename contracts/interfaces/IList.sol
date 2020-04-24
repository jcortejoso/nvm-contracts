pragma solidity 0.5.6;


/**
 * @title List Interface
 * @author Keyko & Ocean Protocol
 */
interface IList {
    
    function has(
        bytes32 value
    ) 
        external 
        view
        returns(bool);
    
    function has(
        bytes32 value,
        bytes32 id
    )
        external
        view
        returns(bool);
}
