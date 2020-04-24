pragma solidity 0.5.6;


import '../../Dispenser.sol';

/**
 * @title Ocean Protocol Dispenser Contract
 * @author Keyko & Ocean Protocol
 * @dev All function calls are currently implemented without side effects
 */
contract DispenserChangeFunctionSignature is Dispenser {
    event DispenserChangeFunctionSignatureEvent(address caller);
    /**
     * @dev the Owner can set the min period for token requests
     * @param period the min amount of time before next request
     */
    function setMinPeriod(
        uint period,
        address caller
    )
        public
    {
        emit DispenserChangeFunctionSignatureEvent(caller);
        // set min period of time before next request (in seconds)
        minPeriod = period;
    }
}
