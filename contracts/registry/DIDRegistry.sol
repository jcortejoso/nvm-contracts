pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import './DIDFactory.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155BurnableUpgradeable.sol';

/**
 * @title Mintable DID Registry
 * @author Keyko
 *
 * @dev Implementation of a Mintable DID Registry.
 */
contract DIDRegistry is DIDFactory, ERC1155BurnableUpgradeable {
    
    modifier nftIsInitialized(bytes32 _did)
    {
        require(
            didRegisterList.didRegisters[_did].nftInitialized,
            'The NFTs needs to be initialized'
        );
        _;
    }
    //////////////////////////////////////////////////////////////
    ////////  EVENTS  ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////


    /**
     * @dev DIDRegistry Initializer
     *      Initialize Ownable. Only on contract creation.
     * @param _owner refers to the owner of the contract.
     */
    function initialize(
        address _owner
    )
    public
    override
    initializer
    {
        OwnableUpgradeable.__Ownable_init();
        ERC1155BurnableUpgradeable.__ERC1155Burnable_init();
        transferOwnership(_owner);
    }

    /**
     * @notice Register a Mintable DID.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
     * @param _cap refers to the mint cap
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     * @param _activityId refers to activity
     * @param _attributes refers to the provenance attributes     
     * @return size refers to the size of the registry after the register action.
     */
    function registerMintableDID(
        bytes32 _did,
        bytes32 _checksum,
        address[] memory _providers,
        string memory _url,
        uint256 _cap,
        uint256 _royalties,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    onlyValidAttributes(_attributes)
    returns (uint size)
    {
        uint result = registerDID(_did, _checksum, _providers, _url, _activityId, _attributes);
        enableDidNft(_did, _cap, _royalties);
        return result;
    }    
    
    /**
     * @notice enableDidNft creates the initial setup of NFTs minting and royalties distribution.
     * After this initial setup, this data can't be changed anymore for the DID given, even for the owner of the DID.
     * The reason of this is to avoid minting additional NFTs after the initial agreement, what could affect the 
     * valuation of NFTs of a DID already created.
      
     * @dev update the DID registry providers list by adding the mintCap and royalties configuration
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _cap refers to the mint cap
     * @param _royalties refers to the royalties to reward to the DID creator in the secondary market
     */
    function enableDidNft(
        bytes32 _did,
        uint256 _cap,
        uint256 _royalties
    )
    public
    onlyDIDOwner(_did)
    returns (bool success)
    {
        didRegisterList.initializeNftConfig(_did, _cap, _royalties);
        // TODO: Here is necessary to mint & lock the NFTs in the NFTKLockRewardCondition contract
        // mint()
        // lockNft()
        
        return super.used(
            keccak256(abi.encodePacked(_did, _cap, _royalties, msg.sender)),
            _did, msg.sender, keccak256('enableDidNft'), '', 'nft initialization');
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
                didRegisterList.didRegisters[_did].nftSupply + _amount <= didRegisterList.didRegisters[_did].mintCap,
                'The minted request exceeds the cap'
            );
        }
        
        super._mint(msg.sender, uint256(_did), _amount, '');
        didRegisterList.didRegisters[_did].nftSupply += _amount;
        
        super.used(
            keccak256(abi.encodePacked(_did, msg.sender, 'mint', _amount, block.number)),
            _did, msg.sender, keccak256('mint'), '', 'mint');
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

        super._burn(msg.sender, uint256(_did), _amount);
        didRegisterList.didRegisters[_did].nftSupply -= _amount;

        super.used(
            keccak256(abi.encodePacked(_did, msg.sender, 'burn', _amount, block.number)),
            _did, msg.sender, keccak256('burn'), '', 'burn');
    }
    

    /**
     * @dev Returns the amount of tokens of token type `id` owned by `account`.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, bytes32 _did) 
    external 
    view 
    returns (uint256)   {
        return balanceOf(account, uint256(_did));
    }
    
}
