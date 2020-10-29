pragma solidity 0.5.6;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


/**
 * @title Provenance Registry Library
 * @author Keyko
 *
 * @dev All function calls are currently implemented without side effects
 */
library ProvenanceRegistryLibrary {

    struct ProvenanceRegister {
        address owner;
        address agentId;
        address agentInvolvedId;
        bytes32 activityId;
        address lastUpdatedBy;
        uint256 blockNumberUpdated;
        address[] delegates;
    }


    struct ProvenanceRegisterList {
        mapping(bytes32 => ProvenanceRegister) provenanceRegisters;
        bytes32[] provenanceRegisterIds;
    }

   /**
    * @notice update the Provenance store
    * @dev access modifiers and storage pointer should be implemented in ProvenanceRegistry
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _agentId refers to address of the agent triggering the activity
    * @param _agentInvolvedId refers to address of the agent involved with the activity
    * @param _activityId includes a one-way HASH calculated using the activity description
    */
    function create(
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address _agentId,
        address _agentInvolvedId,
        bytes32 _activityId
    )
        external
        returns (uint size)
    {
        require(
            _self.provenanceRegisters[_did].owner == address(0x0),
            'Provenance record already existing for the DID given.'
        );


        _self.provenanceRegisterIds.push(_did);

        _self.provenanceRegisters[_did] = ProvenanceRegister({
            owner: msg.sender,
            agentId: _agentId,
            agentInvolvedId: _agentInvolvedId,
            activityId: _activityId,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            delegates: new address[](0)
        });

        return _self.provenanceRegisterIds.length;
    }


   /**
    * @notice update the Provenance store
    * @dev access modifiers and storage pointer should be implemented in ProvenanceRegistry
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _agentId refers to address of the agent triggering the activity
    * @param _agentInvolvedId refers to address of the agent involved with the activity
    * @param _activityId includes a one-way HASH calculated using the activity description
    */
    function update(
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address _agentId,
        address _agentInvolvedId,
        bytes32 _activityId
    )
        external
        returns (uint size)
    {
        address didOwner = _self.provenanceRegisters[_did].owner;

        if (didOwner == address(0)) {
            didOwner = msg.sender;
            _self.provenanceRegisterIds.push(_did);
        }

        _self.provenanceRegisters[_did] = ProvenanceRegister({
            owner: didOwner,
            agentId: _agentId,
            agentInvolvedId: _agentInvolvedId,
            activityId: _activityId,
            lastUpdatedBy: msg.sender,
            blockNumberUpdated: block.number,
            delegates: new address[](0)
        });

        return _self.provenanceRegisterIds.length;
    }

   /**
    * @notice addDelegate add a delegate to Provenance registry
    * @dev update the Provenance registry delegates list by adding a new delegate
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param delete the delegates's address 
    */
    function addDelegate(
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address delegate
    )
        internal
    {
        require(
            delegate != address(0),
            'Invalid asset delegate address'
        );

        require(
            delegate != address(this),
            'DID delegate should not be this contract address'
        );

        if (!isProvider(_self, _did, delegate)) {
            _self.providerRegisters[_did].delegates.push(delegate);
        }

    }

   /**
    * @notice removeDelegate remove delegate from Provenance registry
    * @dev update the Provenance registry delegates list by removing an existing delegate
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _delegate the delegate's address 
    */
    function removeDelegate(
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address _delegate
    )
        internal
        returns(bool)
    {
        require(
            _delegate != address(0),
            'Invalid provenance delegate address'
        );

        int256 i = getDelegateIndex(_self, _did, _delegate);

        if (i == -1) {
            return false;
        }

        delete _self.providerRegisters[_did].delegates[uint256(i)];

        return true;
    }

   /**
    * @notice updateProvenanceOwner transfer Provenance ownership to a new owner
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _newOwner the new DID owner address
    */
    function updateProvenanceOwner(
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address _newOwner
    )
        internal
    {
        require(
            _newOwner != address(0),
            'Invalid new Provenance owner address'
        );
        _self.didRegisters[_did].owner = _newOwner;
    }
    
   /**
    * @notice isDelegate check whether Provenance delegate exists
    * @param _self refers to storage pointer
    * @param _did refers to decentralized identifier (a byte32 length ID)
    * @param _delegate the provider's address 
    * @return true if the delegate already exists
    */
    function isProvider(
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address _delegate
    )
        public
        view
        returns(bool)
    {
        int256 i = getDelegateIndex(_self, _did, _delegate);

        if (i == -1) {
            return false;
        }

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
        ProvenanceRegisterList storage _self,
        bytes32 _did,
        address delegate
    )
        private
        view
        returns(int256 )
    {
        for (uint256 i = 0;
            i < _self.provenanceRegisters[_did].delegates.length; i++) {
            if (delegate == _self.provenanceRegisters[_did].delegate[i]) {
                return int(i);
            }
        }

        return - 1;
    }
}
