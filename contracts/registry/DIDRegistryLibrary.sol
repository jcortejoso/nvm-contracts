pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

/**
 * @title DID Registry Library
 * @author Ocean Protocol Team
 *
 * @dev All function calls are currently implemented without side effects
 */
library DIDRegistryLibrary {

    struct DIDRegister {
        address owner;
        bytes32 lastChecksum;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
        address[] providers;
    }

    struct DIDRegisterList {
        mapping(bytes32 => DIDRegister) didRegisters;
        bytes32[] didRegisterIds;
    }

   /**
    * @notice update the DID store
    * @dev access modifiers and storage pointer should be implemented in DIDRegistry
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _checksum includes a one-way HASH calculated using the DDO content
    */
    function update(
        DIDRegisterList storage _self,
        bytes32 _did,
        bytes32 _checksum
    )
        external
        returns (uint size)
    {
        address didOwner = _self.didRegisters[_did].owner;

        if (didOwner == address(0)) {
            didOwner = msg.sender;
            _self.didRegisterIds.push(_did);
        }

        _self.didRegisters[_did] = DIDRegister({
            owner: didOwner,
            lastChecksum: _checksum,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            providers: new address[](0)
        });

        return _self.didRegisterIds.length;
    }

   /**
    * @notice addProvider add provider to DID registry
    * @dev update the DID registry providers list by adding a new provider
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param provider the provider's address 
    */
    function addProvider(
        DIDRegisterList storage _self,
        bytes32 _did,
        address provider
    )
        internal
    {
        require(
            provider != address(0),
            'Invalid asset provider address'
        );

        require(
            provider != address(this),
            'DID provider should not be this contract address'
        );

        if (!isProvider(_self, _did, provider)) {
            _self.didRegisters[_did].providers.push(provider);
        }

    }

   /**
    * @notice removeProvider remove provider from DID registry
    * @dev update the DID registry providers list by removing an existing provider
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _provider the provider's address 
    */
    function removeProvider(
        DIDRegisterList storage _self,
        bytes32 _did,
        address _provider
    )
        internal
        returns(bool)
    {
        require(
            _provider != address(0),
            'Invalid asset provider address'
        );

        int256 i = getProviderIndex(_self, _did, _provider);

        if (i == -1) {
            return false;
        }

        delete _self.didRegisters[_did].providers[uint256(i)];

        return true;
    }

   /**
    * @notice updateDIDOwner transfer DID ownership to a new owner
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _newOwner the new DID owner address
    */
    function updateDIDOwner(
        DIDRegisterList storage _self,
        bytes32 _did,
        address _newOwner
    )
        internal
    {
        require(
            _newOwner != address(0),
            'Invalid new DID owner address'
        );
        _self.didRegisters[_did].owner = _newOwner;
    }
    
   /**
    * @notice isProvider check whether DID provider exists
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _provider the provider's address 
    * @return true if the provider already exists
    */
    function isProvider(
        DIDRegisterList storage _self,
        bytes32 _did,
        address _provider
    )
        public
        view
        returns(bool)
    {
        int256 i = getProviderIndex(_self, _did, _provider);

        if (i == -1) {
            return false;
        }

        return true;
    }

   /**
    * @notice getProviderIndex get the index of a provider
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param provider the provider's address 
    * @return the index if the provider exists otherwise return -1
    */
    function getProviderIndex(
        DIDRegisterList storage _self,
        bytes32 _did,
        address provider
    )
        private
        view
        returns(int256 )
    {
        for (uint256 i = 0;
            i < _self.didRegisters[_did].providers.length; i++) {
            if (provider == _self.didRegisters[_did].providers[i]) {
                return int(i);
            }
        }

        return - 1;
    }
}
