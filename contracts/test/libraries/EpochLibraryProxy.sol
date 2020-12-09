pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../libraries/EpochLibrary.sol';


contract EpochLibraryProxy {

    using EpochLibrary for EpochLibrary.EpochList;
    using EpochLibrary for EpochLibrary.Epoch;

    EpochLibrary.Epoch epoch;
    EpochLibrary.EpochList epochList;

    function create(
        bytes32 _id,
        uint256 _timeLock,
        uint256 _timeOut
    )
        external
    {
        epochList.create(
            _id,
            _timeLock,
            _timeOut
        );
    }
}
