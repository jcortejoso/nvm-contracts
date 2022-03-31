pragma solidity ^0.8.0;
// Copyright 2022 Nevermined AG.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

abstract contract INeverminedConfig {

    event NeverminedConfigChange(
        address indexed _whoChanged,
        bytes32 indexed _parameter
    );

    function initialize(uint8 _marketplaceFee, address _feeReceiver) virtual external;
    
    function setMarketplaceFee(uint8 _marketplaceFee) virtual external;

    function setFeeReceiver(address _feeReceiver) virtual external;
}
