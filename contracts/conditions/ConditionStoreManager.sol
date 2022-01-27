pragma solidity ^0.8.0;
// Copyright 2020 Keyko GmbH.
// This product includes software developed at BigchainDB GmbH and Ocean Protocol
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import '../Common.sol';
import '../libraries/EpochLibrary.sol';
import './ConditionStoreLibrary.sol';

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

/**
 * @title Condition Store Manager
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of the Condition Store Manager.
 *
 *      Condition store manager is responsible for enforcing the 
 *      the business logic behind creating/updating the condition state
 *      based on the assigned role to each party. Only specific type of
 *      contracts are allowed to call this contract, therefore there are 
 *      two types of roles, create role that in which is able to create conditions.
 *      The second role is the update role, which is can update the condition state.
 *      Also, it support delegating the roles to other contract(s)/account(s).
 */
contract ConditionStoreManager is OwnableUpgradeable, AccessControlUpgradeable, Common {

    bytes32 private constant PROXY_ROLE = keccak256('PROXY_ROLE');

    function grantProxyRole(address _address) public onlyOwner {
        grantRole(PROXY_ROLE, _address);
    }

    function revokeProxyRole(address _address) public onlyOwner {
        revokeRole(PROXY_ROLE, _address);
    }

    using ConditionStoreLibrary for ConditionStoreLibrary.ConditionList;
    using EpochLibrary for EpochLibrary.EpochList;

    enum RoleType { Create, Update }
    address private createRole;
    ConditionStoreLibrary.ConditionList internal conditionList;
    EpochLibrary.EpochList internal epochList;

    event ConditionCreated(
        bytes32 indexed _id,
        address indexed _typeRef,
        address indexed _who
    );

    event ConditionUpdated(
        bytes32 indexed _id,
        address indexed _typeRef,
        ConditionStoreLibrary.ConditionState indexed _state,
        address _who
    );

    modifier onlyCreateRole(){
        require(
            createRole == msg.sender,
            'Invalid CreateRole'
        );
        _;
    }

    modifier onlyUpdateRole(bytes32 _id)
    {
        require(
            conditionList.conditions[_id].typeRef == msg.sender,
            'Invalid UpdateRole'
        );
        _;
    }

    modifier onlyValidType(address typeRef)
    {
        require(
            typeRef != address(0),
            'Invalid address'
        );
        require(
            isContract(typeRef),
            'Invalid contract address'
        );
        _;
    }


    /**
     * @dev initialize ConditionStoreManager Initializer
     *      Initialize Ownable. Only on contract creation, 
     * @param _owner refers to the owner of the contract
     */
    function initialize(
        address _owner
    )
        public
        initializer
    {
        require(
            _owner != address(0),
            'Invalid address'
        );
        require(
            createRole == address(0),
            'Role already assigned'
        );

        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);
        createRole = _owner;
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    /**
     * @dev getCreateRole get the address of contract
     *      which has the create role
     * @return create condition role address
     */
    function getCreateRole()
        external
        view
        returns (address)
    {
        return createRole;
    }

    /**
     * @dev delegateCreateRole only owner can delegate the 
     *      create condition role to a different address
     * @param delegatee delegatee address
     */
    function delegateCreateRole(
        address delegatee
    )
        external
        onlyOwner()
    {
        require(
            delegatee != address(0),
            'Invalid delegatee address'
        );
        createRole = delegatee;
    }

    /**
     * @dev delegateUpdateRole only owner can delegate 
     *      the update role to a different address for 
     *      specific condition Id which has the create role
     * @param delegatee delegatee address
     */
    function delegateUpdateRole(
        bytes32 _id,
        address delegatee
    )
        external
        onlyOwner()
    {
        require(
            delegatee != address(0),
            'Invalid delegatee address'
        );
        require(
            conditionList.conditions[_id].typeRef != address(0),
            'Invalid condition Id'
        );
        conditionList.conditions[_id].typeRef = delegatee;
    }

    /**
     * @dev createCondition only called by create role address 
     *      the condition should use a valid condition contract 
     *      address, valid time lock and timeout. Moreover, it 
     *      enforce the condition state transition from 
     *      Uninitialized to Unfulfilled.
     * @param _id unique condition identifier
     * @param _typeRef condition contract address
     * @return size the index of the created condition 
     */
    function createCondition(
        bytes32 _id,
        address _typeRef
    )
    external
    returns (uint size)
    {
        return createCondition(
            _id,
            _typeRef,
            uint(0),
            uint(0),
            msg.sender
        );
    }
    
    /**
     * @dev createCondition only called by create role address 
     *      the condition should use a valid condition contract 
     *      address, valid time lock and timeout. Moreover, it 
     *      enforce the condition state transition from 
     *      Uninitialized to Unfulfilled.
     * @param _id unique condition identifier
     * @param _typeRef condition contract address
     * @param _creator address of the condition creator    
     * @return size the index of the created condition 
     */
    function createCondition(
        bytes32 _id,
        address _typeRef,
        address _creator
    )
        external
        returns (uint size)
    {
        return createCondition(
            _id,
            _typeRef,
            uint(0),
            uint(0),
            _creator
        );
    }

    /**
     * @dev createCondition only called by create role address 
     *      the condition should use a valid condition contract 
     *      address, valid time lock and timeout. Moreover, it 
     *      enforce the condition state transition from 
     *      Uninitialized to Unfulfilled.
     * @param _id unique condition identifier
     * @param _typeRef condition contract address
     * @param _timeLock start of the time window
     * @param _timeOut end of the time window
     * @param _creator address of the condition creator     
     * @return size the index of the created condition 
     */
    function createCondition(
        bytes32 _id,
        address _typeRef,
        uint _timeLock,
        uint _timeOut,
        address _creator
    )
        public
        onlyCreateRole
        onlyValidType(_typeRef)
        returns (uint size)
    {
        epochList.create(_id, _timeLock, _timeOut);

        uint listSize = conditionList.create(_id, _typeRef, _creator);

        emit ConditionCreated(
            _id,
            _typeRef,
            msg.sender
        );

        return listSize;
    }

    /**
     * @dev updateConditionState only called by update role address. 
     *      It enforce the condition state transition to either 
     *      Fulfill or Aborted state
     * @param _id unique condition identifier
     * @return the current condition state 
     */
    function updateConditionState(
        bytes32 _id,
        ConditionStoreLibrary.ConditionState _newState
    )
        external
        onlyUpdateRole(_id)
        returns (ConditionStoreLibrary.ConditionState)
    {
        // no update before time lock
        require(
            !isConditionTimeLocked(_id),
            'TimeLock is not over yet'
        );

        ConditionStoreLibrary.ConditionState updateState = _newState;

        // auto abort after time out
        if (isConditionTimedOut(_id)) {
            updateState = ConditionStoreLibrary.ConditionState.Aborted;
        }

        conditionList.updateState(_id, updateState);

        emit ConditionUpdated(
            _id,
            conditionList.conditions[_id].typeRef,
            updateState,
            msg.sender
        );

        return updateState;
    }

    function updateConditionMapping(
        bytes32 _id,
        bytes32 _key,
        bytes32 _value
    )
    external
    onlyUpdateRole(_id)
    {
        conditionList.updateKeyValue(
            _id, 
            _key, 
            _value
        );
    }
    
    function updateConditionMappingProxy(
        bytes32 _id,
        bytes32 _key,
        bytes32 _value
    )
    external
    {
        require(hasRole(PROXY_ROLE, msg.sender), 'Invalid access role');
        conditionList.updateKeyValue(
            _id, 
            _key, 
            _value
        );
    }
    
    /**
     * @dev getConditionListSize 
     * @return size the length of the condition list 
     */
    function getConditionListSize()
        external
        view
        returns (uint size)
    {
        return conditionList.conditionIds.length;
    }

    /**
     * @dev getCondition  
     * @return typeRef the type reference
     * @return state condition state
     * @return timeLock the time lock
     * @return timeOut time out
     * @return blockNumber block number
     * @return createdBy address
     * @return lastUpdatedBy address
     * @return blockNumberUpdated block number updated
     */
    function getCondition(bytes32 _id)
        external
        view
        returns (
            address typeRef,
            ConditionStoreLibrary.ConditionState state,
            uint timeLock,
            uint timeOut,
            uint blockNumber,
            address createdBy,
            address lastUpdatedBy,
            uint blockNumberUpdated
        )
    {
        typeRef = conditionList.conditions[_id].typeRef;
        state = conditionList.conditions[_id].state;
        timeLock = epochList.epochs[_id].timeLock;
        timeOut = epochList.epochs[_id].timeOut;
        blockNumber = epochList.epochs[_id].blockNumber;
        createdBy = conditionList.conditions[_id].createdBy;
        lastUpdatedBy = conditionList.conditions[_id].lastUpdatedBy;
        blockNumberUpdated = conditionList.conditions[_id].blockNumberUpdated;
    }

    /**
     * @dev getConditionState  
     * @return condition state
     */
    function getConditionState(bytes32 _id)
        external
        view
        virtual
        returns (ConditionStoreLibrary.ConditionState)
    {
        return conditionList.conditions[_id].state;
    }

    /**
     * @dev getConditionTypeRef  
     * @return condition typeRef
     */
    function getConditionTypeRef(bytes32 _id)
    external
    view
    virtual
    returns (address)
    {
        return conditionList.conditions[_id].typeRef;
    }    

    /**
     * @dev getConditionCreatedBy  
     * @return condition createdBy address
     */
    function getConditionCreatedBy(bytes32 _id)
    external
    view
    virtual
    returns (address)
    {
        return conditionList.conditions[_id].createdBy;
    }

    /**
     * @dev getConditionState  
     * @return condition state
     */
    function getMappingValue(bytes32 _id, bytes32 _key)
    external
    view
    virtual
    returns (bytes32)
    {
        return conditionList.map[_id][_key];
    }    

    /**
     * @dev isConditionTimeLocked  
     * @return whether the condition is timedLock ended
     */
    function isConditionTimeLocked(bytes32 _id)
        public
        view
        returns (bool)
    {
        return epochList.isTimeLocked(_id);
    }

    /**
     * @dev isConditionTimedOut  
     * @return whether the condition is timed out 
     */
    function isConditionTimedOut(bytes32 _id)
        public
        view
        returns (bool)
    {
        return epochList.isTimedOut(_id);
    }
}
