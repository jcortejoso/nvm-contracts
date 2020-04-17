pragma solidity 0.5.6;

import '../../../contracts/OceanToken.sol';

contract TEST is OceanToken {

  address testerAddr = address(0x1);
  address otherAddr = address(0x2);
  address deployerAddr = address(0x3);
  uint initial_totalSupply = 1000000000;

  constructor() public {
    initialize(address(this), deployerAddr);
    mint(testerAddr, initial_totalSupply/2);
    mint(otherAddr, initial_totalSupply/2);
    require(initial_totalSupply == totalSupply());
  }

  function echidna_max_balance() public returns (bool) {
    return (balanceOf(testerAddr) <= initial_totalSupply/2 && balanceOf(otherAddr) >= initial_totalSupply/2);
  }
  
  function echidna_no_burn_using_zero() public returns (bool) {
    return (balanceOf(address(0x0)) == 0);
  }
 
  function echidna_self_transfer() public returns (bool) {
    uint balance = balanceOf(testerAddr);
    bool b = transfer(testerAddr,balance);
    return (balanceOf(testerAddr) == balance && b);
  }

  function echidna_zero_transfer() public returns (bool) {
    return (transfer(otherAddr,0));
  }

  function echidna_fixed_supply() public returns (bool) {
    return (totalSupply() == initial_totalSupply);
  }

  function echidna_self_approve_and_self_transferFrom() public returns (bool) {
    uint balance = balanceOf(testerAddr);
    approve(testerAddr, 0);
    approve(testerAddr, balance);
    return (transferFrom(testerAddr,testerAddr,balance));
  }

  function echidna_self_approve_and_transferFrom() public returns (bool) {
    uint balance = balanceOf(testerAddr);
    approve(testerAddr, 0);
    approve(testerAddr, balance);
    return (transferFrom(testerAddr,otherAddr,balance));
  } 
  
}
