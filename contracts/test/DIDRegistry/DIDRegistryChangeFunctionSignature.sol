pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../registry/DIDRegistry.sol';

contract DIDRegistryChangeFunctionSignature is DIDRegistry {

    // swap _checksum with _did
    function registerAttribute (
        bytes32 _did,
        address[] memory _providers,
        bytes32 _checksum,
        string memory _url,
        bytes32 _activityId,
        string memory _attributes
    )
        public
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
        for(uint256 i = 0; i < _providers.length; i++) {
            didRegisterList.addProvider(_did, _providers[i]);
        }

        emit DIDAttributeRegistered(
            _did,
            didRegisterList.didRegisters[_did].owner,
            _checksum,
            _url,
            msg.sender,
            block.number
        );

        wasGeneratedBy(
            _did, _did, msg.sender, _activityId, _attributes);
        
        return getDIDRegistrySize();
    }
}
