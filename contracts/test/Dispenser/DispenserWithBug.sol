pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

// Contain upgraded version of the contracts for test
import '../../Dispenser.sol';

contract DispenserWithBug is Dispenser {
    /**
     * @dev the Owner can set the max amount for token requests
     * @param amount the max amount of tokens that can be requested
     */
    function setMaxAmount(
        uint256 amount
    )
        public
        onlyOwner
    {
        // set max amount for each request
        maxAmount = amount;
        // add bug!
        maxAmount = 20;
    }

    function getMaxAmount()
        public
        view
        returns(uint256)
    {
        return maxAmount;
    }
}
