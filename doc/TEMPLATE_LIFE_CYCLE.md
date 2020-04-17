# The `Template` Lifecycle in Keeper

This document provides more information about how the lifecycle of a
template is being managed in Ocean protocol.

Any template in the keeper contracts is defined by **ONLY** three states:

- Proposed: Anyone can propose a template
- Approved: (currently) only Ocean protocol approve the proposed templates
- Revoked: Only template owner or Ocean protocol can revoke a template



## Template Phases:

### Propose
To `propose` a new template, a user should define the template as follows:

- `id`: a unique template identifier, usually keeper contracts use the hash of the template name.
- `name`: template name, user should choose unique name for the new template, otherwise, the propose transaction will revert.
- `condition types`: a set of condition addresses in which each condition type refers the condition contract address.
For example a `WhitelistingCondition` has an address `0x5b4c3B48062bDCa9DaA5441c5F5A9D557bFE3356`
on [Pacific network](https://submarine.oceanprotocol.com/). For more about the current deployed conditions,
please refer to this [section](../README.md#pacific-mainnet)
- `actor Type Ids`: set of actor types. Template MUST hold set of actor types > 2 (e.g `provider`, `consumer`, `marketplace`, `publisher`, `curator`, etc).
User can define new actor type using `registerTemplateActorType` or use the existing types by providing their Ids.

By providing these data inputs to `proposeTemplate`, the new template will be available on-chain and waiting for approval by Ocean Protocol Foundation.

**NOTE** The actor type values prior the agreement creation should follow the same order of the actor types in the template.

### Approve

The approval of the proposed template will be managed by Ocean Protocol Foundation multi-sig governance contracts.

In this phase, the multi-sig will sign the approve template transaction using the template id by calling `approveTemplate(bytes32 _id)`

### Revoke

At some point, we can find that this template has a vulnerability, or no longer needed by the users, so
The template owner (the same template proposal) or the OPF can revoke the template from public access by calling `revokeTemplate(bytes32 _id)`

### Get Template

The `generateId` method in `TemplateStoreManager.sol` allows anyone to get the bytes32 template Id. Using this template Id, users 
can get the template details by calling `getTemplate`. 



### Built-in Templates

The following templates `Escrow Access Secret Store template` and `Escrow Compute Execution template` are built-in 
templates. Check out the details below:


#### Pacific Network

```
consumer actor type Id: 0xd4af56a6cb216435050293f7c860ecd82c7b78b5ce1cf71dcb725bc26a5c8cab 
provider actor type Id: 0x91c78f343fa4753a18a7ecaff5a0d85cfa864839d839601256f8f00300358578
EscrowAccessSecretStoreTemplate Id: 0xff52b4c00ceacf1cfd7296af9569da77db4e9ae9b3d42a3022516b9c1adca8de
EscrowComputeExecutionTemplate Id: 0x05261cb95061becaa852abcba43e8fe7f3edafcaa1cedf1606c08bed0a6cfa70
Is Escrow Access Secret Store template approved ? true
Is Escrow Compute Execution template approved ? true
```

#### Nile Network

```
consumer actor type Id: 0xd4af56a6cb216435050293f7c860ecd82c7b78b5ce1cf71dcb725bc26a5c8cab 
provider actor type Id: 0x91c78f343fa4753a18a7ecaff5a0d85cfa864839d839601256f8f00300358578
EscrowAccessSecretStoreTemplate Id: 0xff52b4c00ceacf1cfd7296af9569da77db4e9ae9b3d42a3022516b9c1adca8de
EscrowComputeExecutionTemplate Id: 0x05261cb95061becaa852abcba43e8fe7f3edafcaa1cedf1606c08bed0a6cfa70
Is Escrow Access Secret Store template approved ? true
Is Escrow Compute Execution template approved ? true
```
