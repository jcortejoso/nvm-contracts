pragma solidity 0.5.6;
// Copyright 2020 Keyko GmbH
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title String Utils library
 * @author Keyko
 * @dev Implementation of string & bytes utilities functions
 */

library StringUtilsLibrary {


    /**
    * @dev Converts a bytes32 (fixed-size array) to bytes (dynamically-sized array)
    * @param _bytes32 the bytes32 param
    * @return the converted bytes
    */
    function bytes32ToBytes(bytes32 _bytes32) internal pure returns (bytes memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return bytesArray;
    }
    
}
