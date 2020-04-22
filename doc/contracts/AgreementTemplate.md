
# contract: AgreementTemplate

Documentation:
```
@title Agreement Template
@author Ocean Protocol Team
 * @dev Implementation of Agreement Template
 *      Agreement template is a reference template where it
     has the ability to create agreements from whitelisted 
     template
```

## Variables

### internal templateList

### internal conditionTypes

### internal agreementStoreManager

## Functions

### public createAgreement

Documentation:

```
@notice createAgreement create new agreement
@param _id agreement unique identifier
@param _did refers to decentralized identifier (a bytes32 length ID).
@param _conditionIds list of condition identifiers
@param _timeLocks list of time locks, each time lock will be assigned to the 
         same condition that has the same index
@param _timeOuts list of time outs, each time out will be assigned to the 
         same condition that has the same index
@return the index of the created agreement
```
Parameters:
* bytes32 _id
* bytes32 _did
* bytes32[] _conditionIds
* uint256[] _timeLocks
* uint256[] _timeOuts

### public getConditionTypes

Documentation:

```
@notice getConditionTypes gets the conditions addresses list
@dev for the current template returns list of condition contracts 
     addresses
@return list of conditions contract addresses
```
