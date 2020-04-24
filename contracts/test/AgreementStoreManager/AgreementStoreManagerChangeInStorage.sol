pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../agreements/AgreementStoreManager.sol';


contract AgreementStoreManagerChangeInStorage is AgreementStoreManager {

    // New variables should be added after the last variable
    // Old variables should be kept even if unused
    // No base contracts swap
    // https://github.com/jackandtheblockstalk/upgradeable-proxy#331-you-can-1
    uint256 public AgreementCount;
}
