pragma solidity ^0.8.0;

// Copyright 2022 Nevermined AG.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './INeverminedConfig.sol';

/**
 * @title Storage for Nevermined Configuration
 * @notice For future upgrades, do not change ConfigStorageV1. Create a new
 * contract which implements ConfigStorageV1 and following the naming convention
 * ConfigStorageVX
 */
abstract contract ConfigStorageV1 is INeverminedConfig {
    
    // @notice The fee charged by Nevermined for using the Service Agreements.
    // Integer representing a 2 decimal number. i.e 350 means a 3.5% fee
    uint8 public marketplaceFee;

    // @notice The address that will receive the fee charged by Nevermined per transaction
    // See `marketplaceFee`
    address public feeReceiver;    
    
}
