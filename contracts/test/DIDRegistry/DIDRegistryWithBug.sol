pragma solidity 0.5.6;


// Contain upgraded version of the contracts for test
import '../../registry/DIDRegistry.sol';

contract DIDRegistryWithBug is DIDRegistry {

    /**
     * @notice registerAttribute is called only by DID owner.
     * @dev this function registers DID attributes
     * @param _did refers to decentralized identifier (a byte32 length ID)
     * @param _checksum includes a one-way HASH calculated using the DDO content
     * @param _activityId refers to activity
     * @param _attributes refers to the provenance attributes       
     * @param _url refers to the attribute value
     */
    function registerAttribute (
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

        didRegisterList.update(_did, _checksum, _url);

        // push providers to storage
        for(uint256 i = 0; i < _providers.length; i++){
            didRegisterList.addProvider(_did, _providers[i]);
        }

        // add bug here
        didRegisterList.didRegisters[_did].blockNumberUpdated = 42;

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

    /**
     * @notice Implements the W3C PROV Generation action
     *
     * @param _provId unique identifier referring to the provenance entry     
     * @param _did refers to decentralized identifier (a bytes32 length ID) of the entity created
     * @param _agentId refers to address of the agent creating the provenance record
     * @param _activityId refers to activity
     * @param _attributes refers to the provenance attributes
     * @return the number of the new provenance size
     */
    function wasGeneratedBy(
        bytes32 _provId,
        bytes32 _did,
        address _agentId,
        bytes32 _activityId,
        string memory _attributes
    )
    public
    onlyDIDOwner(_did)
    onlyValidAttributes(_attributes)
    returns (bool)
    {

        provenanceRegisterList.createProvenanceEvent(
            _provId,
            _did,
            NULL_B32,
            _agentId,
            _activityId,
            NULL_ADDRESS,
            uint8(ProvenanceMethod.WAS_GENERATED_BY),
            msg.sender,
            NULL_BYTES // No signatures between parties needed 
        );

        /* emitting _attributes here to avoid expensive storage */
        emit ProvenanceAttributeRegistered(
            _provId,
            _did,
            provenanceRegisterList.provenanceRegistry[_did].createdBy,
            _activityId,
            NULL_B32,
            NULL_ADDRESS,
            ProvenanceMethod.WAS_GENERATED_BY,
            _attributes,
            block.number
        );

        emit WasGeneratedBy(
            _did,
            provenanceRegisterList.provenanceRegistry[_did].createdBy,
            _activityId,
            _provId,
            _attributes,
            block.number
        );

        return true;
    }    
}
