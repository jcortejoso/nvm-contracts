pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../OceanToken.sol';


contract OceanTokenChangeInStorage is OceanToken {
    using SafeMath for uint256;
    uint256 public mintCount;
}
