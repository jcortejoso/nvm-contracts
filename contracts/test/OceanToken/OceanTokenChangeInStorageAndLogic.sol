pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

// Contain upgraded version of the contracts for test
import '../../OceanToken.sol';
import 'openzeppelin-eth/contracts/math/SafeMath.sol';


contract OceanTokenChangeInStorageAndLogic is OceanToken {
    using SafeMath for uint256;
    //returns a number
    function incrementMintCount()
        public
        returns(uint256)
    {
        mintCount = mintCount.add(1);
        return mintCount;
    }

    uint256 public mintCount;
}
