pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../registry/DIDRegistry.sol';

contract DIDRegistryChangeInStorage is DIDRegistry {

    // New variables should be added after the last variable
    // Old variables should be kept even if unused
    // https://github.com/jackandtheblockstalk/upgradeable-proxy#331-you-can-1
    mapping(bytes32 => uint256) public timeOfRegister;
}
