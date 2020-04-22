# The `keeper-contracts` Release Process

## Build a new version
- Create a new local feature branch, e.g. `git checkout -b release/v0.2.5`
- Use the `bumpversion.sh` script to bump the project version. You can execute the script using {major|minor|patch} as first argument to bump the version accordingly:
  - To bump the patch version: `./bumpversion.sh patch`
  - To bump the minor version: `./bumpversion.sh minor`
  - To bump the major version: `./bumpversion.sh major`
- assuming we are on version `v0.2.4` and the desired version is `v0.2.5` `./bumpversion.sh patch` has to be run.
- run `npm i` to update the version in `package-lock.json`

## Interact with networks

### Roles

We define four roles:

- `deployer`: represented as `accounts[0]`
- `upgrader`: represented as `accounts[1]`
- `upgraderWallet`: represented as the `upgrader` from `wallets.json`
- `ownerWallet`: represented as the `owner` from `wallets.json`

#### Deployer

Can be any account. It is used for deploying the initial proxy contracts and the logic contracts.

#### Upgrader

Has to be an `owner` of the `upgrader` multi sig wallet. It is used for issuing upgrade requests against the `upgrader` multi sig wallet.

#### UpgraderWallet

One instance of the multi sig wallet, defined as `upgrader`. This wallet will be assigned as zos admin and is required to do upgrades.

#### OwnerWallet

One instance of the multi sig wallet, defined as `owner`. This wallet will be assigned as the `owner` of all the contracts. It can be used to call specific functions in the contracts ie. change the configuration.

### Deploy & Upgrade

- run `npm run clean` to clean the work dir.
- run `npm run compile` to compile the contracts.

#### Nile

- Copy the wallet file for `nile`
  - `cp wallets_nile.json wallets.json`
- run `export MNEMONIC=<your nile mnemonic>`. You will find them in the password manager.

##### Deploy the whole application

- To deploy all contracts run `npm run deploy:nile`

##### Deploy a single contracts

- To deploy a single contract you need to specify the contracts to deploy as a parameter to the deploy script: ie. `npm run deploy:nile -- OceanToken Dispenser`will deploy `OceanToken` and `Dispenser`.

##### Upgrade the whole application

- To upgrade all contracts run `npm run upgrade:nile`

##### Upgrade a single contract

- To upgrade a single contract run `npm run upgrade:nile -- OceanToken`. For upgrading the `OceanToken` contract.

##### Persist artifacts

- Commit all changes in `artifacts/*.nile.json`

#### Kovan

- Copy the wallet file for `kovan` > `cp wallets_kovan.json wallets.json`
- run `export MNEMONIC=<your kovan mnemonic>`. You will find them in the password manager.
- run `export INFURA_TOKEN=<your infura token>`. You will get it from `infura`.

##### Deploy the whole application

- To deploy all the contracts run `npm run deploy:kovan`

##### Deploy a single contracts

- To deploy a single contracts you need to specify the contracts to deploy as a parameter to the deploy script: ie. `npm run deploy:kovan -- OceanToken Dispenser` will deploy `OceanToken` and `Dispenser`.

##### Upgrade the whole application

- To upgrade all contracts run `npm run upgrade:kovan`

##### Upgrade a single contract

- To upgrade a single contract run `npm run upgrade:kovan -- OceanToken`. For upgrading the `OceanToken` contract.

##### Persist artifacts

- Commit all changes in `artifacts/*.kovan.json`

#### Approve upgrades

All upgrades of the contracts have to be approved by the `upgrader` wallet configured in the `wallets.json` file.

- go to https://wallet.gnosis.pm
- Load `upgrader` wallet
- Select an Ethereum Account that is an `owner` of the multi sig wallet, but not the one who issued the upgrade request. This can be done in the following ways:
  - Connect to a local Blockchain node that holds the private key.
  - Connect to MetaMask and select the owner account from the multi sig wallet.
  - Connect a hardware wallet like ledger or trezor.
- Select the transaction you want to confirm (the upgrade script will tell you which transactions have to be approved in which wallets)
- Click Confirm

#### General tasks

- On the end of every deployment, the log has to be copied to [atlantic](https://github.com/oceanprotocol/atlantic/tree/master/keeper/logs)

## Document

### Contracts documentation

- Update the contracts documentation
- run `node ./scripts/contracts/doc-generator.js`
- Commit the changes in `doc/contracts`

### Address Documentation

- Update the addresses in the `README.md`
- run `node ./scripts/contracts/get-addresses.js <network name>`

It will output the current proxy addresses in the `README` friendly format.

```text
| AccessSecretStoreCondition        | v0.9.0 | 0x45DE141F8Efc355F1451a102FB6225F1EDd2921d |
| AgreementStoreManager             | v0.9.0 | 0x62f84700b1A0ea6Bfb505aDC3c0286B7944D247C |
| ConditionStoreManager             | v0.9.0 | 0x39b0AA775496C5ebf26f3B81C9ed1843f09eE466 |
| DIDRegistry                       | v0.9.0 | 0x4A0f7F763B1A7937aED21D63b2A78adc89c5Db23 |
| DIDRegistryLibrary                | v0.9.0 | 0x3B3504908Db36f5D5f07CD420ee2BBBbDfB674cF |
| Dispenser                         | v0.9.0 | 0x865396b7ddc58C693db7FCAD1168E3BD95Fe3368 |
....

```

- Copy this to the `README.md`

## Trigger CI

- Commit the missing changes to the feature branch.
- Tag the last commit with the new version number ie. `v0.2.5`
- Push the feature branch to GitHub.
- Make a pull request from the just-pushed branch to `develop` branch.
- Wait for all the tests to pass!
- Merge the pull request into the `develop` branch.

## Release and packages

The release itself is done by `travis` based on the tagged commit.

It will deploy the following components:

- [npm](https://www.npmjs.com/package/@oceanprotocol/keeper-contracts)
- [pypi](https://pypi.org/project/keeper-contracts/)
- [maven](https://search.maven.org/artifact/com.oceanprotocol/keeper-contracts/)
- [docker](https://cloud.docker.com/u/oceanprotocol/repository/docker/oceanprotocol/keeper-contracts)

The npm, pypi and maven packages contain the contract artifacts for the contracts already deployed in different networks (such as `Pacific`, `Duero`, `Nile`, or `Kovan`).
The docker image generated contains the contracts and script ready to be used to deploy the contracts to a network. It is used for deploying the contracts in the local network `Spree` in [oceanprotocol/barge](https://github.com/oceanprotocol/barge)

Once the new version is tagged and released, you can edit the `Releases` section of GitHub with the information and changes about the new version (in the future, these will come from the changelog):

## Audit

To check or document that all transactions have been approved in the multi sig wallet you can run `npm run audit:nile` to get a list of all the current transactions and their current status.

```text
 Wallet: 0x24EB26D4042a2AB576E7E39b87c3f33f276AeF92

 Transaction ID: 64
 Destination: 0xfA16d26e9F4fffC6e40963B281a0bB08C31ed40C
 Contract: EscrowAccessSecretStoreTemplate
 Data is `upgradeTo` call: true
 Confirmed from: 0x7A13E1aD23546c9b804aDFd13e9AcB184EfCAF58
 Executed: false
```
