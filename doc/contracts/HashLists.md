
# contract: HashLists

Documentation:
```
@title HashLists contract
@author Ocean Protocol Team
@dev Hash lists contract is a sample list contract in which uses 
     HashListLibrary.sol in order to store, retrieve, remove, and 
     update bytes32 values in hash lists.
     This is a reference implementation for IList interface. It is 
     used for whitelisting condition. Any entity can have its own 
     implementation of the interface in which could be used for the
     same condition.
```

## Variables

### internal lists

## Functions

### public initialize

Documentation:

```
@dev HashLists Initializer
@param _owner The owner of the hash list
Runs only upon contract creation.
```
Parameters:
* address _owner

### public hash

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
@dev add indexes an element then adds it to a list
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
@dev has checks whether a value is exist
@param id the list identifier (the hash of list owner's address)
@param value is element value in list
@return true if the value exists
```
Parameters:
* bytes32 id
* bytes32 value

### external has

Documentation:

```
@dev has checks whether a value is exist
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
@param id the list identifier (the hash of list owner's address)
@param _index is where is value is stored in the list
@return the value if exists
```
Parameters:
* bytes32 id
* uint256 _index

### external size

Documentation:

```
@dev size gets the list size
@param id the list identifier (the hash of list owner's address)
@return total length of the list
```
Parameters:
* bytes32 id

### external all

Documentation:

```
@dev all returns all list elements
@param id the list identifier (the hash of list owner's address)
@return all list elements
```
Parameters:
* bytes32 id

### external indexOf

Documentation:

```
@dev indexOf gets the index of a value in a list
@param id the list identifier (the hash of list owner's address)
@param value is element value in list
@return value index in list
```
Parameters:
* bytes32 id
* bytes32 value

### external ownedBy

Documentation:

```
@dev ownedBy gets the list owner
@param id the list identifier (the hash of list owner's address)
@return list owner
```
Parameters:
* bytes32 id

### external isIndexed

Documentation:

```
@dev isIndexed checks if the list is indexed
@param id the list identifier (the hash of list owner's address)
@return true if the list is indexed
```
Parameters:
* bytes32 id
