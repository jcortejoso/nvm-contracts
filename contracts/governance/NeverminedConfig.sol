pragma solidity ^0.8.0;
// Copyright 2022 Nevermined AG.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./ConfigStorageV1.sol";

contract NeverminedConfig is 
    Initializable, 
    OwnableUpgradeable, 
    ConfigStorageV1 
{

    /**
     * @notice Used to initialize the contract during delegator constructor
     * @param _marketplaceFee The fee to be charged by Nevermined
     * @param _feeReceiver The address receiving the fees
     */    
    function initialize(
        uint8 _marketplaceFee, 
        address _feeReceiver
    )
    public
    override
    initializer
    {
        __Ownable_init();
        
        marketplaceFee = _marketplaceFee;
        feeReceiver = _feeReceiver;
    }

    /**
     * @notice The owner can update the Nevermined Marketplace fee
     * @param _marketplaceFee new marketplace fee 
     */
    function setMarketplaceFee(
        uint8 _marketplaceFee
    ) 
    external 
    virtual 
    override 
    onlyOwner 
    {
        require(
            _marketplaceFee >=0 && _marketplaceFee <= 10000, 
                'NeverminedConfig: Fee must be between 0 and 100 percent'
        );
        marketplaceFee = _marketplaceFee;
        emit NeverminedConfigChange(msg.sender, keccak256('marketplaceFee'));
    }

    /**
     * @notice The account receiving the Marketplace fees
     * @param _feeReceiver The address receiving thefee 
     */
    function setFeeReceiver(
        address _feeReceiver
    )
    external
    virtual
    override
    onlyOwner
    {
        require(
            _feeReceiver != address(0),
            'NeverminedConfig: Receiver can not be 0x0'
        );
        feeReceiver = _feeReceiver;
        emit NeverminedConfigChange(msg.sender, keccak256('feeReceiver'));
    }    
    
}
