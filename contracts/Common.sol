pragma solidity 0.5.6;


import 'zos-lib/contracts/Initializable.sol';

/**
 * @title Common functions
 * @author Keyko & Ocean Protocol
 */
contract Common {
   /**
    * @notice getCurrentBlockNumber get block number
    * @return the current block number
    */
    function getCurrentBlockNumber()
        external
        view
        returns (uint)
    {
        return block.number;
    }

    /**
     * @dev isContract detect whether the address is 
     *          is a contract address or externally owned account
     * @return true if it is a contract address
     */
    function isContract(address addr)
        public
        view
        returns (bool)
    {
        uint size;
        /* solium-disable-next-line security/no-inline-assembly */
        assembly { size := extcodesize(addr) }
        return size > 0;
    }
}
