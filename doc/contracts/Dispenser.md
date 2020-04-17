
# contract: Dispenser

Documentation:
```
@title Ocean Protocol Dispenser Contract
@author Ocean Protocol Team
```

## Variables

### internal tokenRequests

### internal totalMintAmount

### internal maxAmount

### internal maxMintAmount

### internal minPeriod

### internal scale

### public oceanToken

## Events

###  RequestFrequencyExceeded
Parameters:
* address requester
* uint256 minPeriod

###  RequestLimitExceeded
Parameters:
* address requester
* uint256 amount
* uint256 maxAmount

## Modifiers

### internal isValidAddress
Parameters:
* address _address

## Functions

### external initialize

Documentation:

```
@dev Dispenser Initializer
@param _oceanTokenAddress The deployed contract address of an OceanToken
@param _owner The owner of the Dispenser
Runs only on initial contract creation.
```
Parameters:
* address _oceanTokenAddress
* address _owner

### external requestTokens

Documentation:

```
@dev user can request some tokens for testing
@param amount the amount of tokens to be requested
@return valid Boolean indication of tokens are requested
```
Parameters:
* uint256 amount

### external setMinPeriod

Documentation:

```
@dev the Owner can set the min period for token requests
@param period the min amount of time before next request
```
Parameters:
* uint256 period

### external setMaxAmount

Documentation:

```
@dev the Owner can set the max amount for token requests
@param amount the max amount of tokens that can be requested
```
Parameters:
* uint256 amount

### external setMaxMintAmount

Documentation:

```
@dev the Owner can set the max amount for token requests
@param amount the max amount of tokens that can be requested
```
Parameters:
* uint256 amount
