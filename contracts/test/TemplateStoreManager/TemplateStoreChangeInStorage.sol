pragma solidity 0.6.12;


import '../../templates/TemplateStoreManager.sol';

contract TemplateStoreChangeInStorage is TemplateStoreManager {

    // New variables should be added after the last variable
    // Old variables should be kept even if unused
    // No base contracts swap
    // https://github.com/jackandtheblockstalk/upgradeable-proxy#331-you-can-1
    uint public templateCount;
}
