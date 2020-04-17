pragma solidity 0.5.6;
// Copyright BigchainDB GmbH and Ocean Protocol contributors
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0

import './Condition.sol';

/**
 * @title Hash Lock Condition
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Hash Lock Condition
 *
 *      For more information, please refer the following link
 *      https://github.com/oceanprotocol/OEPs/issues/122
 *      TODO: update the OEP link 
 */
contract HashLockCondition is Condition {

   /**
    * @notice initialize init the 
    *       contract with the following parameters
    * @dev this function is called only once during the contract
    *       initialization.
    * @param _owner contract's owner account address
    * @param _conditionStoreManagerAddress condition store manager address
    */
    function initialize(
        address _owner,
        address _conditionStoreManagerAddress
    )
        external
        initializer()
    {
        require(
            _conditionStoreManagerAddress != address(0),
            'Invalid address'
        );
        Ownable.initialize(_owner);
        conditionStoreManager = ConditionStoreManager(
            _conditionStoreManagerAddress
        );
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _preimage refers uint value of the hash pre-image.
    * @return bytes32 hash of all these values 
    */
    function hashValues(uint256 _preimage)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_preimage));
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _preimage refers string value of the hash pre-image.
    * @return bytes32 hash of all these values 
    */
    function hashValues(string memory _preimage)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_preimage));
    }

   /**
    * @notice hashValues generates the hash of condition inputs 
    *        with the following parameters
    * @param _preimage refers bytes32 value of the hash pre-image.
    * @return bytes32 hash of all these values 
    */
    function hashValues(bytes32 _preimage)
        public
        pure
        returns
        (bytes32)
    {
        return keccak256(abi.encodePacked(_preimage));
    }

   /**
    * @notice fulfill the condition by calling check the 
    *       the hash and the pre-image uint value
    * @param _agreementId SEA agreement identifier
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        uint256 _preimage
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        return _fulfill(generateId(_agreementId, hashValues(_preimage)));
    }

   /**
    * @notice fulfill the condition by calling check the 
    *       the hash and the pre-image string value
    * @param _agreementId SEA agreement identifier
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        string memory _preimage
    )
        public
        returns (ConditionStoreLibrary.ConditionState)
    {
        return _fulfill(generateId(_agreementId, hashValues(_preimage)));
    }

   /**
    * @notice fulfill the condition by calling check the 
    *       the hash and the pre-image bytes32 value
    * @param _agreementId SEA agreement identifier
    * @return condition state
    */
    function fulfill(
        bytes32 _agreementId,
        bytes32 _preimage
    )
        external
        returns (ConditionStoreLibrary.ConditionState)
    {
        return _fulfill(generateId(_agreementId, hashValues(_preimage)));
    }

   /**
    * @notice _fulfill calls super fulfil method
    * @param _generatedId SEA agreement identifier
    * @return condition state
    */
    function _fulfill(
        bytes32 _generatedId
    )
        private
        returns (ConditionStoreLibrary.ConditionState)
    {
        return super.fulfill(
            _generatedId,
            ConditionStoreLibrary.ConditionState.Fulfilled
        );
    }
}
