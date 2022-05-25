pragma solidity ^0.8.0;
// Copyright 2021 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title Interface for different royalty schemes.
 * @author Nevermined
 */
interface IRoyaltyRecipient {
    function transfer(
        address _tokenContract,
        uint256 amount
        /*
        address _contract,
        bytes32 id,
        uint256 price,
        bytes memory param */
    ) external view returns (uint256);
}


