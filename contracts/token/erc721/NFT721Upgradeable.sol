// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '../erc2981/ERC2981.sol';

/**
 *
 * @dev Implementation of the basic standard multi-token.
 */
contract NFT721Upgradeable is ERC721Upgradeable, ERC2981, OwnableUpgradeable, AccessControlUpgradeable {

    // Mapping from account to proxy approvals
    mapping (address => bool) private _proxyApprovals;

    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    
    /** 
     * Event for recording proxy approvals.
     */
    event ProxyApproval(address sender, address operator, bool approved);

    /**
     * @dev See {_setURI}.
     */
    // solhint-disable-next-line
    function initialize() public initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained('', '');
        __Ownable_init_unchained();
        AccessControlUpgradeable.__AccessControl_init();
        AccessControlUpgradeable._setupRole(MINTER_ROLE, msg.sender);
    }

    
    function setProxyApproval(address operator, bool approved) public onlyOwner virtual {
        _proxyApprovals[operator] = approved;
        emit ProxyApproval(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator) public view virtual override returns (bool) {
        return super.isApprovedForAll(account, operator) || _proxyApprovals[operator];
    }
    
    function addMinter(address account) public onlyOwner {
        AccessControlUpgradeable._setupRole(MINTER_ROLE, account);
    }    
    
    function mint(address to, uint256 id) public {
        require(hasRole(MINTER_ROLE, msg.sender), 'only minter can mint');
        _mint(to, id);
    }

    function burn(uint256 id) public {
        require(hasRole(MINTER_ROLE, msg.sender), 'only minter can burn');
        _burn(id);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }    
    
    /**
    * @dev Record the asset royalties
    * @param tokenId the id of the asset with the royalties associated
    * @param receiver the receiver of the royalties (the original creator)
    * @param royaltyAmount percentage (no decimals, between 0 and 100)    
    */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint256 royaltyAmount
    )
    public
    {
        require(hasRole(MINTER_ROLE, msg.sender), 'only minter');
        _setTokenRoyalty(tokenId, receiver, royaltyAmount);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) 
    public 
    view 
    virtual 
    override(AccessControlUpgradeable, ERC721Upgradeable, ERC2981) 
    returns (bool) 
    {
        return AccessControlUpgradeable.supportsInterface(interfaceId)
        || ERC721Upgradeable.supportsInterface(interfaceId)
        || ERC2981.supportsInterface(interfaceId);
    }

}
