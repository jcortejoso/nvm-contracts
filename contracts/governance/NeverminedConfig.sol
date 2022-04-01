pragma solidity ^0.8.0;
// Copyright 2022 Nevermined AG.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import './ConfigStorageV1.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

contract NeverminedConfig is 
    Initializable,
    AccessControlUpgradeable,
    OwnableUpgradeable, 
    ConfigStorageV1 
{
    
    function initialize(
        address _owner,
        address _governor
    )
    public
    override
    initializer
    {
        __Ownable_init();
        transferOwnership(_owner);

        AccessControlUpgradeable.__AccessControl_init();
        AccessControlUpgradeable._setupRole(DEFAULT_ADMIN_ROLE, _owner);
        AccessControlUpgradeable._setupRole(GOVERNOR_ROLE, _governor);
    }
    
    function setMarketplaceFees(
        uint256 _marketplaceFee,
        address _feeReceiver
    )
    external
    virtual
    override
    onlyGovernor(msg.sender)
    {
        require(
            _marketplaceFee >=0 && _marketplaceFee <= 10000,
            'NeverminedConfig: Fee must be between 0 and 100 percent'
        );
        
        if (_marketplaceFee > 0)    {
            require(
                _feeReceiver != address(0),
                'NeverminedConfig: Receiver can not be 0x0'
            );            
        }

        marketplaceFee = _marketplaceFee;
        feeReceiver = _feeReceiver;
        emit NeverminedConfigChange(msg.sender, keccak256('marketplaceFee'));
        emit NeverminedConfigChange(msg.sender, keccak256('feeReceiver'));
    }
    
    function isGovernor(
        address _address
    )
    external
    view
    override
    returns (bool)
    {
        return hasRole(GOVERNOR_ROLE, _address);
    }

    function getMarketplaceFee()
    external
    view
    override 
    returns (uint256) 
    {
        return marketplaceFee;
    }

    function getFeeReceiver()
    external
    view
    override 
    returns (address)
    {
        return feeReceiver;
    }
    
    modifier onlyGovernor(address _address)
    {
        require(
            hasRole(GOVERNOR_ROLE, _address),
            'NeverminedConfig: Only governor'
        );
        _;
    }    
    
}
