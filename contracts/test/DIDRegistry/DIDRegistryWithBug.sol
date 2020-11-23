pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../registry/DIDRegistry.sol';

contract DIDRegistryWithBug is DIDRegistry {

    /**
     * @notice Register DID attributes.
     *
     * @dev The first attribute of a DID registered sets the DID owner.
     *      Subsequent updates record _checksum and update info.
     *
     * @param _did refers to decentralized identifier (a bytes32 length ID).
     * @param _checksum includes a one-way HASH calculated using the DDO content.
     * @param _url refers to the url resolving the DID into a DID Document (DDO), limited to 2048 bytes.
     * @return the size of the registry after the register action.
     */
    function registerDID(
        bytes32 _checksum,
        bytes32 _did,
        address[] memory _providers,
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

        uint updatedSize = didRegisterList.update(_did, _checksum, _url);

        // push providers to storage
        for (uint256 i = 0; i < _providers.length; i++) {
            didRegisterList.addProvider(
                _did,
                _providers[i]
            );
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

        return updatedSize;
    }
}
