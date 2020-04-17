
# contract: HashList

Documentation:
```
@title HashList contract
@author Ocean Protocol Team
@dev Hash list contract is a sample list contract in which uses 
     ListLibrary.sol in order to store, retrieve, remove, and 
     update bytes32 hashes list
```

## Variables

### internal list

## Functions

### public initialize

Documentation:

```
@dev HashList Initializer
@param _owner The owner of the hash list
Runs only on initial contract creation.
```
Parameters:
* address _owner

### external hash

Documentation:

```
@dev hash ethereum accounts
@param account Ethereum address
@return bytes32 hash of the account
```
Parameters:
* address account

### external add

Documentation:

```
@dev put an array of elements without indexing
     this meant to save gas in case of large arrays
@param values is an array of elements value
@return true if values are added successfully
```
Parameters:
* bytes32[] values

### external add

Documentation:

```
@dev add index an element then add it to a list
@param value is a bytes32 value
@return true if value is added successfully
```
Parameters:
* bytes32 value

### external update

Documentation:

```
@dev update the value with a new value and maintain indices
@param oldValue is an element value in a list
@param newValue new value
@return true if value is updated successfully
```
Parameters:
* bytes32 oldValue
* bytes32 newValue

### external index

Documentation:

```
@dev index is used to map each element value to its index on the list 
@param from index is where to 'from' indexing in the list
@param to index is where to stop indexing
@return true if the sub list is indexed
```
Parameters:
* uint256 from
* uint256 to

### external has

Documentation:

```
@dev size returns the list size
@param value is element value in list
@return true if the value exists
```
Parameters:
* bytes32 value

### external remove

Documentation:

```
@dev remove value from a list, updates indices, and list size 
@param value is an element value in a list
@return true if value is removed successfully
```
Parameters:
* bytes32 value

### external get

Documentation:

```
@dev has value by index 
@param _index is where is value is stored in the list
@return the value if exists
```
Parameters:
* uint256 _index

### external size

Documentation:

```
@dev size gets the list size
@return total length of the list
```

### external all

Documentation:

```
@dev all returns all list elements
@return all list elements
```

### external indexOf

Documentation:

```
@dev indexOf gets the index of a value in a list
@param value is element value in list
@return value index in list
```
Parameters:
* bytes32 value

### external ownedBy

Documentation:

```
@dev ownedBy gets the list owner
@return list owner
```

### external isIndexed

Documentation:

```
@dev isIndexed checks if the list is indexed
@return true if the list is indexed
```
