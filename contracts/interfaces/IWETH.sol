// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

interface IWETH {
    function withdraw(uint256) external;

    function balanceOf(address) external view returns (uint256);

    function deposit() external payable;

    function approve(address _spender, uint256 _value) external returns (bool success);
}