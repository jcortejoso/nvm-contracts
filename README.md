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
| AccessCondition                   | v1.0.0-rc5 | `0xfBa38fa846E5c38845AA87Eb43Ed571Df6f71938` |
| AccessTemplate                    | v1.0.0-rc5 | `0x5DFd35399B64bD8457b3667Ba79D83A31Bc08D28` |
| AgreementStoreManager             | v1.0.0-rc5 | `0x2d8BCaDdf251384C28644155bB853fd200f2Ff2B` |
| ComputeExecutionCondition         | v1.0.0-rc5 | `0xa99b7B332CFd88b127513A1f55BD13c5d7de4C16` |
| ConditionStoreManager             | v1.0.0-rc5 | `0xa42e0C25Ef78e7DC1676384fecE2e54B291a99fc` |
| DIDRegistry                       | v1.0.0-rc5 | `0x38fc69a8b1A347677D713420Fc9E8EaCcBE3C3C2` |
| DIDRegistryLibrary                | v1.0.0-rc5 | `0x48639b9712C847b3dd5b8a751719B59aB62c2C9F` |
| DIDSalesTemplate                  | v1.0.0-rc5 | `0xfBe606e48ca0DD942a1D055DcfD58Fdf507b6725` |
| Dispenser                         | v1.0.0-rc5 | `0x7218c9880e139258E6c90C124cde058A6A2dF896` |
| EpochLibrary                      | v1.0.0-rc5 | `0xf92465Ec1BEfc3dE58bBfbA2F2d5A72aaAfb06C2` |
| EscrowComputeExecutionTemplate    | v1.0.0-rc5 | `0x943C561Be307749f65B8A884A3388B6439dCeeec` |
| EscrowPaymentCondition            | v1.0.0-rc5 | `0x3C4C38F5cdBF706a8f6355a60Fbcfd92d58Aad8a` |
| HashLockCondition                 | v1.0.0-rc5 | `0x19c50775D9B93D6C1b9C0b2Ac9651F9a8281CaFD` |
| LockPaymentCondition              | v1.0.0-rc5 | `0xC57e97bC1602FF9F970B4C94884178134b4CD9De` |
| NFTAccessCondition                | v1.0.0-rc5 | `0xFC46F8B2272D1aFbFae4d35357D618F10f7ba11F` |
| NFTAccessTemplate                 | v1.0.0-rc5 | `0x761A7cC5def5C2413141B3Ae0652937A0aB95609` |
| NFTHolderCondition                | v1.0.0-rc5 | `0x1B62A9418eb908535251dfD15ac252505EB81567` |
| NFTLockCondition                  | v1.0.0-rc5 | `0x4d3a045ECec1EA3D9Ee063af7127177958f5cfc6` |
| NFTSalesTemplate                  | v1.0.0-rc5 | `0x88B96A210e8f6f27BA59f0CAF7F39cA2653B647F` |
| NeverminedToken                   | v1.0.0-rc5 | `0x623f78d38C72BbC034B0425aEa5238EB8d1D2d0D` |
| SignCondition                     | v1.0.0-rc5 | `0xDF2854d1116220C6C9397b592761f8b20D44471a` |
| TemplateStoreManager              | v1.0.0-rc5 | `0x21d13f36c65Bb51764d05b81d2cB2fbabCbc9E8d` |
| ThresholdCondition                | v1.0.0-rc5 | `0x2e33C50DBfc7Ee2cf12E118CE09F65c24ed02583` |
| TransferDIDOwnershipCondition     | v1.0.0-rc5 | `0xb84cCBb63e37DE7c0AD0eBd9694C5781df8354Df` |
| TransferNFTCondition              | v1.0.0-rc5 | `0x205bC979BC5aF48f7925005b6E1a5E0280bde823` |
| WhitelistingCondition             | v1.0.0-rc5 | `0xE5C62FF3f5fCC3dE062a5002f538a7027c3D355c` |


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
