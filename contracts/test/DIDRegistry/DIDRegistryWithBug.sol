pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

// Contain upgraded version of the contracts for test
import '../../registry/DIDFactory.sol';

contract DIDRegistryWithBug is DIDFactory {

    /**
     * @notice registerAttribute is called only by DID owner.
     * @dev this function registers DID attributes
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _checksum includes a one-way HASH calculated using the DDO content    
     * @param _url refers to the attribute value
     */
    function registerAttribute (
        bytes32 _checksum,
        bytes32 _did,
        address[] memory _providers,
        string memory _url
    )
    public
    override
    returns (uint size)
    {
        require(
            didRegisterList.didRegisters[_did].owner == address(0x0) ||
            didRegisterList.didRegisters[_did].owner == msg.sender,
            'Attributes must be registered by the DID owners.'
        );

        require(
        //TODO: 2048 should be changed in the future
            bytes(_url).length <= 2048,
            'Invalid value size'
        );

        didRegisterList.update(_did, _checksum, _url);

        // push providers to storage
        for(uint256 i = 0; i < _providers.length; i++){
            didRegisterList.addProvider(_did, _providers[i]);
        }

        // add bug here
        didRegisterList.didRegisters[_did].blockNumberUpdated = 42;

        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum, 
            _url,
            msg.sender,
            block.number
        );
        
        return getDIDRegistrySize();
    }
  
}
