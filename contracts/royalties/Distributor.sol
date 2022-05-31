pragma solidity ^0.8.0;
// Copyright 2021 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '../registry/DIDRegistry.sol';

contract Distributor is Initializable {
    // cond id, receiver, did
    mapping (bytes32 => bool) public used;
//    mapping (bytes32 => mapping(bytes32 => uint256)) public claimed;

    mapping (bytes32 => address[]) public receivers;

    DIDRegistry public registry;

    function initialize(address _registry) public initializer {
        registry = DIDRegistry(_registry);
    }

    // If receivers is changed, the unclaimed rewards will be divided only for first takers ...
    function setReceivers(bytes32 _did, address[] memory _addr) public {
        require(msg.sender == registry.getDIDCreator(_did), 'only owner can change');
        receivers[_did] = _addr;
    }

    function claimReward(address receiver, ) public {

    }

}
