pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './DIDFactory.sol';
import '../token/erc1155/NFTUpgradeable.sol';
import '../token/erc721/NFT721Upgradeable.sol';

/**
 * @title Mintable DID Registry
 * @author Keyko
 *
 * @dev Implementation of a Mintable DID Registry.
 */
contract DIDRegistry is DIDFactory {

    using DIDRegistryLibrary for DIDRegistryLibrary.DIDRegisterList;
    using SafeMathUpgradeable for uint256;

    NFTUpgradeable public erc1155;
    NFT721Upgradeable public erc721;

    //////////////////////////////////////////////////////////////
    ////////  EVENTS  ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    
    /**
     * @dev DIDRegistry Initializer
     *      Initialize Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract.
     */
    function initialize(
        address _owner,
        address _erc1155,
        address _erc721
    )
    public
    initializer
    {
        OwnableUpgradeable.__Ownable_init();
        erc1155 = NFTUpgradeable(_erc1155);
        erc721 = NFT721Upgradeable(_erc721);
        transferOwnership(_owner);
        manager = _owner;
    }

    /**
     * @notice Register a Mintable DID.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _didSeed refers to decentralized identifier seed (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _providers list of addresses that can act as an asset provider     
     * @param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
     * @param _cap refers to the mint cap
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     * @param _mint if true it mints the ERC-1155 NFTs attached to the asset
     * @param _activityId refers to activity
     * @param _nftMetadata refers to the url providing the NFT Metadata     
     * @return size refers to the size of the registry after the register action.
     */
    function registerMintableDID(
        bytes32 _didSeed,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _url,
        uint256 _cap,
        uint8 _royalties,
        bool _mint,
        bytes32 _activityId,
        string memory _nftMetadata
    )
    public
    onlyValidAttributes(_nftMetadata)
    returns (uint size)
    {
        uint result = registerDID(_didSeed, _checksum, _providers, _url, _activityId, '');
        enableAndMintDidNft(
            hashDID(_didSeed, msg.sender),
            _cap,
            _royalties,
            _mint
        );
        return result;
    }    
    
    /**
     * @notice Register a Mintable DID.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _didSeed refers to decentralized identifier seed (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _providers list of addresses that can act as an asset provider     
     * @param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
     * @param _cap refers to the mint cap
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     * @param _activityId refers to activity
     * @param _nftMetadata refers to the url providing the NFT Metadata     
     * @return size refers to the size of the registry after the register action.
     */
    function registerMintableDID(
        bytes32 _didSeed,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _url,
        uint256 _cap,
        uint8 _royalties,
        bytes32 _activityId,
        string memory _nftMetadata
    )
    public
    onlyValidAttributes(_nftMetadata)
    returns (uint size)
    {
        return registerMintableDID(
            _didSeed, _checksum, _providers, _url, _cap, _royalties, false, _activityId, _nftMetadata);
    }

    
    /**
     * @notice enableDidNft creates the initial setup of NFTs minting and royalties distribution for ERC-1155 NFTs.
     * After this initial setup, this data can't be changed anymore for the DID given, even for the owner of the DID.
     * The reason of this is to avoid minting additional NFTs after the initial agreement, what could affect the 
     * valuation of NFTs of a DID already created.
      
     * @dev update the DID registry providers list by adding the mintCap and royalties configuration
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _cap refers to the mint cap
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     * @param _mint if is true mint directly the amount capped tokens and lock in the _lockAddress
     * @param _nftMetadata refers to the url providing the NFT Metadata          
     */
    function enableAndMintDidNft(
        bytes32 _did,
        uint256 _cap,
        uint8 _royalties,
        bool _mint,
        string memory _nftMetadata
    )
    public
    onlyDIDOwner(_did)
    returns (bool success)
    {
        didRegisterList.initializeNftConfig(_did, _cap, _royalties);
        
        if (_royalties > 0)
            erc1155.setTokenRoyalty(uint256(_did), msg.sender, _royalties);
        
        if (_mint)
            mint(_did, _cap);
        
        return super.used(
            keccak256(abi.encode(_did, _cap, _royalties, msg.sender)),
            _did, msg.sender, keccak256('enableNft'), '', 'nft initialization');
    }

    /**
     * @notice enableAndMintDidNft721 creates the initial setup of NFTs minting and royalties distribution for ERC-721 NFTs.
     * After this initial setup, this data can't be changed anymore for the DID given, even for the owner of the DID.
     * The reason of this is to avoid minting additional NFTs after the initial agreement, what could affect the 
     * valuation of NFTs of a DID already created.
      
     * @dev update the DID registry providers list by adding the mintCap and royalties configuration
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     * @param _mint if is true mint directly the amount capped tokens and lock in the _lockAddress
     * @param _nftMetadata refers to the url providing the NFT Metadata          
     */    
    function enableAndMintDidNft721(
        bytes32 _did,
        uint8 _royalties,
        bool _mint,
        string memory _nftMetadata
    )
    public
    onlyDIDOwner(_did)
    returns (bool success)
    {
        didRegisterList.initializeNft721Config(_did, _royalties);

        if (_royalties > 0)
            erc721.setTokenRoyalty(uint256(_did), msg.sender, _royalties);
        
        if (_mint)
            mint721(_did);
        
        return super.used(
            keccak256(abi.encode(_did, 1, _royalties, msg.sender)),
            _did, msg.sender, keccak256('enableNft721'), '', 'nft initialization');
    }

    /**
     * @notice Mints a NFT associated to the DID
     *
     * @dev Because ERC-1155 uses uint256 and DID's are bytes32, there is a conversion between both
     *      Only the DID owner can mint NFTs associated to the DID
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _amount amount to mint
     */    
    function mint(
        bytes32 _did,
        uint256 _amount
    )
    public
    onlyDIDOwner(_did)
    nftIsInitialized(_did)
    {
        if (didRegisterList.didRegisters[_did].mintCap > 0) {
            require(
                didRegisterList.didRegisters[_did].nftSupply.add(_amount) <= didRegisterList.didRegisters[_did].mintCap,
                'Cap exceeded'
            );
        }
        
        didRegisterList.didRegisters[_did].nftSupply = didRegisterList.didRegisters[_did].nftSupply.add(_amount);
        
        super.used(
            keccak256(abi.encode(_did, msg.sender, 'mint', _amount, block.number)),
            _did, msg.sender, keccak256('mint'), '', 'mint');

        erc1155.mint(msg.sender, uint256(_did), _amount, '');
    }

    function mint721(
        bytes32 _did
    )
    public
    onlyDIDOwner(_did)
    nft721IsInitialized(_did)
    {
        super.used(
            keccak256(abi.encode(_did, msg.sender, 'mint721', 1, block.number)),
            _did, msg.sender, keccak256('mint721'), '', 'mint721');

        erc721.mint(msg.sender, uint256(_did));
    }

    /**
     * @notice Burns NFTs associated to the DID
     *
     * @dev Because ERC-1155 uses uint256 and DID's are bytes32, there is a conversion between both
     *      Only the DID owner can burn NFTs associated to the DID
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _amount amount to burn
     */
    function burn(
        bytes32 _did,
        uint256 _amount
    )
    public
    onlyDIDOwner(_did)
    nftIsInitialized(_did)
    {
        erc1155.burn(msg.sender, uint256(_did), _amount);
        didRegisterList.didRegisters[_did].nftSupply -= _amount;

        super.used(
            keccak256(abi.encode(_did, msg.sender, 'burn', _amount, block.number)),
            _did, msg.sender, keccak256('burn'), '', 'burn');
    }

    function burn721(
        bytes32 _did
    )
    public
    onlyDIDOwner(_did)
    nft721IsInitialized(_did)
    {
        erc721.burn(uint256(_did));

        super.used(
            keccak256(abi.encode(_did, msg.sender, 'burn721', 1, block.number)),
            _did, msg.sender, keccak256('burn721'), '', 'burn721');
    }

}
