pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


/**
 * @title DID Registry Library
 * @author Keyko & Ocean Protocol
 *
 * @dev All function calls are currently implemented without side effects
 */
library DIDRegistryLibrary {

    // DIDRegistry Entity
    struct DIDRegister {
        // DIDRegistry entry owner
        address owner;
        // DIDRegistry original creator, this can't be modified after the asset is registered 
        address creator;        
        // Checksum associated to the DID
        bytes32 lastChecksum;
        // URL to the metadata associated to the DID
        string  url;
        // Who was the last one updated the entry
        address lastUpdatedBy;
        // When was the last time was updated
        uint256 blockNumberUpdated;
        // Providers able to manage this entry
        address[] providers;
        // Delegates able to register provenance events on behalf of the owner or providers
        address[] delegates;
        // The NFTs supply associated to the DID 
        uint256 nftSupply;        
        // The max number of NFTs associated to the DID that can be minted 
        uint256 mintCap;
        // The percent of the sale that is going back to the original `creator` in the secondary market  
        uint256 royalties;  
        // Flag to control if NFTs config was already initialized
        bool nftInitialized;
    }

    // List of DID's registered in the system
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
     * @param _url includes the url resolving to the DID Document (DDO)
     */
    function update(
        DIDRegisterList storage _self,
        bytes32 _did,
        bytes32 _checksum,
        string calldata _url
    )
    external
    returns (uint size)
    {
        address didOwner = _self.didRegisters[_did].owner;
        address creator = _self.didRegisters[_did].creator;
        
        if (didOwner == address(0)) {
            didOwner = msg.sender;
            _self.didRegisterIds.push(_did);
            creator = didOwner;
        }

        _self.didRegisters[_did] = DIDRegister({
            owner: didOwner,
            creator: creator,
            lastChecksum: _checksum,
            url: _url,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            providers: new address[](0),
            delegates: new address[](0),
            nftSupply: 0,
            mintCap: 0,
            royalties: 0,
            nftInitialized: false
        });

        return _self.didRegisterIds.length;
    }

    /**
     * @notice initializeNftConfig creates the initial setup of NFTs minting and royalties distribution.
     * After this initial setup, this data can't be changed anymore for the DID given, even for the owner of the DID.
     * The reason of this is to avoid minting additional NFTs after the initial agreement, what could affect the 
     * valuation of NFTs of a DID already created. 
     * @dev update the DID registry providers list by adding the mintCap and royalties configuration
     * @param _self refers to storage pointer
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _cap refers to the mint cap
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     *        The royalties in secondary market for the creator should be between 0% >= x < 100%
     */        
    function initializeNftConfig(
        DIDRegisterList storage _self,
        bytes32 _did,
        uint256 _cap,
        uint256 _royalties
    )
    internal
    {
        address didOwner = _self.didRegisters[_did].owner;
        require(didOwner != address(0), 'The DID is not stored');
        
        require(!_self.didRegisters[_did].nftInitialized, 'NFTs config only can be initialized once');
    
        require(_cap >= 0, 'The NFT cap must be higher or equal to 0');
    
        require(_royalties >= 0 && _royalties < 100, 'Invalid royalties number');

        _self.didRegisters[_did].mintCap = _cap;
        _self.didRegisters[_did].royalties = _royalties;
        _self.didRegisters[_did].nftInitialized = true;
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
        if (getProviderIndex(_self, _did, _provider) == -1)
            return false;
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

    //////////// DELEGATE METHODS

    /**
     * @notice addDelegate add delegate to DID registry
     * @dev update the DID registry delegates list by adding a new delegate
     * @param _self refers to storage pointer
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param delegate the delegate's address 
     */
    function addDelegate(
        DIDRegisterList storage _self,
        bytes32 _did,
        address delegate
    )
    internal
    {
        require(
            delegate != address(0),
            'Invalid provenance delegate address'
        );

        require(
            delegate != address(this),
            'DID  provenance delegate should not be this contract address'
        );

        if (!isDelegate(_self, _did, delegate)) {
            _self.didRegisters[_did].delegates.push(delegate);
        }

    }

    /**
     * @notice removeDelegate remove delegate from DID registry
     * @dev update the DID registry delegates list by removing an existing delegate
     * @param _self refers to storage pointer
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _delegate the delegate's address 
     */
    function removeDelegate(
        DIDRegisterList storage _self,
        bytes32 _did,
        address _delegate
    )
    internal
    returns(bool)
    {
        require(
            _delegate != address(0),
            'Invalid asset delegate address'
        );

        int256 i = getDelegateIndex(_self, _did, _delegate);

        if (i == -1) {
            return false;
        }

        delete _self.didRegisters[_did].delegates[uint256(i)];

        return true;
    }

    /**
     * @notice isDelegate check whether DID delegate exists
     * @param _self refers to storage pointer
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _delegate the delegate's address 
     * @return true if the delegate already exists
     */
    function isDelegate(
        DIDRegisterList storage _self,
        bytes32 _did,
        address _delegate
    )
    public
    view
    returns(bool)
    {
        if (getDelegateIndex(_self, _did, _delegate) == -1)
            return false;
        return true;
    }

    /**
     * @notice getDelegateIndex get the index of a delegate
     * @param _self refers to storage pointer
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param delegate the delegate's address 
     * @return the index if the delegate exists otherwise return -1
     */
    function getDelegateIndex(
        DIDRegisterList storage _self,
        bytes32 _did,
        address delegate
    )
    private
    view
    returns(int256 )
    {
        for (uint256 i = 0;
            i < _self.didRegisters[_did].delegates.length; i++) {
            if (delegate == _self.didRegisters[_did].delegates[i]) {
                return int(i);
            }
        }

        return - 1;
    }

}
