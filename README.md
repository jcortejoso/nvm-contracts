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
            * [Alfajores (Celo) Testnet](#alfajores-celo-testnet)
            * [Bakalva (Celo) Testnet](#bakalva-celo-testnet)
            * [Rinkeby (Ethereum) Testnet](#rinkeby-ethereum-testnet)
            * [Mumbai (Polygon) Testnet](#mumbai-polygon-testnet)
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

The contract addresses deployed on Nevermined `Alfajores` Test Network:

#### Alfajores (Celo) Testnet

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.0.0 | `0x81b5764e3A79b195bfe6887B18e232b17e22d356` |
| AccessTemplate                    | v1.0.0 | `0x1fF6fBf77cc417674462A356905C033cc5a5dc97` |
| AgreementStoreManager             | v1.0.0 | `0x5Ab356eCeF4f1041Eefb13A66118b0ddCeD9E544` |
| ComputeExecutionCondition         | v1.0.0 | `0x9F0f6AA800199323D8894f03ac4dA8Eea62Fe882` |
| ConditionStoreManager             | v1.0.0 | `0x7d30e7462351d3287DF51280f4954585a5BaF952` |
| DIDRegistry                       | v1.0.0 | `0xb5E59f4BaCDC5cBb5ace97e37DD4b34A718Befbe` |
| DIDRegistryLibrary                | v1.0.0 | `0xf3b4547dD0f2475400121C7595c18172b40B50F0` |
| DIDSalesTemplate                  | v1.0.0 | `0x50D5c496e35b9A8f2aE42a6430e198DdB644Db53` |
| Dispenser                         | v1.0.0 | `0x611A767a6aD5EFfF3F9824CFa83d5BCdD1b0eE29` |
| EpochLibrary                      | v1.0.0 | `0xfFfa1141156fEE5ad3E0a1cA7f7D0aD1454FE7e8` |
| EscrowComputeExecutionTemplate    | v1.0.0 | `0xe183896ecF5864c25cfEedCF66a6D09259D89408` |
| EscrowPaymentCondition            | v1.0.0 | `0xaC79aC52b944B0b3058A12d8E29141E58A15c668` |
| HashLockCondition                 | v1.0.0 | `0xF2d2885343076e7B5BA5344F4603c15C412Db6eB` |
| LockPaymentCondition              | v1.0.0 | `0x8721df21E964d8ff10a69C60eef6Da46B003e67A` |
| NFTAccessCondition                | v1.0.0 | `0xed33f04A3a4Afdb263359f9D45fd235709Ce4577` |
| NFTAccessTemplate                 | v1.0.0 | `0xA6342881e0A93485e8819e5BeDfb062be25c451f` |
| NFTHolderCondition                | v1.0.0 | `0x209D112C4D1a0dfD10E2A900049ba46C03d8E139` |
| NFTLockCondition                  | v1.0.0 | `0x59FD917C0D8eE2D861828bFdc460f6c47A5214B5` |
| NFTSalesTemplate                  | v1.0.0 | `0xb55fF4Ed2001D006AC687793938ED68eD55BE96F` |
| NeverminedToken                   | v1.0.0 | `0x697881320067572788FC29e16ae6d635970C3bc5` |
| SignCondition                     | v1.0.0 | `0xf94D02a89ceB8f0013292782902937D3a2F8C25B` |
| TemplateStoreManager              | v1.0.0 | `0x14787AC28C7B6dCC4B856abd4E7Dee555B0170ab` |
| ThresholdCondition                | v1.0.0 | `0x47589D3f675037F4Ff174ceb40577743bCFd622d` |
| TransferDIDOwnershipCondition     | v1.0.0 | `0x52d2D0529EEDECE81aD381b21d860D54F55Da1dc` |
| TransferNFTCondition              | v1.0.0 | `0x6479Bc5ff22C66ac50641460dE90CD52d0118274` |
| WhitelistingCondition             | v1.0.0 | `0xAD1DD4D63aA874f677FD8Eafc227bEd81DD93834` |


#### Bakalva (Celo) Testnet

The contract addresses deployed on Nevermined `Baklava` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.0.0 | `0x7ff61090814B4159105B88d057a3e0cc1058ae44` |
| AccessTemplate                    | v1.0.0 | `0x39fa249ea6519f2076f304F6906c10C1F59B2F3e` |
| AgreementStoreManager             | v1.0.0 | `0x02Dd2D50f077C7060E4c3ac9f6487ae83b18Aa18` |
| ComputeExecutionCondition         | v1.0.0 | `0x411e198cf1F1274F69C8d9FF50C2A5eef95423B0` |
| ConditionStoreManager             | v1.0.0 | `0x028ff50FA80c0c131596A4925baca939E35A6164` |
| DIDRegistry                       | v1.0.0 | `0xd1Fa86a203902F763D6f710f5B088e5662961c0f` |
| DIDRegistryLibrary                | v1.0.0 | `0x93468169aB043284E53fb005Db176c8f3ea1b3AE` |
| DIDSalesTemplate                  | v1.0.0 | `0x862f483F35B136313786D67c0794E82deeBc850a` |
| Dispenser                         | v1.0.0 | `0xED520AeF97ca2afc2f477Aab031D9E68BDe722b9` |
| EpochLibrary                      | v1.0.0 | `0x42623Afd182D3752e2505DaD90563d85B539DD9B` |
| EscrowComputeExecutionTemplate    | v1.0.0 | `0xfB5eA07D3071cC75bb22585ceD009a443ed82c6F` |
| EscrowPaymentCondition            | v1.0.0 | `0x0C5cCd10a908909CF744a898Adfc299bB330E818` |
| HashLockCondition                 | v1.0.0 | `0xe565a776996c69E61636907E1159e407E3c8186d` |
| LockPaymentCondition              | v1.0.0 | `0x7CAE82F83D01695FE0A31099a5804bdC160b5b36` |
| NFTAccessCondition                | v1.0.0 | `0x49b8BAa9Cd224ea5c4488838b0454154cFb60850` |
| NFTAccessTemplate                 | v1.0.0 | `0x3B2b32cD386DeEcc3a5c9238320577A2432B03C1` |
| NFTHolderCondition                | v1.0.0 | `0xa963AcB9d5775DaA6B0189108b0044f83550641b` |
| NFTLockCondition                  | v1.0.0 | `0xD39e3Eb7A5427ec4BbAf761193ad79F6fCfA3256` |
| NFTSalesTemplate                  | v1.0.0 | `0xEe41F61E440FC2c92Bc7b0a902C5BcCd222F0233` |
| NeverminedToken                   | v1.0.0 | `0xEC1032f3cfc8a05c6eB20F69ACc716fA766AEE17` |
| SignCondition                     | v1.0.0 | `0xb96818dE64C492f4B66B3500F1Ee2b0929C39f6E` |
| TemplateStoreManager              | v1.0.0 | `0x4c161ea5784492650993d0BfeB24ff0Ac2bf8437` |
| ThresholdCondition                | v1.0.0 | `0x08D93dFe867f4a20830f1570df05d7af278c5236` |
| TransferDIDOwnershipCondition     | v1.0.0 | `0xdb6b856F7BEBba870053ba58F6e3eE48448173d3` |
| TransferNFTCondition              | v1.0.0 | `0x2de1C38030A4BB0AB4e60E600B3baa98b73400D9` |
| WhitelistingCondition             | v1.0.0 | `0x6D8D5FBD139d81dA245C3c215E0a50444434d11D` |


#### Rinkeby (Ethereum) Testnet

The contract addresses deployed on Nevermined `Rinkeby` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.1 | `0x5113CFDa2371477D1896f30Ca937665b7CAcC5b6` |
| AccessTemplate                    | v1.1.1 | `0x04254860b121C41823705f0c4c09E473598d529F` |
| AgreementStoreManager             | v1.1.1 | `0x8E6E203Eab59eb605086E5A608BAaB94a750959f` |
| ComputeExecutionCondition         | v1.1.1 | `0xf3AB77Ac3D3919765Db4B6A86568f3B816a99250` |
| ConditionStoreManager             | v1.1.1 | `0xC87E4254078E2c819D7806aafa290D59C8B45d8a` |
| DIDRegistry                       | v1.1.1 | `0x1278507777622598F8bb3c66510a705636D03fa9` |
| DIDRegistryLibrary                | v1.1.1 | `0x132b91DCe17e959aa7CFf2FAb11090d784EF897F` |
| DIDSalesTemplate                  | v1.1.1 | `0xDc40aee9E8a804e1BcbdED26D487D76879095b08` |
| Dispenser                         | v1.1.1 | `0x0d35B424Db6e004a7431F89a20844D6D59F23f84` |
| EpochLibrary                      | v1.1.1 | `0xC93F1862150f6cF87340F03987ac03911dE47732` |
| EscrowComputeExecutionTemplate    | v1.1.1 | `0xe7C59EBDb339f0113450eB18d720ab8A2fd999c3` |
| EscrowPaymentCondition            | v1.1.1 | `0x7f355ac80F611B9af07459036d9e8311399B136B` |
| HashLockCondition                 | v1.1.1 | `0x1A714e2F1B15Fa448ed591DfaC4d8bC294262E4d` |
| LockPaymentCondition              | v1.1.1 | `0x778CE0D5BaC6Cc60d1Ca1A121B186382FEB7DFC2` |
| NFT721AccessTemplate              | v1.1.1 | `0x96C556063aF9C2a8386e1b25DB0b42f8A0d414ee` |
| NFT721HolderCondition             | v1.1.1 | `0x44E982De74AdE92C2c5dbedA973ca76b30A3D1A3` |
| NFT721SalesTemplate               | v1.1.1 | `0x28cF27f693930A24A979458a5C28177250BEE285` |
| NFTAccessCondition                | v1.1.1 | `0x3019Eb7C9Ad14E36b1D130D8A8F1856C1b33A555` |
| NFTAccessTemplate                 | v1.1.1 | `0x3049F3064c6aFABC5193E9e97e2fc039255D5C87` |
| NFTHolderCondition                | v1.1.1 | `0xbc8bC598A26325373991352c0871e69E6Ce8Cf39` |
| NFTLockCondition                  | v1.1.1 | `0xd8e527e7f3bC09aF0a5293110649456497b06520` |
| NFTSalesTemplate                  | v1.1.1 | `0xcFcF97F80797d60186A0445BE59A16aA0339cC8E` |
| NeverminedToken                   | v1.1.1 | `0x8c8B41e349F1A0a3C2b3ed342058170F995DBB8e` |
| SignCondition                     | v1.1.1 | `0x52b6901F5061f9102Cd72658752d7B6ff6A94a34` |
| TemplateStoreManager              | v1.1.1 | `0xb719a960f2Fc5698d2459a60D53298680f9Aa775` |
| ThresholdCondition                | v1.1.1 | `0x346Fccc0479D14D75AAEff06Cb2cE0BB5c83fE07` |
| TransferDIDOwnershipCondition     | v1.1.1 | `0x162faCc52c94Fa5335bB28bb5AEd0C46d8A339a1` |
| TransferNFT721Condition           | v1.1.1 | `0x845352998B88fCA4A33b0F5FedCf3A2364ed9C01` |
| TransferNFTCondition              | v1.1.1 | `0xc8D48B1bEF9527c88AE2BB70D39f387941FB949e` |
| WhitelistingCondition             | v1.1.1 | `0xC331E4f88DCf3797387c89F70E5f81B6dD9c7a65` |


#### Mumbai (Polygon) Testnet

The contract addresses deployed on `Mymbai` Polygon Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.0.0 | `0x18bdFAf7Cc2B66a4Cfa7e069693CD1a9B639A69b` |
| AccessTemplate                    | v1.0.0 | `0x4Dd94Fd523a7a099f7E0B4478b295F21dD696b33` |
| AgreementStoreManager             | v1.0.0 | `0xC328d7b285A9fa340a0440985F1e7A6F65F0FecE` |
| ComputeExecutionCondition         | v1.0.0 | `0x861506c9F9BB71BA7bD6BeB961dD11D40c933496` |
| ConditionStoreManager             | v1.0.0 | `0x81568cE9D4C55Ba66067Fc2Cc941324Fc9E5a5af` |
| DIDRegistry                       | v1.0.0 | `0xE864a1463de48002e1014d152e0fBad8708e8A12` |
| DIDRegistryLibrary                | v1.0.0 | `0x7FB9933799E5b88513B62B076bCc60FdF3DB85e3` |
| DIDSalesTemplate                  | v1.0.0 | `0x562fFCC2E47052319B28F164945827D83cCaaBE3` |
| Dispenser                         | v1.0.0 | `0x832320316E8Ab9414642320fa9848DB5f296106F` |
| EpochLibrary                      | v1.0.0 | `0x54Bb351fDC258D2EAf4697393eD4F9B5f47FB09d` |
| EscrowComputeExecutionTemplate    | v1.0.0 | `0x815FD27492A944EE0E5Bac9626A353459fd1CFD2` |
| EscrowPaymentCondition            | v1.0.0 | `0x8cd0a26CAd8A4B16b164D8DCF20bB8C6b2fd7b15` |
| HashLockCondition                 | v1.0.0 | `0x4e88A7e4cC5749711B7eeCDDA832Ad7b5124326a` |
| LockPaymentCondition              | v1.0.0 | `0x917C55E3711D129Bb7df436B3368a0bCC7cBAB5C` |
| NFTAccessCondition                | v1.0.0 | `0x581B2d389BF678aFA8De0695756D811437A3D2CB` |
| NFTAccessTemplate                 | v1.0.0 | `0x79daFD4FADadd0E5ef24F94874C8fa3635dCC192` |
| NFTHolderCondition                | v1.0.0 | `0xdd41e0795660eDea209B1A049Fc52E45C292aE82` |
| NFTLockCondition                  | v1.0.0 | `0xC130f5581D33Ab2995be4ddC4126e8f69b4DA53d` |
| NFTSalesTemplate                  | v1.0.0 | `0xbCE97004D96A7C7176116b98Ad22fbA02Bb60365` |
| NeverminedToken                   | v1.0.0 | `0x1C8A6489F66072828144F556B66bDb92a51EB56A` |
| SignCondition                     | v1.0.0 | `0x6B0D2cB91dE206d18C30C2Ce83A19022be13C3F5` |
| TemplateStoreManager              | v1.0.0 | `0x6bFfcE539E7647B0B78aA4aF37a44bF5014E295E` |
| ThresholdCondition                | v1.0.0 | `0x3aAFDeE6a0e85c46cFCBeD133Ad30427ad0af07d` |
| TransferDIDOwnershipCondition     | v1.0.0 | `0x8E502BeeD0D20Eb24E3e50B37f7A71871f5F9730` |
| TransferNFTCondition              | v1.0.0 | `0xD4A83FbFA2c065aFB8e82946480257a4f8e61195` |
| WhitelistingCondition             | v1.0.0 | `0xbB6a2Defde7ecEc9F5f4AF4EcF9Cd40EbD656da0`


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
* Java `Maven` package - The [Maven nevermined-contracts package](https://search.maven.org/artifact/io.keyko.nevermined/contracts)
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
