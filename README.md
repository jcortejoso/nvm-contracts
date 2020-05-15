[![banner](https://raw.githubusercontent.com/keyko-io/assets/master/images/logo/small/keyko_logo@2x-100.jpg)](https://keyko.io)

# Nevermined Smart Contracts

> 💧 Nevermined implementation of Ocean Protocol in Solidity
> [keyko.io](https://keyko.io)


[![Docker Build Status](https://img.shields.io/docker/cloud/build/keykoio/nevermined-contracts.svg)](https://hub.docker.com/r/keykoio/nevermined-contracts/)
![Build](https://github.com/keyko-io/nevermined-contracts/workflows/Build/badge.svg)
![NPM Package](https://github.com/keyko-io/nevermined-contracts/workflows/NPM%20Release/badge.svg)
![Pypi Package](https://github.com/keyko-io/nevermined-contracts/workflows/Pypi%20Release/badge.svg)
![Maven Package](https://github.com/keyko-io/nevermined-contracts/workflows/Maven%20Release/badge.svg)


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

The simplest way to get started with is using the [Nevermined Tools](https://github.com/keyko-io/nevermined-tools),
a docker compose application to run all the Nevermined stack.

### Local development

As a pre-requisite, you need:

- Node.js
- npm

Note: For MacOS, make sure to have `node@10` installed.

Clone the project and install all dependencies:

```bash
git clone git@github.com:keyko-io/nevermined-contracts.git
cd nevermined-contracts/

# install dependencies
npm i

# install RPC client globally
npm install -g ganache-cli
```

Compile the solidity contracts:

```bash
npm run compile
```

In a new terminal, launch an Ethereum RPC client, e.g. [ganache-cli](https://github.com/trufflesuite/ganache-cli):

```bash
ganache-cli
```

Switch back to your other terminal and deploy the contracts:

```bash
npm run deploy:development

# for redeployment run this instead
npm run clean
npm run compile
npm run deploy:development
```

Upgrade contracts [**optional**]:
```bash
npm run upgrade
```

## Testing

Run tests with `npm run test`, e.g.:

```bash
npm run test -- test/unit/agreements/AgreementStoreManager.Test.js
```

### Code Linting

Linting is setup for `JavaScript` with [ESLint](https://eslint.org) & Solidity with [Ethlint](https://github.com/duaraghav8/Ethlint).

Code style is enforced through the CI test process, builds will fail if there're any linting errors.

## Networks

### Testnets

#### Rinkeby Testnet

The contract addresses deployed on Nevermined `Rinkeby` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessSecretStoreCondition        | v0.3.0  | `0x82109B64b5e57F7646d3E7E7b68bE7baA2A7b152` |
| AgreementStoreManager             | v0.3.0  | `0xEaa29506a228Eb6C7d23297596Ec676192eFA52C` |
| ComputeExecutionCondition         | v0.3.0  | `0x68fE91112540F9C0Ba2588A635A5B426f72e9528` |
| ConditionStoreManager             | v0.3.0  | `0x667D172EEE7ab400DF16535CA70159fE8662451B` |
| DIDRegistry                       | v0.3.0  | `0x7830042602f1D4772672e783A636f699b82b7C2B` |
| DIDRegistryLibrary                | v0.3.0  | `0x6243456044f8D82692cBb4D2C7234c5baC682680` |
| Dispenser                         | v0.3.0  | `0x5aDDCAF59Ac69e43BD2850cC549ad3EeA7884393` |
| EpochLibrary                      | v0.3.0  | `0xaC297F7262116c17a9524E71833eB107Aa649AE7` |
| EscrowAccessSecretStoreTemplate   | v0.3.0  | `0x4ec51839ed4eDa844f99Ae3d6D324E487aA8f95d` |
| EscrowComputeExecutionTemplate    | v0.3.0  | `0x253bABB1702864680b5c0Dcd6084086F42903659` |
| EscrowReward                      | v0.3.0  | `0xa56be8E65F6830f6aA856f09213F3ff6d51e3Af6` |
| HashLockCondition                 | v0.3.0  | `0x4c1dF193b745ECC6159d9bf1d3DB1b13845B4D80` |
| LockRewardCondition               | v0.3.0  | `0x0af287B7e8EdA92fFeD6E2bC1cc739bdC5ffd285` |
| OceanToken                        | v0.3.0  | `0x5f5cbAea5A58176264E14a5403fc5b2A008787c1` |
| SignCondition                     | v0.3.0  | `0xcD8602A94e17DedF9AF9f4c388B6ec8838bF058d` |
| TemplateStoreManager              | v0.3.0  | `0x87c7639cFaA6eb05B928A6d5fe8DE0Ecc3b4935D` |
| ThresholdCondition                | v0.3.0  | `0x503dac337B9e3605f3eC27dF72281f82818878cD` |
| WhitelistingCondition             | v0.3.0  | `0xfEC4D80C8F0d62F0e64E323684D94e4128c9898a` |


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

To facilitate the integration of the Ocean Protocol's `keeper-contracts` there are `Python`, `JavaScript` and `Java` packages ready to be integrated. Those libraries include the Smart Contract ABI's.
Using these packages helps to avoid compiling the Smart Contracts and copying the ABI's manually to your project. In that way the integration is cleaner and easier.
The packages provided currently are:

* JavaScript `npm` package - As part of the [@keyko-io npm organization](https://www.npmjs.com/settings/keyko-io/packages),
  the [npm nevermined-contracts package](https://www.npmjs.com/package/@keyko-io/nevermined-contracts) provides the ABI's
  to be imported from your `JavaScript` code.
* Python `Pypi` package - The [Pypi nevermined-contracts package](https://pypi.org/project/nevermined-contracts/) provides
  the same ABI's to be used from `Python`.
* Java `Maven` package - The [Maven nevermined-contracts package](https://search.maven.org/artifact/io.keyko/nevermined-contracts)
  provides the same ABI's to be used from `Java`.

The packages contains all the content from the `doc/` and `artifacts/` folders.

In `JavaScript` they can be used like this:

Install the `nevermined-contracts` `npm` package.

```bash
npm install @keyko-io/nevermined-contracts
```

Load the ABI of the `OceanToken` contract on the `staging` network:

```javascript
const OceanToken = require('@keyko-io/nevermined-contracts/artifacts/OceanToken.staging.json')
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

