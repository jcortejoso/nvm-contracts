
# library: HashListLibrary

Documentation:
```
@title Hash List library
@author Ocean Protocol Team
@dev Implementation of the basic functionality of list of hash values.
This library allows other contracts to build and maintain lists
and also preserves the privacy of the data by accepting only hashed 
content (bytes32 based data type)
```

## Structs

### public List
Members:
* address _owner
* bytes32[] values
* mapping(bytes32 => uint256) indices

## Modifiers

### internal onlyListOwner
Parameters:
* struct HashListLibrary.List _self

## Functions

### public add

Documentation:

```
@dev add index an element then add it to a list
@param _self is a pointer to list in the storage
@param value is a bytes32 value
@return true if value is added successfully
```
Parameters:
* struct HashListLibrary.List _self
* bytes32 value

### public add

Documentation:

```
@dev put an array of elements without indexing
     this meant to save gas in case of large arrays
@param _self is a pointer to list in the storage
@param values is an array of elements value
@return true if values are added successfully
```
Parameters:
* struct HashListLibrary.List _self
* bytes32[] values

### public update

Documentation:

```
@dev update the value with a new value and maintain indices
@param _self is a pointer to list in the storage
@param oldValue is an element value in a list
@param newValue new value
@return true if value is updated successfully
```
Parameters:
* struct HashListLibrary.List _self
* bytes32 oldValue
* bytes32 newValue

### public remove

Documentation:

```
@dev remove value from a list, updates indices, and list size 
@param _self is a pointer to list in the storage
@param value is an element value in a list
@return true if value is removed successfully
```
Parameters:
* struct HashListLibrary.List _self
* bytes32 value

### public get

Documentation:

```
@dev has value by index 
@param _self is a pointer to list in the storage
@param index is where is value is stored in the list
@return the value if exists
```
Parameters:
* struct HashListLibrary.List _self
* uint256 index

### public index

Documentation:

```
@dev index is used to map each element value to its index on the list 
@param _self is a pointer to list in the storage
@param from index is where to 'from' indexing in the list
@param to index is where to stop indexing
@return true if the sub list is indexed
```
Parameters:
* struct HashListLibrary.List _self
* uint256 from
* uint256 to

### public setOwner

Documentation:

```
@dev setOwner set list owner
param _owner owner address
```
Parameters:
* struct HashListLibrary.List _self
* address _owner

### public indexOf

Documentation:

```
@dev indexOf gets the index of a value in a list
@param _self is a pointer to list in the storage
@param value is element value in list
@return value index in list
```
Parameters:
* struct HashListLibrary.List _self
* bytes32 value

### public isIndexed

Documentation:

```
@dev isIndexed checks if the list is indexed
@param _self is a pointer to list in the storage
@return true if the list is indexed
```
Parameters:
* struct HashListLibrary.List _self

### public all

Documentation:

```
@dev all returns all list elements
@param _self is a pointer to list in the storage
@return all list elements
```
Parameters:
* struct HashListLibrary.List _self

### public has

Documentation:

```
@dev size returns the list size
@param _self is a pointer to list in the storage
@param value is element value in list
@return true if the value exists
```
Parameters:
* struct HashListLibrary.List _self
* bytes32 value

### public size

Documentation:

```
@dev size gets the list size
@param _self is a pointer to list in the storage
@return total length of the list
```
Parameters:
* struct HashListLibrary.List _self

### public ownedBy

Documentation:

```
@dev ownedBy gets the list owner
@param _self is a pointer to list in the storage
@return list owner
```
Parameters:
* struct HashListLibrary.List _self

### private _index

Documentation:

```
@dev _index assign index to the list elements
@param _self is a pointer to list in the storage
@param from is the starting index id
@param to is the ending index id
```
Parameters:
* struct HashListLibrary.List _self
* uint256 from
* uint256 to
