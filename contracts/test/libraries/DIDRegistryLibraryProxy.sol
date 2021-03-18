pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../../registry/DIDRegistryLibrary.sol';


contract DIDRegistryLibraryProxy {

    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegister;
    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;

    DIDRegistryLibrary.DIDRegister didRegister;
    DIDRegistryLibrary.DIDRegisterList didRegisterList;

    function areRoyaltiesValid(
        bytes32 _did,
        uint256[] memory _amounts,
        address[] memory _receivers
    )
    public
    view
    returns (bool) {
        return didRegisterList.areRoyaltiesValid(_did, _amounts, _receivers);
    }

    function updateDIDOwner(
        bytes32 _did,
        address _newOwner
    )
    public
    {
        return didRegisterList.updateDIDOwner(_did, _newOwner);
    }

    function update(
        bytes32 _did,
        bytes32 _checksum,
        string calldata _url
    )
    public
    returns (uint size)
    {
        return didRegisterList.update(_did, _checksum, _url);
    }

    function initializeNftConfig(
        bytes32 _did,
        uint256 _cap,
        uint8 _royalties
    )
    public
    {
        return didRegisterList.initializeNftConfig(_did, _cap, _royalties);
    }

    function getDIDInfo(
        bytes32 _did
    )
    public
    view
    returns (
        address owner,
        address creator,
        uint256 royalties
    )
    {
        owner = didRegisterList.didRegisters[_did].owner;
        creator = didRegisterList.didRegisters[_did].creator;
        royalties = didRegisterList.didRegisters[_did].royalties;
    }
}
