pragma solidity 0.5.6;


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
