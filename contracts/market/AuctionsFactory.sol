pragma solidity ^0.8.0;
// Copyright 2021 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '../interfaces/IDynamicPricing.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';


/**
 * @title Interface that can implement different contracts implementing some kind of 
 * dynamic pricing functionality.
 * @author Keyko
 */

contract AuctionsFactory is IDynamicPricing, Initializable, OwnableUpgradeable {

    bytes32 constant public PRICING_TYPE = keccak256('RegularAuction');

    struct Auction {
        // Asset associated to the auction
        bytes32 did;
        // State of the auction
        DynamicPricingState state;
        // Who created the auction
        address creator;
        // When was created
        uint256 blockNumberCreated;
        // Price floor
        uint256 floor;
        // When this auction starts
        uint256 starts;
        // When this auction ends
        uint256 ends;
        // Who is the winner of the auction
        address whoCanClaim;
        // IPFS hash
        bytes32 hash;
    }
    
    struct AuctionsList {
        mapping(bytes32 => Auction) auctions;
    }
    
    event AuctionCreated(
        bytes32 indexed auctionId,
        bytes32 indexed did,
        address indexed creator,
        uint256 blockNumberCreated,
        uint256 floor,
        uint256 starts,
        uint256 ends
    );
    
    /**
     * @notice initialize init the contract with the following parameters
     * @param _owner contract's owner account address
     */
    function initialize(
        address _owner
    )
    external
    initializer()
    {
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
    }
    
    function create(
        bytes32 _auctionId,
        bytes32 _did,
        uint256 _floor,
        uint256 _starts,
        uint256 _ends,
        bytes32 _hash
    )
    external
    {
        require(_starts > block.number, 'AuctionsFactory: Can not start in the past');
        require(_ends > _starts, 'AuctionsFactory: Must last at least one block');
        
        auctions[_auctionId] = Auction({
            did: _did,
            state: DynamicPricingState.NotStarted,
            creator: msg.sender,
            blockNumberCreated: block.number,
            floor: _floor,
            starts: _starts,
            ends: _ends,
            whoCanClaim: address(0),
            hash: _hash
        });
        
        emit AuctionCreated(
            _auctionId,
            _did,
            msg.sender,
            block.number,
            _floor,
            _starts,
            _ends
        ); 
    }
    
    function placeBid(
        bytes32 _auctionId 
    )
    external
    onlyNotCreator
    onlyAfterStart
    onlyBeforeEnd
    {}    

    modifier onlyCreator(bytes32 _auctionId) {
        require(msg.sender == auctions[_auctionId].creator, 'AuctionsFactory: Only owner');
        _;
    }
    
    modifier onlyNotCreator(bytes32 _auctionId) {
        require(msg.sender != auctions[_auctionId].creator, 'AuctionsFactory: Not creator');
        _;
    }
    
    modifier onlyAfterStart(bytes32 _auctionId) {
        require(block.number > auctions[_auctionId].starts, 'AuctionsFactory: Only after starts');
        _;
    }

    modifier onlyBeforeEnd(bytes32 _auctionId) {
        require(block.number < auctions[_auctionId].ends, 'AuctionsFactory: Only before ends');
        _;
    }
    
    modifier onlyNotAborted(bytes32 _auctionId) {
        require(auctions[_auctionId].state != DynamicPricingState.Aborted , 'AuctionsFactory: Only not aborted');
        _;
    }

    
}
