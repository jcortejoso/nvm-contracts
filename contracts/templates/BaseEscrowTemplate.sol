pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './AgreementTemplate.sol';
import '../registry/DIDRegistry.sol';

contract BaseEscrowTemplate is AgreementTemplate {

    AgreementData internal agreementData;

    event AgreementCreated(
        bytes32 indexed _agreementId,
        bytes32 _did,
        address indexed _accessConsumer,
        address indexed _accessProvider,
        uint[]  _timeLocks,
        uint[]  _timeOuts
    );

    struct AgreementDataModel {
        address accessConsumer;
        address accessProvider;
    }

    struct AgreementData {
        mapping(bytes32 => AgreementDataModel) agreementDataItems;
        bytes32[] agreementIds;
    }
    

   /**
    * @notice createAgreement creates agreements through agreement template
    * @dev this function initializes the agreement by setting the DID,
    *       conditions ID, timeouts, time locks and the consumer address.
    *       The DID provider/owner is automatically detected by the DID
    *       Registry
    * @param _id SEA agreement unique identifier
    * @param _did Decentralized Identifier (DID)
    * @param _conditionIds conditions ID associated with the condition types
    * @param _timeLocks the starting point of the time window ,time lock is 
    *       in block number not seconds
    * @param _timeOuts the ending point of the time window ,time lock is 
    *       in block number not seconds
    * @param _accessConsumer consumer address
    * @return the agreement index
    */
    function createAgreement(
        bytes32 _id,
        bytes32 _did,
        bytes32[] memory _conditionIds,
        uint[] memory _timeLocks,
        uint[] memory _timeOuts,
        address _accessConsumer
    )
        public
        returns (uint size)
    {
        super.createAgreement(
            _id,
            _did,
            _conditionIds,
            _timeLocks,
            _timeOuts
        );

        address owner = address(0);
        address[] memory providers;
        
        DIDRegistry didRegistryInstance = DIDRegistry(
            agreementStoreManager.getDIDRegistryAddress()
        );
        
        (owner, , , , providers) = didRegistryInstance.getDIDRegister(_did);

        // storing some additional information for the template
        agreementData.agreementDataItems[_id]
            .accessConsumer = _accessConsumer;

        if (providers.length > 0) {
            agreementData.agreementDataItems[_id]
                .accessProvider = providers[0];
        } else {
            agreementData.agreementDataItems[_id]
                .accessProvider = owner;
        }

        agreementData.agreementIds.push(_id);

        emit AgreementCreated(
            _id,
            _did,
            agreementData.agreementDataItems[_id].accessConsumer,
            agreementData.agreementDataItems[_id].accessProvider,
            _timeLocks,
            _timeOuts
        );

        return agreementData.agreementIds.length;
    }

    /**
    * @notice getAgreementData return the agreement Data
    * @param _id SEA agreement unique identifier
    * @return the agreement consumer and provider addresses
    */
    function getAgreementData(bytes32 _id)
        external
        view
        returns (
            address accessConsumer,
            address accessProvider
        )
    {
        accessConsumer = agreementData.agreementDataItems[_id].accessConsumer;
        accessProvider = agreementData.agreementDataItems[_id].accessProvider;
    }
}
