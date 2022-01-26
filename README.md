[![banner](https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png)](https://nevermined.io)

# Nevermined Smart Contracts

> 💧 Smart Contracts implementation of Nevermined in Solidity
> [nevermined.io](https://nevermined.io)

[![Docker Build Status](https://img.shields.io/docker/cloud/build/neverminedio/contracts.svg)](https://hub.docker.com/r/neverminedio/contracts/)
![Build](https://github.com/nevermined-io/contracts/workflows/Build/badge.svg)
![NPM Package](https://github.com/nevermined-io/contracts/workflows/NPM%20Release/badge.svg)
![Pypi Package](https://github.com/nevermined-io/contracts/workflows/Pypi%20Release/badge.svg)
![Maven Package](https://github.com/nevermined-io/contracts/workflows/Maven%20Release/badge.svg)

## Table of Contents

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
      * [Aurora Testnet](#aurora-testnet)
      * [Integration Testnet](#integration-testnet)
      * [Staging Testnet](#staging-testnet)
    * [Mainnets](#mainnets)
      * [Ethereum Mainnet](#ethereum-mainnet)
      * [Aurora Mainnet](#aurora-mainnet)
      * [Polygon Mainnet](#polygon-mainnet)
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

* Node.js
* yarn

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

The contract addresses deployed on `Alfajores` Celo Test Network:

#### Alfajores (Celo) Testnet

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition               | v1.3.2 | `0xf4cD4CE057bEFEF0697b738bE7Ba4b09Bf2aF075` |
| AaveCollateralDepositCondition    | v1.3.2 | `0x71371C8116CbfDcC1829df26E62421B67019ff0f` |
| AaveCollateralWithdrawCondition   | v1.3.2 | `0x9B18E0F6fbC0160E38F20385BDD9f7233Ffa770D` |
| AaveCreditTemplate                | v1.3.2 | `0xe34F8472B40C4E51183F00C306471E2a5972b69E` |
| AaveCreditVault                   | v1.3.2 | `undefined` |
| AaveRepayCondition                | v1.3.2 | `0x92FBAeB773760F20eC061fc6A9D853b928B02239` |
| AccessCondition                   | v1.3.2 | `0x55e497c9E29e0CD0C0F90fa12F3ed1a11D0aC66B` |
| AccessProofCondition              | v1.3.2 | `0xD21b6Cd3ae94C2EA221535E38FC52718ad4Dda40` |
| AccessProofTemplate               | v1.3.2 | `0xfB776a4692543Fb3332c6d0534dd3b2209d367c0` |
| AccessTemplate                    | v1.3.2 | `0x65B16ae206c413D22cE2F359AF5389338D23b2Ac` |
| AgreementStoreManager             | v1.3.2 | `0x17c6786Ba39a3a20c5774e81639997Ea353de721` |
| ComputeExecutionCondition         | v1.3.2 | `0x4341a3CcC2fbC15f09e3d68F1330A0267991A10E` |
| ConditionStoreManager             | v1.3.2 | `0x9a29061f52BfB86dE5cdE7e552838dD0C5be8cD1` |
| DIDRegistry                       | v1.3.2 | `0x1B109EfF37263AEa22941063BdCe1385b41E743F` |
| DIDRegistryLibrary                | v1.3.2 | `0x3338f72579DFE42Fe24a3CB5e4ed83A184c04db6` |
| DIDSalesTemplate                  | v1.3.2 | `0xf1CEdF8cb0681470629E3Dd21d17272821c41836` |
| Dispenser                         | v1.3.2 | `0xA3101b6a96075080C361135bD702548a2825ba34` |
| DistributeNFTCollateralCondition  | v1.3.2 | `0x14402dE5Aa9e30F8Cab05c8f94f3E79FC2648fc1` |
| EpochLibrary                      | v1.3.2 | `0x040E764e0B21bF8b0A815aA493299DD13502b427` |
| EscrowComputeExecutionTemplate    | v1.3.2 | `0x28bE81833292a15d67b5eCB813720Af56bE33C03` |
| EscrowPaymentCondition            | v1.3.2 | `0x48A424e57E3883C8c1ab2c6aEdbFc2b1455C1Adc` |
| HashLockCondition                 | v1.3.2 | `0x06dbEa7642Ba6B85295E6493e25d7763076D96de` |
| LockPaymentCondition              | v1.3.2 | `0x32fFE8cb20a99125e13A80BaDE2555Cdf81AEBCc` |
| NFT721AccessTemplate              | v1.3.2 | `0x6ec9F6BeB2b169097925b442B18E92B898d2E06e` |
| NFT721HolderCondition             | v1.3.2 | `0xa9c11195eBa8BdC7FECaAbE563b38E61f234DedB` |
| NFT721LockCondition               | v1.3.2 | `0x1E5cDa300D262d5744DeF46e7E73eCA76c13Cdfa` |
| NFT721SalesTemplate               | v1.3.2 | `0x0e2Af7677eCB16b156027b7495E5DB0D87c0D8D6` |
| NFT721Upgradeable                 | v1.3.2 | `0xf0A510BAd6464C93C92d68696ABFD5bfFF1F875D` |
| NFTAccessCondition                | v1.3.2 | `0x3629608C5C1eA24a2443D6E8d049Fec1E85814c0` |
| NFTAccessTemplate                 | v1.3.2 | `0x1ea1be772F7a67BD008D590069BACED81BAEC1A9` |
| NFTHolderCondition                | v1.3.2 | `0x905299431c32Ce4bD0c1D0A4aa93E87DE4838531` |
| NFTLockCondition                  | v1.3.2 | `0xE32E87Cc84c741969174f9EEaf2A2F8F432D4f18` |
| NFTSalesTemplate                  | v1.3.2 | `0x084Ee3DF3f4a9143D4cadAa6B072F6aD14F75ef1` |
| NFTUpgradeable                    | v1.3.2 | `0x1863d20482655cB3d2A63Da23677DD54314AaF92` |
| NeverminedToken                   | v1.3.2 | `0xE84E4b269EE6248341b2d887255B552ef7dFd246` |
| PlonkVerifier                     | v1.3.2 | `0x5B12D1f2EE8579a6DaB06D6B5e2818bEA29eFb86` |
| SignCondition                     | v1.3.2 | `0x4Fd9DA017A0B45989Dfd5AC18eE11c73Ad5ba83b` |
| TemplateStoreManager              | v1.3.2 | `0x21211B599d104DDA3382Ed3C615a7e62214cc080` |
| ThresholdCondition                | v1.3.2 | `0x0b82276Ca1DA87b609275d420B77aFC66B41a8be` |
| TransferDIDOwnershipCondition     | v1.3.2 | `0x2eC1B0c98bdD9a06Bb017dcc87447Ced604e411D` |
| TransferNFT721Condition           | v1.3.2 | `0x2694110B5412Ed787E1fAe4D82D2570a73017800` |
| TransferNFTCondition              | v1.3.2 | `0x96B7F119a8fCD931E44A7173D5FebeD52cc87a61` |
| WhitelistingCondition             | v1.3.2 | `0xe85Eb31073019f4EB85a37e5FE14B13A5cC93EF6` |

#### Bakalva (Celo) Testnet

The contract addresses deployed on `Baklava` Celo Test Network:

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

The contract addresses deployed on `Mumbai` Polygon Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition               | v1.3.3 | `0x96EF6Fa63c1f316aD25b4c263213237d56eAE9eE` |
| AaveCollateralDepositCondition    | v1.3.3 | `0x589c850321E957850E0F36CDd70Bbfa46f0aA51f` |
| AaveCollateralWithdrawCondition   | v1.3.3 | `0x74bd61EEd870CA22abd6b40BC2cb96c306C9Ff2e` |
| AaveCreditTemplate                | v1.3.3 | `0xD29fA4C792a2a91254F7fee2f281cf4C20dC16d8` |
| AaveCreditVault                   | v1.3.3 | `undefined` |
| AaveRepayCondition                | v1.3.3 | `0x9D5F4dab208b2ec4109cC199d8FCc8b8dbC4d0F4` |
| AccessCondition                   | v1.3.3 | `0x4481aE51C8C4E70Fc583512b88Be6e92e9a3A466` |
| AccessProofCondition              | v1.3.3 | `0xA7307Df10Db49E3613c124F50A1B047A2aC8eb8a` |
| AccessProofTemplate               | v1.3.3 | `0xc812Dfb419E77cA709bDF073643408b1aBFC181e` |
| AccessTemplate                    | v1.3.3 | `0xc49Ff5d67d0137e0827aF86Cfc9B3Ac007Ab26Ba` |
| AgreementStoreManager             | v1.3.3 | `0x6d3412e0929bB6d7785A81121986CC51d91E488c` |
| ComputeExecutionCondition         | v1.3.3 | `0x46E9c855746FCF757B3f9363B1510d2ea7d072cF` |
| ConditionStoreManager             | v1.3.3 | `0x5A67f0e2c071CbBe6Afe94F7B76d88DcE56ed151` |
| DIDRegistry                       | v1.3.3 | `0x89eE6B9368fC9EA63AbF3DBdD1063a5131967C88` |
| DIDRegistryLibrary                | v1.3.3 | `0x22495Fd5A8f74B73C1b2123913B3F644fb1cef5B` |
| DIDSalesTemplate                  | v1.3.3 | `0xD17C401964006Fef4621e1b13e5AC4964000DDDf` |
| Dispenser                         | v1.3.3 | `0xB9C4b4a3Ce029af7C59ce331600D5434CDc757E3` |
| DistributeNFTCollateralCondition  | v1.3.3 | `0xB1b79367460b9758e3108F58c67527491a3b224C` |
| EpochLibrary                      | v1.3.3 | `0x9073A4aF0110d9A01588684516D7bcd3c8eC5BD7` |
| EscrowComputeExecutionTemplate    | v1.3.3 | `0x1dbB7ADb2bA306639094634c978DD45cee1c5d55` |
| EscrowPaymentCondition            | v1.3.3 | `0xf99298FbAf209dD551901146DC29f0c8340915D5` |
| HashLockCondition                 | v1.3.3 | `0x101aC7fBa0feF67f55C577F0c569759C3D51E128` |
| LockPaymentCondition              | v1.3.3 | `0xd7Aa81039Cfc2aAcCf7C05A94F58E6e72cF69b53` |
| NFT721AccessTemplate              | v1.3.3 | `0x9605421A41E13eEc9aFA4Aac125FdDE0E4fe6351` |
| NFT721HolderCondition             | v1.3.3 | `0x66c31455Fdc5B2Cc6b17cFe3fcA8b5d0fdaDc3ef` |
| NFT721LockCondition               | v1.3.3 | `0xE7dd6C06080995845682d2d316A1F8b807f293F5` |
| NFT721SalesTemplate               | v1.3.3 | `0xDf7864a9415c205033fE6Ca8ec4F28dCE7460604` |
| NFT721Upgradeable                 | v1.3.3 | `0x769C44a549397bC583e6A6774323DaCae43198A7` |
| NFTAccessCondition                | v1.3.3 | `0xbf3a471bc0731D44a491077b0e49e8bb9387dC82` |
| NFTAccessTemplate                 | v1.3.3 | `0x0EcDdd94cBFc44872e6f8843913dBc016A913196` |
| NFTHolderCondition                | v1.3.3 | `0x2D453421DF11c947ed06D3572480EfF96cAacff2` |
| NFTLockCondition                  | v1.3.3 | `0x7b540cdF8f2ef86Cc43156986b3e245FCB951438` |
| NFTSalesTemplate                  | v1.3.3 | `0x37B9226Bc198368616091c97a687D35D25c469d0` |
| NFTUpgradeable                    | v1.3.3 | `0x6e0119849F7af64C18AF136767b59A2F309007C5` |
| NeverminedToken                   | v1.3.3 | `0x1A8F4a46074A6A9c5A5Ac1C528eBD925AD03611D` |
| PlonkVerifier                     | v1.3.3 | `0x1310A075F608a43eb495d9cEfC975ed88A8fB3Db` |
| SignCondition                     | v1.3.3 | `0xBf7Fd94d82F97e232f854b4E6d154d0dED2d0DCF` |
| TemplateStoreManager              | v1.3.3 | `0xbbe1da769ea499CFCDF7d1747f3eEd69fbad6aD3` |
| ThresholdCondition                | v1.3.3 | `0xD4993c78161A007214a75C0272D1d44B7028FDC7` |
| TransferDIDOwnershipCondition     | v1.3.3 | `0x5FBf4227eB9E5B50Fd9B15eC0A84e5AD0E2eB6aB` |
| TransferNFT721Condition           | v1.3.3 | `0xB322660c8a17C012fe17d40407e710ee0Da07bBD` |
| TransferNFTCondition              | v1.3.3 | `0x341f0948a26665343Daf8d3cf98e5aD47C10298A` |
| WhitelistingCondition             | v1.3.3 | `0xDe2087BBF2e5879Ddb979F98A999Fd4Ac4199863` |

#### Aurora Testnet

The contract addresses deployed on `Aurora` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.6 | `0xb9fD8208312ECB87875860c0F109118522885D9E` |
| AccessProofCondition              | v1.1.6 | `0x64950B0DF2aBc338b3191cBa0a8a87beBda2A315` |
| AccessProofTemplate               | v1.1.6 | `0x774B9A093eeC6e4196Eb82B914d675DCc9d08599` |
| AccessTemplate                    | v1.1.6 | `0x8353452CEf320A7F280B52dB7B30aA17bF8Fe754` |
| AgreementStoreManager             | v1.1.6 | `0x5368E27DBbA96070a3284FD7a79A34bb75b6B464` |
| ComputeExecutionCondition         | v1.1.6 | `0xFbf27C54B16679DDbFd8678713C586aD40323461` |
| ConditionStoreManager             | v1.1.6 | `0x5e119AddB2bce6cbe7044305915963CC4ab2bB6C` |
| DIDRegistry                       | v1.1.6 | `0xa389Fbea7Fdd9A052394b36B88e943C2c4c82be0` |
| DIDRegistryLibrary                | v1.1.6 | `0xA98A97E2986d81b93C712b836241EaFf6D689AB6` |
| DIDSalesTemplate                  | v1.1.6 | `0xA3E7F6cb1990b9f1f6b097be6D0905e03f5E1b85` |
| Dispenser                         | v1.1.6 | `0x7F5AD4E1a5d52A8f26C13d8B0C62BAa23E7bbD98` |
| EpochLibrary                      | v1.1.6 | `0x8CC543360af2643491788723B48baeBE0a80C8E1` |
| EscrowComputeExecutionTemplate    | v1.1.6 | `0xaa2627619d684921468edd8E2F62836749eFf1d4` |
| EscrowPaymentCondition            | v1.1.6 | `0x1775c299e68d075B7B6FB96B350dCDC808D1489a` |
| HashLockCondition                 | v1.1.6 | `0xd7ed0f2967F913c08b48c3494454471dED723297` |
| LockPaymentCondition              | v1.1.6 | `0x9Aa8f07dD00E859278822baECcc23F02A031898E` |
| NFT721AccessTemplate              | v1.1.6 | `0xca627BEb138F91470ff06AD7D24f3e51996b0653` |
| NFT721HolderCondition             | v1.1.6 | `0x3a43FC31E66E3b3545C912DD824790612866Fcd0` |
| NFT721SalesTemplate               | v1.1.6 | `0x05679Bea4229C18330fE0AC8679ab93E56F6b7Da` |
| NFTAccessCondition                | v1.1.6 | `0x742661264Fc11B909b85B278186e62D2DfE2233f` |
| NFTAccessTemplate                 | v1.1.6 | `0x80EEA56a10c1020508c13aB86C36c398B45FeF79` |
| NFTHolderCondition                | v1.1.6 | `0x5E1AF7dC0B8D461Cd02c80763025C482B3E6B17d` |
| NFTLockCondition                  | v1.1.6 | `0x34D2F25f967a6F6f87Df7F166BA8cBe3372aA827` |
| NFTSalesTemplate                  | v1.1.6 | `0x7F4Aab50B4d07493F22668417ef1433469895F51` |
| NeverminedToken                   | v1.1.6 | `0x43a0Fcde497c2051B8D207afA4145f27a9194d69` |
| PlonkVerifier                     | v1.1.6 | `0x7B7686C399734Fe082D6f558853992b5368325b8` |
| SignCondition                     | v1.1.6 | `0x7886DB81c0BD9Da700E8Fd21Ec3f12c5ce8D2a06` |
| TemplateStoreManager              | v1.1.6 | `0x780d3Ab357f1C44014d27d60765b7d4F9a7b90Ed` |
| ThresholdCondition                | v1.1.6 | `0xFEF1a4F4827F0B3a281700D796D2710Ac2C86105` |
| TransferDIDOwnershipCondition     | v1.1.6 | `0xBc331069400E907F33c6280a433552f784567a0c` |
| TransferNFT721Condition           | v1.1.6 | `0x144BD5752D3DbF42e9B7aF106FEe8E5160a9CE13` |
| TransferNFTCondition              | v1.1.6 | `0x1F66d913AB40095700dbB1a5a1D369996E3Dcb9e` |
| WhitelistingCondition             | v1.1.6 | `0x10C7501d55228EE102f403410a9b40f6330669CE` |

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

### Aurora Mainnet

The contract addresses deployed on `Aurora` Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.7 | `0xEA2Ab20CC1c567D9cd56E4561Aa2aebDB60f9a1E` |
| AccessProofCondition              | v1.1.7 | `0xa1B731118AcA483f64Ef1FB7008583eC0B35d50D` |
| AccessProofTemplate               | v1.1.7 | `0x1a22eB22F726399812Ca3B998C2D09FDf0f3Ac0C` |
| AccessTemplate                    | v1.1.7 | `0x672Cc04436ADeD82b448B2f6De58267e1809e366` |
| AgreementStoreManager             | v1.1.7 | `0xc6Ab25648B0c5a473Bd37D95c60a918fE4aD8c86` |
| ComputeExecutionCondition         | v1.1.7 | `0x23C91929eeD7fbe4deEdc0dBe2980A93a02844D2` |
| ConditionStoreManager             | v1.1.7 | `0x5CC62ffDA628D60b49C81aeF2d3D87CBb4267174` |
| DIDRegistry                       | v1.1.7 | `0xb03e4A759763a45e9823082D2c6D8C905A21a8A1` |
| DIDRegistryLibrary                | v1.1.7 | `0x09050EA73A24bdD3B96Eb753D8aAcB07238f8E5D` |
| DIDSalesTemplate                  | v1.1.7 | `0x46A23e3b87E31f74960007a698d5ec70fa0097A3` |
| EpochLibrary                      | v1.1.7 | `0x2e0c35E54FeeaCb838cDF5c848f27d7163d87f85` |
| EscrowComputeExecutionTemplate    | v1.1.7 | `0x5C0C69A8454b91874C029211cFA5DF6a3cFBe182` |
| EscrowPaymentCondition            | v1.1.7 | `0xB9f14F8e6b801bAd954bD272cf136Fe04099d9a8` |
| HashLockCondition                 | v1.1.7 | `0x159B2eF7254051e871b8E3009B8596BFA1F5cE36` |
| LockPaymentCondition              | v1.1.7 | `0xcdf2C7178D9f48dcB4a41fd6A63D9C69E859a796` |
| NFT721AccessTemplate              | v1.1.7 | `0x168E5D053393E95C8026d4BEEaaDE1CBaCEa4F37` |
| NFT721HolderCondition             | v1.1.7 | `0x553B42E76feFF07b9AadaCC5bf1b324663BF8A5E` |
| NFT721SalesTemplate               | v1.1.7 | `0x6d8a38D3c18C8658d3c6750aa85Ab20Aff8cFCae` |
| NFTAccessCondition                | v1.1.7 | `0xFE6C051Fa306d2c05907D088b27a74E8F7aEF35F` |
| NFTAccessTemplate                 | v1.1.7 | `0x0B81C7bbfb34BF3215Ac143F69E4C20B879021aE` |
| NFTHolderCondition                | v1.1.7 | `0x08BF83818ed6B9432Af5A594C1D8b4E228a0473B` |
| NFTLockCondition                  | v1.1.7 | `0x8eb87F2eADc51bE42742929D13fbD165C171D18D` |
| NFTSalesTemplate                  | v1.1.7 | `0x09fB79E828d04F0ADDb0898a47C534935a24663F` |
| PlonkVerifier                     | v1.1.7 | `0xb0Ee4c6F6E0f15EB20c0930c9C215E964FE83Dfe` |
| SignCondition                     | v1.1.7 | `0x0D5DA0633b4d32b018F86D1fcF98661Ee60aBEfA` |
| TemplateStoreManager              | v1.1.7 | `0x4b3dC484ED5997e930e88BA7A398B3A4C685941c` |
| ThresholdCondition                | v1.1.7 | `0xB9319f213617713DbB04dB9696168196792509Bb` |
| TransferDIDOwnershipCondition     | v1.1.7 | `0x2023dA12E6b6053B8C98f96828dd68DAAe65BF63` |
| TransferNFT721Condition           | v1.1.7 | `0xd5dA61ce4baaB2EaAB0B6740140166b029829EB4` |
| TransferNFTCondition              | v1.1.7 | `0x9238fC0F0dfA556e6dcDEaB073B551343b206E3f` |
| WhitelistingCondition             | v1.1.7 | `0x8Cc86980a4e5ca39E01A7a927e15bf14aEb6D7e8` |

#### Polygon Mainnet

The contract addresses deployed on `Polygon` Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition               | v1.3.3 | `0x6889107aEB9a390Ce426A420aF84a71363b70E7b` |
| AaveCollateralDepositCondition    | v1.3.3 | `0xA70BE57d0bEa3EDEb182EEA10eC6D158cfD0Df76` |
| AaveCollateralWithdrawCondition   | v1.3.3 | `0xFB4365992499c1fa6AeFCf714Ef037b4FA3AF705` |
| AaveCreditTemplate                | v1.3.3 | `0x77462049291F95C1cc41a3110431cD4f818d0990` |
| AaveCreditVault                   | v1.3.3 | `undefined` |
| AaveRepayCondition                | v1.3.3 | `0x4B91646228de49d217248D55d07799E00eec7170` |
| AccessCondition                   | v1.3.3 | `0xc8BCa697af37417f1Bc8d3b10a7BB29d8Ef9647A` |
| AccessProofCondition              | v1.3.3 | `0xd357733F86B3B36d9ABbF4F24bfAb541818355eC` |
| AccessProofTemplate               | v1.3.3 | `0x78dc3895C1B365Da87D5C59288C84e9Aa40a46D1` |
| AccessTemplate                    | v1.3.3 | `0x0b92A6D9C36C4C365375BD3fB85F252772635Ae4` |
| AgreementStoreManager             | v1.3.3 | `0x0C1C668cB1912D26b2bD813C2f9B9051Ba95A0e2` |
| ComputeExecutionCondition         | v1.3.3 | `0x00382FE326C7E0167bbD5f00D22C592B4f144104` |
| ConditionStoreManager             | v1.3.3 | `0xD545262F1088B69c2F741f821173A5B523602f17` |
| DIDRegistry                       | v1.3.3 | `0x497FdA72Bae487Be4d851Eb378B8cF6aBA38d0DD` |
| DIDRegistryLibrary                | v1.3.3 | `0xf06bF368B097d085c972995b09988151e7368F8f` |
| DIDSalesTemplate                  | v1.3.3 | `0x0D8DB31DaFF28B93C01cB9c65D36a6cD876a3509` |
| DistributeNFTCollateralCondition  | v1.3.3 | `0xAF41bEb3cD4b5dbB50be66E6d30cec4Ed993627c` |
| EpochLibrary                      | v1.3.3 | `0x25722F87F71D3B42A827eb811EEe8b2670112afA` |
| EscrowComputeExecutionTemplate    | v1.3.3 | `0xc461A6D3698E5cD7f1835F6FfD5C3986523056F9` |
| EscrowPaymentCondition            | v1.3.3 | `0xd9Ea4287A9B05AdfE1eE8D5ce1d50a42e91903e4` |
| HashLockCondition                 | v1.3.3 | `0x8A36248AD71513A9F4ddBf9C4E7E6930b21458e5` |
| LockPaymentCondition              | v1.3.3 | `0x51D0924a7ad6d3498d90594cDe394Ef51087Fff5` |
| NFT721AccessTemplate              | v1.3.3 | `0x6F851EA9b91065AD1ac5439D54AD6ef304dEF7Cd` |
| NFT721HolderCondition             | v1.3.3 | `0xc7F849abA5186BB5dD15FbA8bcd8395C319e4ccb` |
| NFT721LockCondition               | v1.3.3 | `0xaFA3E629bcFefb145F0dcEDd86D16f72429D498a` |
| NFT721SalesTemplate               | v1.3.3 | `0x6efFb9F8cBD343B8E04a00c99bCa6A2343103ED7` |
| NFT721Upgradeable                 | v1.3.3 | `0x27079c729c695D52Eab499CC9047A76aD2cf65d9` |
| NFTAccessCondition                | v1.3.3 | `0x93b72A6E3F10fbb3D03a1b3C379b4A9ACe6Ac5cE` |
| NFTAccessTemplate                 | v1.3.3 | `0x16D508254A0783d46F08e704bee5c7157A2E74B0` |
| NFTHolderCondition                | v1.3.3 | `0x9Ab0ed2AE99C20C7f84A63e9157dD9F207B01Bc9` |
| NFTLockCondition                  | v1.3.3 | `0xEABe8b3E1D114C27A42018fE9698067a8d17E674` |
| NFTSalesTemplate                  | v1.3.3 | `0xD8c05ca7d13B18B74c341D84C3a5f2Fd9c97015A` |
| NFTUpgradeable                    | v1.3.3 | `0x376B41Db057d2983eE25953868606486991eEa81` |
| PlonkVerifier                     | v1.3.3 | `0x3170AD2f03ffc5E64C24c57f350B2D1c970a3151` |
| SignCondition                     | v1.3.3 | `0xeBBF97442786123BaD3cB5eCAF2538b2d150746E` |
| TemplateStoreManager              | v1.3.3 | `0xd6cBc8C983AbAaf50F12aDB313990975Bb07A7dB` |
| ThresholdCondition                | v1.3.3 | `0xEe3E55b9d57EfDa9ED3D66D3649af46100980084` |
| TransferDIDOwnershipCondition     | v1.3.3 | `0x3B486240a38B7A39788BE7c1cE96F31335CcB0DA` |
| TransferNFT721Condition           | v1.3.3 | `0xA51dA4E2C171A194Fa7cdEE0F87216BD1ee18232` |
| TransferNFTCondition              | v1.3.3 | `0x1D0C3F2a95A7B8DC9677cF02aEd36593f72Deb95` |
| WhitelistingCondition             | v1.3.3 | `0xAeC34614E5293422d2150aF39D0f868E35871b14` |

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

* [zeppelinos/zos](https://github.com/zeppelinos/zos)
* [OpenZeppelin/openzeppelin-eth](https://github.com/OpenZeppelin/openzeppelin-eth)

## Attribution

This project is based in the Ocean Protocol [Keeper Contracts](https://github.com/oceanprotocol/keeper-contracts).
It keeps the same Apache v2 License and adds some improvements. See [NOTICE file](NOTICE).

## License

```text
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
