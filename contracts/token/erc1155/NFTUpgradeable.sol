// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

/**
 *
 * @dev Implementation of the basic standard multi-token.
 * See https://eips.ethereum.org/EIPS/eip-1155
 */
contract NFTUpgradeable is ERC1155Upgradeable, OwnableUpgradeable, AccessControlUpgradeable {

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
    function initialize(string memory uri_) public initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC1155_init_unchained(uri_);
        __Ownable_init_unchained();
        AccessControlUpgradeable.__AccessControl_init();
        AccessControlUpgradeable._setupRole(MINTER_ROLE, msg.sender);
//        setProxyApproval(msg.sender, true);
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

    function mint(address to, uint256 id, uint256 amount, bytes memory data) public {
        require(hasRole(MINTER_ROLE, msg.sender), 'only minter can mint');
        _mint(to, id, amount, data);
    }

    function burn(address to, uint256 id, uint256 amount) public {
        require(hasRole(MINTER_ROLE, msg.sender), 'only minter can burn');
        _burn(to, id, amount);
    }

    function addMinter(address account) public onlyOwner {
        AccessControlUpgradeable._setupRole(MINTER_ROLE, account);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlUpgradeable, ERC1155Upgradeable) returns (bool) {
        return AccessControlUpgradeable.supportsInterface(interfaceId)
        || ERC1155Upgradeable.supportsInterface(interfaceId);
    }

}
