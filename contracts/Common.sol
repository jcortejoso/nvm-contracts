pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import '@openzeppelin/contracts-upgradeable/cryptography/ECDSAUpgradeable.sol';

/**
 * @title Common functions
 * @author Keyko
 */
contract Common {
   /**
    * @notice getCurrentBlockNumber get block number
    * @return the current block number
    */
    function getCurrentBlockNumber()
        external
        view
        returns (uint)
    {
        return block.number;
    }

    /**
     * @dev isContract detect whether the address is 
     *          is a contract address or externally owned account
     * @return true if it is a contract address
     */
    function isContract(address addr)
        public
        view
        returns (bool)
    {
        uint size;
        /* solium-disable-next-line security/no-inline-assembly */
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

    /**
    * @param _agentId The address of the agent
    * @param _hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    * @param _signature Signatures provided by the agent
    * @return true if the signature correspond to the agent address        
    */
    function provenanceSignatureIsCorrect(
        address _agentId,
        bytes32 _hash,
        bytes memory _signature
    )
    public
    pure
    returns(bool)
    {
        return ECDSAUpgradeable.recover(_hash, _signature) == _agentId;
    }
}
