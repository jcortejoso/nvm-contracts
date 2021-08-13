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
| AccessCondition                   | v1.1.2 | `0x6fD85bdc2181955d1e13e69cF6b7D823065C3Ca7` |
| AccessTemplate                    | v1.1.2 | `0xb0c62D9396C2FEcBb51eD6EB26c0Ed4f5eA4a346` |
| AgreementStoreManager             | v1.1.2 | `0xC2ED028fAf0b638A194C40d7E223088FA4cF85DC` |
| ComputeExecutionCondition         | v1.1.2 | `0xA142534b8c7130CFE1bf73128E86ec9c9369Faa4` |
| ConditionStoreManager             | v1.1.2 | `0xFc0cA52987D5494eD42B9f317803b54C0161b98D` |
| DIDRegistry                       | v1.1.2 | `0xC0a99b11eC971fc6041a685fb04DC5A35F65C2FF` |
| DIDRegistryLibrary                | v1.1.2 | `0xA72435e7990d4D9b3Bf31aF6da90c5814Ae1799F` |
| DIDSalesTemplate                  | v1.1.2 | `0x903071Ed3061Ebb36FFc865910D4CfdEfaCfC615` |
| Dispenser                         | v1.1.2 | `0xfaAF4c7E8a6A7a5598F22559b5c2cdeBEB9e6B0e` |
| EpochLibrary                      | v1.1.2 | `0x717920AbFBa53187613b3e7AE7b9992F1A7d96ca` |
| EscrowComputeExecutionTemplate    | v1.1.2 | `0xEA051aA47feC676F0962fE4EF44D3728f7EB4a0F` |
| EscrowPaymentCondition            | v1.1.2 | `0xb7aD2564D07870126fF96A14E2959b16141529C6` |
| HashLockCondition                 | v1.1.2 | `0x31E11A66E07a17C620A14D554C216c2622be377e` |
| LockPaymentCondition              | v1.1.2 | `0x8D2049565125700276f4407dbE269c4b275eE21e` |
| NFT721AccessTemplate              | v1.1.2 | `0x8A9f71c256FD31E8b73396316fFB57F70CEE19e1` |
| NFT721HolderCondition             | v1.1.2 | `0xAAc307dEC41cFD667f70365A7C51E632eDAAE6F9` |
| NFT721SalesTemplate               | v1.1.2 | `0x49AfF1F940C5d8C10FC8b81eD4155BF05dfcb9Ef` |
| NFTAccessCondition                | v1.1.2 | `0x6aA035fc4683D413fAa8bAe3f00CaAc712C2A502` |
| NFTAccessTemplate                 | v1.1.2 | `0x0aDeA2BE5f5E38DC60700e8a3a5203feE02985DB` |
| NFTHolderCondition                | v1.1.2 | `0x83342074cAb5b624Ea2361782AcC32da76641F33` |
| NFTLockCondition                  | v1.1.2 | `0xF951001D5516C682c5aF6DF2cB0250E4addd1252` |
| NFTSalesTemplate                  | v1.1.2 | `0x24edffc52926739E8403E451b791378349f38818` |
| NeverminedToken                   | v1.1.2 | `0x937Cc2ec24871eA547F79BE8b47cd88C0958Cc4D` |
| SignCondition                     | v1.1.2 | `0x287C2FdD23d3E2C18217e7329B62dBa3F8be777c` |
| TemplateStoreManager              | v1.1.2 | `0x45eBFAdAdc64D86F2bC7ed756EA2D5AfC0c64e51` |
| ThresholdCondition                | v1.1.2 | `0x683132AD20b4048073256484772a9fa6eeccf4e0` |
| TransferDIDOwnershipCondition     | v1.1.2 | `0x269Dec0aBCb0232422F5B13cd343e63CdB922818` |
| TransferNFT721Condition           | v1.1.2 | `0x5975fE95EABBDe0AAFD879AEEeC2172391d560a5` |
| TransferNFTCondition              | v1.1.2 | `0x6e81A4571C35F5786043fC9f6545F95c7B4E90A7` |
| WhitelistingCondition             | v1.1.2 | `0x1f361FfdA721eFc38Ca389603E39F31fdEddAbaf` |


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

### Ethereum Mainnet

The contract addresses deployed on `Production` Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.2 | `0xBa635a16ad65fc44776F4577E006e54B739170e1` |
| AccessTemplate                    | v1.1.2 | `0x5cc43778946671Ab88Be0d98B2Bc25C0c67095bb` |
| AgreementStoreManager             | v1.1.2 | `0xD0cFcf159dC1c6573ba203c7f37EF7fAAa9c0E88` |
| ComputeExecutionCondition         | v1.1.2 | `0xDc8c172404e3cF4D16Bc0De877656c4ba58f3384` |
| ConditionStoreManager             | v1.1.2 | `0x2Da0b5a6B0015B698025Ad164f82BF01E8B43214` |
| DIDRegistry                       | v1.1.2 | `0xA77b7C01D136694d77494F2de1272a526018B04D` |
| DIDRegistryLibrary                | v1.1.2 | `0xA1B7057C80d845Abea287608293930d02197a954` |
| DIDSalesTemplate                  | v1.1.2 | `0x81a2A6b639E6c3a158368B2fAF72a3F51Fa45B00` |
| EpochLibrary                      | v1.1.2 | `0x6D77b0aa745D3498a36971a3C0138Ee6c2B947cA` |
| EscrowComputeExecutionTemplate    | v1.1.2 | `0x7c912E94aF9e8Bbf1e4Dcf2Cdf5506ea71E084D9` |
| EscrowPaymentCondition            | v1.1.2 | `0xc33269A0E2Edca46c3d0b2B2B25aFeEE6F828405` |
| HashLockCondition                 | v1.1.2 | `0x6B309450FaE559913132585b06CCD5Fe9999037f` |
| LockPaymentCondition              | v1.1.2 | `0x611923E1d809a53aB2731Dd872778B3cEdD5C1D4` |
| NFT721AccessTemplate              | v1.1.2 | `0x0d9c4CB03fB90ABC58F23C52bD9E3eD27fE55f39` |
| NFT721HolderCondition             | v1.1.2 | `0x0a83EDEeB843E9e96f57bf33f53969BF052c2cE4` |
| NFT721SalesTemplate               | v1.1.2 | `0xA5BA02CbdC3c005aFC616A53d97488327ef494BE` |
| NFTAccessCondition                | v1.1.2 | `0xa2D1D6DA85df69812FF741d77Efb77CAfF1d9dc9` |
| NFTAccessTemplate                 | v1.1.2 | `0x335E1A2ec8854074BC1b64eFf0FF642a443243a5` |
| NFTHolderCondition                | v1.1.2 | `0x9144f4831aa963963bf8737b45C5eea810efB7e7` |
| NFTLockCondition                  | v1.1.2 | `0x877E2Fd93Eb74095591b90ADc721A128b637b21C` |
| NFTSalesTemplate                  | v1.1.2 | `0x2b87C77F7023cb3956aeE3490CfC1Da90571E7DB` |
| SignCondition                     | v1.1.2 | `0x10da0625d8300BF40dE3721a0150F0E724611d44` |
| TemplateStoreManager              | v1.1.2 | `0xfD0cf3a91EC3BE427785783EE34a9116AED085b6` |
| ThresholdCondition                | v1.1.2 | `0xea8F5b9Ddd826eC48B1e8991A947D6EaAE495213` |
| TransferDIDOwnershipCondition     | v1.1.2 | `0xE2AC5Bca96a7f9ECa2037F001AD51C7f37820bAF` |
| TransferNFT721Condition           | v1.1.2 | `0x89B39c7b8602778316fA51E00235CE418aC06c2F` |
| TransferNFTCondition              | v1.1.2 | `0x3c8D330419f59C1586C1D4F8e4f3f70F09606455` |
| WhitelistingCondition             | v1.1.2 | `0x489f500aA3ED426eA0d45FB7769cfba85f1AA737` |


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
