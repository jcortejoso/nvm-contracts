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

The contract addresses deployed on Nevermined `Alfajores` Test Network:

#### Alfajores (Celo) Testnet

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.2 | `0x50A88EFf2Aff3F5bb707978cF88200E3452b9CD3` |
| AccessTemplate                    | v1.1.2 | `0xe3b491E4a71b2938D3fBD3Bd443dEC3B5B0Be398` |
| AgreementStoreManager             | v1.1.2 | `0x3B9d7CdF5047785Dd4083AfE7ea16D9C2a636097` |
| ComputeExecutionCondition         | v1.1.2 | `0xf046038FF358cB044001Cce9E27E1c321E79cdDC` |
| ConditionStoreManager             | v1.1.2 | `0x4DaA9DA2DA4e73C2C3F65aD5ba92F3313Bf9933f` |
| DIDRegistry                       | v1.1.2 | `0xa29C331958b6E3d17D139FCC1ecf8378049e8A99` |
| DIDRegistryLibrary                | v1.1.2 | `0x3a15F9eCCaEd70bFd580CD2495E869bEFf17CCc6` |
| DIDSalesTemplate                  | v1.1.2 | `0x1b7bAC94Ead09E45728f3F7473d14C64672FDED2` |
| Dispenser                         | v1.1.2 | `0xff4d094479909cA80678b361CCCb507a02E4dA1b` |
| EpochLibrary                      | v1.1.2 | `0xa66AF14D36C485Bd191e5a987DCDA89B6025816B` |
| EscrowComputeExecutionTemplate    | v1.1.2 | `0x069f337064c4a999c35d2Fa91dD779D7f9A48915` |
| EscrowPaymentCondition            | v1.1.2 | `0xb1cEae41F979fF158Cf6aE818b8Bf03a195b36de` |
| HashLockCondition                 | v1.1.2 | `0x9f8E5051E3C5c513e081D3Ce070730236935B016` |
| LockPaymentCondition              | v1.1.2 | `0x86306d55DE1aD6FcA9d8CCAE5FADADE48Cf00A53` |
| NFT721AccessTemplate              | v1.1.2 | `0x28dcE3442e9e8e70e9D994c8d92281DE21fe95EA` |
| NFT721HolderCondition             | v1.1.2 | `0xa85c881743f1C9968566070315CE16B1f5d8C684` |
| NFT721SalesTemplate               | v1.1.2 | `0xd6f18F5Ed8D680f4Cd54b5Ae06eCdde19EF6C2f9` |
| NFTAccessCondition                | v1.1.2 | `0x710EC3BCe198E68600A13F791842b77E5f04B834` |
| NFTAccessTemplate                 | v1.1.2 | `0xa90a79c5077A1e9c39df0DEC820883CBe4b7c346` |
| NFTHolderCondition                | v1.1.2 | `0x3d29428E0e096d8d338e02e3F625313689A627f6` |
| NFTLockCondition                  | v1.1.2 | `0x82fe00e69b70286cC921ad3F7AACBD9Cb279A085` |
| NFTSalesTemplate                  | v1.1.2 | `0x2E593dc75F872FEAa9e4A320236fe6417970c894` |
| NeverminedToken                   | v1.1.2 | `0x9231f93bE0d58741110933434bda7a1b63A6735A` |
| SignCondition                     | v1.1.2 | `0x7b0F9bADeF03691fEF8086966552eE5D5D48A9Be` |
| TemplateStoreManager              | v1.1.2 | `0x3D7213A4aa34856292C79BB5d56252968748a7e2` |
| ThresholdCondition                | v1.1.2 | `0x96676E236580464C82fffa26Fb6B5f5a2E2B0E39` |
| TransferDIDOwnershipCondition     | v1.1.2 | `0x8C5a3398F493f80e1bd7a9a4d3081e8cF22cF919` |
| TransferNFT721Condition           | v1.1.2 | `0x76B56c84a6e64fff8fe6c38fa678d453e6B419F1` |
| TransferNFTCondition              | v1.1.2 | `0x72337746b8ad7DE3dAA740a4586E5F3678e5520E` |
| WhitelistingCondition             | v1.1.2 | `0xE36f4f38981403C817d81a1f97c790cdcE9E85dD` |

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
| AccessCondition                   | v1.1.2 | `0x943C561Be307749f65B8A884A3388B6439dCeeec` |
| AccessTemplate                    | v1.1.2 | `0x6AdA9cbf75a0f41546C11a1115a94e87e9152666` |
| AgreementStoreManager             | v1.1.2 | `0xC57e97bC1602FF9F970B4C94884178134b4CD9De` |
| ComputeExecutionCondition         | v1.1.2 | `0x761A7cC5def5C2413141B3Ae0652937A0aB95609` |
| ConditionStoreManager             | v1.1.2 | `0x21d13f36c65Bb51764d05b81d2cB2fbabCbc9E8d` |
| DIDRegistry                       | v1.1.2 | `0x623f78d38C72BbC034B0425aEa5238EB8d1D2d0D` |
| DIDRegistryLibrary                | v1.1.2 | `0xCb423e91c53c7A75771b04a5C7CD95Fccb11018b` |
| DIDSalesTemplate                  | v1.1.2 | `0xe0a5E31eb662876959A03b044224c48ed0f61618` |
| Dispenser                         | v1.1.2 | `0xa42e0C25Ef78e7DC1676384fecE2e54B291a99fc` |
| EpochLibrary                      | v1.1.2 | `0x35Ad028C4Ad91978268280967c1db867ba35e323` |
| EscrowComputeExecutionTemplate    | v1.1.2 | `0xfBe606e48ca0DD942a1D055DcfD58Fdf507b6725` |
| EscrowPaymentCondition            | v1.1.2 | `0xDF2854d1116220C6C9397b592761f8b20D44471a` |
| HashLockCondition                 | v1.1.2 | `0x2e33C50DBfc7Ee2cf12E118CE09F65c24ed02583` |
| LockPaymentCondition              | v1.1.2 | `0x1B62A9418eb908535251dfD15ac252505EB81567` |
| NFT721AccessTemplate              | v1.1.2 | `0x29b9de2809b62a7e937E67883eF48CfBCBeA06Bd` |
| NFT721HolderCondition             | v1.1.2 | `0x205bC979BC5aF48f7925005b6E1a5E0280bde823` |
| NFT721SalesTemplate               | v1.1.2 | `0x6fbEAaeb44c69a009c568495705bD83f1Cf85860` |
| NFTAccessCondition                | v1.1.2 | `0xb84cCBb63e37DE7c0AD0eBd9694C5781df8354Df` |
| NFTAccessTemplate                 | v1.1.2 | `0x88B96A210e8f6f27BA59f0CAF7F39cA2653B647F` |
| NFTHolderCondition                | v1.1.2 | `0xFC46F8B2272D1aFbFae4d35357D618F10f7ba11F` |
| NFTLockCondition                  | v1.1.2 | `0x5DFd35399B64bD8457b3667Ba79D83A31Bc08D28` |
| NFTSalesTemplate                  | v1.1.2 | `0x51Fdd3C1249CA264916c8E0c013f66A96Aa6c7Df` |
| NeverminedToken                   | v1.1.2 | `0x7218c9880e139258E6c90C124cde058A6A2dF896` |
| SignCondition                     | v1.1.2 | `0x19c50775D9B93D6C1b9C0b2Ac9651F9a8281CaFD` |
| TemplateStoreManager              | v1.1.2 | `0x3C4C38F5cdBF706a8f6355a60Fbcfd92d58Aad8a` |
| ThresholdCondition                | v1.1.2 | `0xE5C62FF3f5fCC3dE062a5002f538a7027c3D355c` |
| TransferDIDOwnershipCondition     | v1.1.2 | `0xa99b7B332CFd88b127513A1f55BD13c5d7de4C16` |
| TransferNFT721Condition           | v1.1.2 | `0xfBa38fa846E5c38845AA87Eb43Ed571Df6f71938` |
| TransferNFTCondition              | v1.1.2 | `0x4d3a045ECec1EA3D9Ee063af7127177958f5cfc6` |
| WhitelistingCondition             | v1.1.2 | `0x2d8BCaDdf251384C28644155bB853fd200f2Ff2B` |

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
