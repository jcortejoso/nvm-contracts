[![banner](https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png)](https://nevermined.io)

# Nevermined Smart Contracts

> 💧 Smart Contracts implementation of Nevermined in Solidity
> [nevermined.io](https://nevermined.io)


[![Docker Build Status](https://img.shields.io/docker/cloud/build/neverminedio/contracts.svg)](https://hub.docker.com/r/neverminedio/contracts/)
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
```

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
| AccessCondition                   | v1.0.0-rc8 | `0xc42d4BEd2BEa4732099a789403eDe4f4243dFFbf` |
| AccessTemplate                    | v1.0.0-rc8 | `0x58458147D598134fB57118279Dc11e3B1f50eEcD` |
| AgreementStoreManager             | v1.0.0-rc8 | `0xF83751594630867413e3472d16464778632C3271` |
| ComputeExecutionCondition         | v1.0.0-rc8 | `0x77D5F0AE5Bb2425401d59E315D570Af0A93E73bA` |
| ConditionStoreManager             | v1.0.0-rc8 | `0x13d10521A4615d70346404a5127e5625621ffdF5` |
| DIDRegistry                       | v1.0.0-rc8 | `0x55991d3ADB521CF607da34A73c0b29696232aB41` |
| DIDRegistryLibrary                | v1.0.0-rc8 | `0xcfba7964dA7B846F14cd3A0ca7430ffB7dB1FaaF` |
| DIDSalesTemplate                  | v1.0.0-rc8 | `0x4B78Dfe6b9a37C2aE575d8b2d693aD3d9B1AC981` |
| Dispenser                         | v1.0.0-rc6 | `0x7218c9880e139258E6c90C124cde058A6A2dF896` |
| EpochLibrary                      | v1.0.0-rc8 | `0xC1120168656a3907B68aD31FA17769Fd52a2D939` |
| EscrowComputeExecutionTemplate    | v1.0.0-rc8 | `0xcf12d68820e849E37b3F43c619e9b9AbCc817c23` |
| EscrowPaymentCondition            | v1.0.0-rc8 | `0xBd6730f14347C98E680E625945B62633364DeE6d` |
| HashLockCondition                 | v1.0.0-rc8 | `0xeaD1df242CE86a798a7c4Aa26860F6F21a04a774` |
| LockPaymentCondition              | v1.0.0-rc8 | `0x7e2C8BA3427F9e8665eF5EF4485Fc813bcD7A322` |
| NFTAccessCondition                | v1.0.0-rc8 | `0x553f0c4504C22c5715eB38C5A9C34b4980FE4408` |
| NFTAccessTemplate                 | v1.0.0-rc8 | `0x9ddbC67cc7eAEb043Bd5E20DE1e3b4153bb89b96` |
| NFTHolderCondition                | v1.0.0-rc8 | `0x9aDFE93D8287Aa2aC4cfefF814c91212Aa4D7F61` |
| NFTLockCondition                  | v1.0.0-rc8 | `0xE924d38a57c7D26dA88a75bC24C2f86Abb3EBfA4` |
| NFTSalesTemplate                  | v1.0.0-rc8 | `0xc9E1dBC4B7BBF5f14B91BFE63fA0c034b9ee1012` |
| NeverminedToken                   | v1.0.0-rc6 | `0x623f78d38C72BbC034B0425aEa5238EB8d1D2d0D` |
| SignCondition                     | v1.0.0-rc8 | `0x5e290162a473deEb163b7fE868829123E2217392` |
| TemplateStoreManager              | v1.0.0-rc8 | `0xc80A2cc6f02161e37767a9FB44CcF380651b4dAC` |
| ThresholdCondition                | v1.0.0-rc8 | `0x36b735063106C096D75a9a838D28903121174902` |
| TransferDIDOwnershipCondition     | v1.0.0-rc8 | `0x05A4C367C29E3473F09a4c88758F468Fb02Be640` |
| TransferNFTCondition              | v1.0.0-rc8 | `0x603CBCC25e0D074B1459b1437ADFA276253cd2dB` |
| WhitelistingCondition             | v1.0.0-rc8 | `0xD61261ceD9e98fED410cAB8D08a1ed326Da9cdB3` |

#### Mumbai (Polygon) Testnet

The contract addresses deployed on `Mymbai` Polygon Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.0.0-rc6 | `0x41D6c7De453Ae1b3BCa53668a65cd7DCEF5A9D49` |
| AccessTemplate                    | v1.0.0-rc6 | `0x7289b77E935dF615fE88f709f5E4DCBE785C9b3f` |
| AgreementStoreManager             | v1.0.0-rc6 | `0x9775311039d8a191ba1B1CC5a958C4FA187Fc6bC` |
| ComputeExecutionCondition         | v1.0.0-rc6 | `0x870EF7Df184099C9a84668E81B2a1132999ad807` |
| ConditionStoreManager             | v1.0.0-rc6 | `0xF5DC40c5A4401315deA3f7B25c578c1f1BBF27Cf` |
| DIDRegistry                       | v1.0.0-rc6 | `0xeAF9fD8c08A2c1ff40E4c66f49858A8A2737a817` |
| DIDRegistryLibrary                | v1.0.0-rc6 | `0x81B6B1745Ba204A2203787cCf6B7eD1157241A1a` |
| DIDSalesTemplate                  | v1.0.0-rc6 | `0x30AB0D02AB2CDd562E601725E4C25FD21f7FFe44` |
| Dispenser                         | v1.0.0-rc6 | `0xf13A10F68b1eF67Be18cdf303BE1EBF439bfE358` |
| EpochLibrary                      | v1.0.0-rc6 | `0x4D6FBFEF2b561E4C10b00a188d758E0490248730` |
| EscrowComputeExecutionTemplate    | v1.0.0-rc6 | `0xc9dA769E2aCc216db3f74846613B5c080d0C37Bd` |
| EscrowPaymentCondition            | v1.0.0-rc6 | `0x94BB362319238d3ceFeDF7f9E3fa178dD96253c2` |
| HashLockCondition                 | v1.0.0-rc6 | `0x55c91Fb3011aB0446fAae46e53244EBF2a8975C2` |
| LockPaymentCondition              | v1.0.0-rc6 | `0xc417A5CE4d65931f9433D54e134c831D1D78ad9A` |
| NFTAccessCondition                | v1.0.0-rc6 | `0x3EaFe36E98539672DD06578f8EE66aD2eE6ABC41` |
| NFTAccessTemplate                 | v1.0.0-rc6 | `0xf2ab741100F734090cdB19890305e5E96929bff4` |
| NFTHolderCondition                | v1.0.0-rc6 | `0x7822d38A9e1EEe6d0B98035115A9ec2E7F130ed1` |
| NFTLockCondition                  | v1.0.0-rc6 | `0x5794B837677AEd8e12ee194707fF1a7e55998B16` |
| NFTSalesTemplate                  | v1.0.0-rc6 | `0x7Dee2F5522565c463CceF89b511729BF6b702dA3` |
| NeverminedToken                   | v1.0.0-rc6 | `0xa763B0747A7772914AfEA681c31Af55c806B254E` |
| SignCondition                     | v1.0.0-rc6 | `0x9DedBd2903789b60745B6fa7dE5FB60EF9DdEaF2` |
| TemplateStoreManager              | v1.0.0-rc6 | `0x43fac08524e6836DC760313911ea32dFccee6fF0` |
| ThresholdCondition                | v1.0.0-rc6 | `0x707f6E0450dD507d5d43158974B73D2C63ABA0Cb` |
| TransferDIDOwnershipCondition     | v1.0.0-rc6 | `0x53D68ED4E865bD508E16379139869aFeE85b34f5` |
| TransferNFTCondition              | v1.0.0-rc6 | `0x77Ae9161Ca4B2b84CCB3E321854e029FEe01D7FE` |
| WhitelistingCondition             | v1.0.0-rc6 | `0xE4c350292860153e478e10849A5f3C6d9790Ebf3` |


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
