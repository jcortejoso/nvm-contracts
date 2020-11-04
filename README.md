[![banner](https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png)](https://nevermined.io)

# Nevermined Smart Contracts

> 💧 Smart Contracts implementation of Nevermined in Solidity
> [nevermined.io](https://nevermined.io)


[![Docker Build Status](https://img.shields.io/docker/cloud/build/keykoio/nevermined-contracts.svg)](https://hub.docker.com/r/keykoio/nevermined-contracts/)
![Build](https://github.com/nevermined-io/contracts/workflows/Build/badge.svg)
![NPM Package](https://github.com/nevermined-io/contracts/workflows/NPM%20Release/badge.svg)
![Pypi Package](https://github.com/nevermined-io/contracts/workflows/Pypi%20Release/badge.svg)
![Maven Package](https://github.com/nevermined-io/contracts/workflows/Maven%20Release/badge.svg)


Table of Contents
=================

   * [Nevermined Smart Contracts](#nevermined-smart-contracts)
      * [Table of Contents](#table-of-contents)
      * [Get Started](#get-started)
         * [Docker](#docker)
         * [Local development](#local-development)
      * [Testing](#testing)
         * [Code Linting](#code-linting)
      * [Networks](#networks)
         * [Testnets](#testnets)
            * [Integration Testnet](#integration-testnet)
            * [Staging Testnet](#staging-testnet)
         * [Mainnets](#mainnets)
         * [Production Mainnet](#production-mainnet)
      * [Packages](#packages)
      * [Documentation](#documentation)
      * [Prior Art](#prior-art)
      * [Attribution](#attribution)
      * [License](#license)


---

## Get Started

For local development of `nevermined-contracts` you can either use Docker, or setup the development environment on your machine.

### Docker

The simplest way to get started with is using the [Nevermined Tools](https://github.com/nevermined-io/tools),
a docker compose application to run all the Nevermined stack.

### Local development

As a pre-requisite, you need:

- Node.js
- yarn

Note: For MacOS, make sure to have `node@10` installed.

Clone the project and install all dependencies:

```bash
git clone git@github.com:nevermined-io/contracts.git
cd nevermined-contracts/

Install dependencies:
```bash
yarn
```

Compile the solidity contracts:
```bash
yarn compile
```

In a new terminal, launch an Ethereum RPC client, e.g. [ganache-cli](https://github.com/trufflesuite/ganache-cli):

```bash
npx ganache-cli@~6.9.1 > ganache-cli.log &
```

Switch back to your other terminal and deploy the contracts:

```bash
yarn test:fast
```

For redeployment run this instead
```bash
yarn clean
yarn compile
yarn test:fast
```

Upgrade contracts [**optional**]:
```bash
yarn upgrade
```

## Testing

Run tests with `yarn test`, e.g.:

```bash
yarn test test/unit/agreements/AgreementStoreManager.Test.js
```

### Code Linting

Linting is setup for `JavaScript` with [ESLint](https://eslint.org) & Solidity with [Ethlint](https://github.com/duaraghav8/Ethlint).

Code style is enforced through the CI test process, builds will fail if there're any linting errors.

```bash
yarn lint
```

## Networks

### Testnets

#### Rinkeby Testnet

The contract addresses deployed on Nevermined `Rinkeby` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.4.1  | `0x3f558204fA288286C3Ce8cb3C4900Fd675fCeaF7` |
| AgreementStoreManager             | v0.4.1  | `0x1A3bafbC27F6290C4Fd99F80c0C48D6fFbbE7407` |
| ComputeExecutionCondition         | v0.4.1  | `0x9Ee494Ee11Fded1B7cF915cfF92Db4E3E2F9fDd6` |
| ConditionStoreManager             | v0.4.1  | `0x31Ea71619B2E8683E13093E93212AACA84238c38` |
| DIDRegistry                       | v0.4.1  | `0x3262b3292eda1b5c68a3687EF7D9daF7899075E8` |
| DIDRegistryLibrary                | v0.4.1  | `0x49bE8829eeC5f29262b31e25B6372E4b004a2e30` |
| EpochLibrary                      | v0.4.1  | `0x750c547485AeE3774AA1B9919c06ad9833D9d01B` |
| EscrowAccessSecretStoreTemplate   | v0.4.1  | `0x25340D7Db40e31a5ccA3fEB61329A332f3b043dD` |
| EscrowComputeExecutionTemplate    | v0.4.1  | `0x25649De77C125b9cF1EcD0f07A652676d590Ec5a` |
| EscrowReward                      | v0.4.1  | `0x4bc44f922B45008cb4977da9eDEc83D30a40F259` |
| HashLockCondition                 | v0.4.1  | `0xAD762e16445aeA6E71b2fc112c5Ef14F40B67d8E` |
| LockRewardCondition               | v0.4.1  | `0xF4193bb555F79b8B3C0e78E1E8caC7b5a1763C4a` |
| SignCondition                     | v0.4.1  | `0xe4486F92Bd2BD7e9757E184A5385006324352024` |
| TemplateStoreManager              | v0.4.1  | `0x3749aF0feCC396310AE03457c51C7bE04850ECdb` |
| ThresholdCondition                | v0.4.1  | `0xfAFa8e939937e7531B896Db9F9B66F935408626C` |
| WhitelistingCondition             | v0.4.1  | `0xa7570Fa3A53337ABfeeE785017C5Eaa5dC84dE36` |


#### Integration Testnet

The contract addresses deployed on Nevermined `Integration` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| -                                 | -       | -                                            |


#### Staging Testnet

The contract addresses deployed on Nevermined `Staging` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| -                                 | -       | -                                            |


### Mainnets

### Production Mainnet

The contract addresses deployed on `Production` Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| -                                 | -       | -                                            |


## Packages

To facilitate the integration of `nevermined-contracts` there are `Python`, `JavaScript` and `Java` packages ready to be integrated. Those libraries include the Smart Contract ABI's.
Using these packages helps to avoid compiling the Smart Contracts and copying the ABI's manually to your project. In that way the integration is cleaner and easier.
The packages provided currently are:

* JavaScript `NPM` package - As part of the [@nevermined-io npm organization](https://www.npmjs.com/settings/nevermined-io/packages),
  the [npm nevermined-contracts package](https://www.npmjs.com/package/@nevermined-io/contracts) provides the ABI's
  to be imported from your `JavaScript` code.
* Python `Pypi` package - The [Pypi nevermined-contracts package](https://pypi.org/project/nevermined-contracts/) provides
  the same ABI's to be used from `Python`.
* Java `Maven` package - The [Maven nevermined-contracts package](https://search.maven.org/artifact/io.keyko/nevermined-contracts)
  provides the same ABI's to be used from `Java`.

The packages contains all the content from the `doc/` and `artifacts/` folders.

In `JavaScript` they can be used like this:

Install the `nevermined-contracts` `npm` package.

```bash
npm install @nevermined-io/contracts
```

Load the ABI of the `NeverminedToken` contract on the `staging` network:

```javascript
const NeverminedToken = require('@nevermined-io/contracts/artifacts/NeverminedToken.staging.json')
```

The structure of the `artifacts` is:

```json
{
  "abi": "...",
  "bytecode": "0x60806040523...",
  "address": "0x45DE141F8Efc355F1451a102FB6225F1EDd2921d",
  "version": "v0.9.1"
}
```

## Documentation

* [Contracts Documentation](doc/contracts/README.md)
* [Release process](doc/RELEASE_PROCESS.md)
* [Packaging of libraries](doc/PACKAGING.md)
* [Upgrading of contracts](doc/UPGRADES.md)
* [Template lifecycle](doc/TEMPLATE_LIFE_CYCLE.md)

## Prior Art

This project builds on top of the work done in open source projects:
- [zeppelinos/zos](https://github.com/zeppelinos/zos)
- [OpenZeppelin/openzeppelin-eth](https://github.com/OpenZeppelin/openzeppelin-eth)

## Attribution

This project is based in the Ocean Protocol [Keeper Contracts](https://github.com/oceanprotocol/keeper-contracts).
It keeps the same Apache v2 License and adds some improvements. See [NOTICE file](NOTICE).

## License

```
Copyright 2020 Keyko GmbH
This product includes software developed at
BigchainDB GmbH and Ocean Protocol (https://www.oceanprotocol.com/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
