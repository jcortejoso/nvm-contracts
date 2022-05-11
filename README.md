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
    * [Mainnets](#mainnets)
      * [Ethereum Mainnet](#ethereum-mainnet)
      * [Aurora Mainnet](#aurora-mainnet)
      * [Polygon Mainnet](#polygon-mainnet)
      * [Celo Mainnet](#celo-mainnet)
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

| Contract                         | Version | Address                                      |
|----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition              | v1.3.8  | `0x6c1a03B7b1e86cCfd73cE6522f63286be1a1C628` |
| AaveCollateralDepositCondition   | v1.3.8  | `0xc79df01997da66Cb4A0127BB71aB383FBF512b41` |
| AaveCollateralWithdrawCondition  | v1.3.8  | `0x8876A182AE51654e3BA2613164071A022097AF8E` |
| AaveCreditTemplate               | v1.3.8  | `0xdCdedF266457f6689fce6DcBB92185ddD0D6765B` |
| AaveCreditVault                  | v1.3.8  | `undefined`                                  |
| AaveRepayCondition               | v1.3.8  | `0xEe230f6c8d4BdFA3d672Afd17438b96ACCf01840` |
| AccessCondition                  | v1.3.8  | `0x5f6d73ea0749Bf22569a6972F5fA3e98199cF640` |
| AccessProofCondition             | v1.3.8  | `0x34cDc0091F5013d6D66648f65af3604B1D69BAB5` |
| AccessProofTemplate              | v1.3.8  | `0xEef671b9690B8D53Cc7c61165dc60CeC98dCd214` |
| AccessTemplate                   | v1.3.8  | `0xE8041851f3429FB55A184BeB0EeCca00970C5f81` |
| AgreementStoreManager            | v1.3.8  | `0x9b0032a8412ddd8973F3A512EADC7464FDC7b310` |
| ComputeExecutionCondition        | v1.3.8  | `0x7beE9F1949171CB63F34f2a9528602459e8005fA` |
| ConditionStoreManager            | v1.3.8  | `0xb643d62Ef0ae00B482E48bb54849b4cfb6B7E612` |
| DIDRegistry                      | v1.3.8  | `0x8a771CE86b3C0d8bdE50cd2c669a0136556AabeF` |
| DIDRegistryLibrary               | v1.3.8  | `0xf6Db36900285a4CD8D6eC4bf64142c3BA241441F` |
| DIDSalesTemplate                 | v1.3.8  | `0x170fba1985e7DD27318e3Fb9bdDD6a89D3276973` |
| Dispenser                        | v1.3.8  | `0x2A080B4bE39a1568daB7950E8b18f00401d8f365` |
| DistributeNFTCollateralCondition | v1.3.8  | `0x3F9231dF04478f571540525924fd0B66416DeF85` |
| EpochLibrary                     | v1.3.8  | `0xF8f08d7C5cE57D8a90A06e8B25e60a4B0b369F41` |
| EscrowComputeExecutionTemplate   | v1.3.8  | `0xc4f14036f0202983f4154d2B2B41ac84181C81f8` |
| EscrowPaymentCondition           | v1.3.8  | `0xEE9c2e66EbfEe26EB9D3Ace960712FddD8218F30` |
| HashLockCondition                | v1.3.8  | `0xC227188b8E839f08339e759f87E80278c24a2CE1` |
| LockPaymentCondition             | v1.3.8  | `0x3021b554719f664be955708F484938989A0401e9` |
| NFT721AccessTemplate             | v1.3.8  | `0xEDDEeF44FeFb76c4DE25C16e5180842F36F4B441` |
| NFT721HolderCondition            | v1.3.8  | `0xBC3F97Df86836A58724870b32c340BF8608c2321` |
| NFT721LockCondition              | v1.3.8  | `0xC44D5BF3f53e9203f51b5f873019c592A425486c` |
| NFT721SalesTemplate              | v1.3.8  | `0x420d261B8B3ED1161d1d427d58eB50dFE74E60d3` |
| NFT721Upgradeable                | v1.3.8  | `0x31224333F98cEe0FBFB6996F6Aa7A3b90B5b7092` |
| NFTAccessCondition               | v1.3.8  | `0x72012a5BcB652d94c1B7AE9d999fd97db5A8a35d` |
| NFTAccessTemplate                | v1.3.8  | `0x628b682B7dF917E238949Fd81650BfFfc1E82223` |
| NFTHolderCondition               | v1.3.8  | `0x3e5524945337802968123b7aB633bC4973f05d09` |
| NFTLockCondition                 | v1.3.8  | `0xB61629DDE3498499f4c19CBe7fB0f9EC491C8882` |
| NFTSalesTemplate                 | v1.3.8  | `0x6870807a3A7CC3eDeA5e80288D4f508Cb241D734` |
| NFTUpgradeable                   | v1.3.8  | `0x38A2c4aDa16358f78F085AD65cBfEfC9fAC4A44b` |
| NeverminedToken                  | v1.3.8  | `0x9a63eb01f80eb04A69C85522FF3e74f2B72a6f85` |
| PlonkVerifier                    | v1.3.8  | `0xfb842b52a540f490190B936323e78cA216229684` |
| SignCondition                    | v1.3.8  | `0x45c61E9F3DE54C1FBe3FB435a9f1A1055AEe679f` |
| TemplateStoreManager             | v1.3.8  | `0x61A0a73F4a5178d63dd315D55c550Ff6f3A3FCA2` |
| ThresholdCondition               | v1.3.8  | `0x6C4f0Bc89A82Ba0908D5747e81a3f4A079938DE6` |
| TransferDIDOwnershipCondition    | v1.3.8  | `0xB3c06574976AE7DEEbB0bD97981232AECF1930c4` |
| TransferNFT721Condition          | v1.3.8  | `0x2595b5A095ADd3113C31433b9Dcb8EfE4cfF8812` |
| TransferNFTCondition             | v1.3.8  | `0xa25Bc274dB6d2a6EfaB9a448f907B7dC64B534A8` |
| WhitelistingCondition            | v1.3.8  | `0xf881344a49E9a5E1B6c672498f1Baa6c2d77b557` |

#### Bakalva (Celo) Testnet

The contract addresses deployed on `Baklava` Celo Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.0.0  | `0x7ff61090814B4159105B88d057a3e0cc1058ae44` |
| AccessTemplate                    | v1.0.0  | `0x39fa249ea6519f2076f304F6906c10C1F59B2F3e` |
| AgreementStoreManager             | v1.0.0  | `0x02Dd2D50f077C7060E4c3ac9f6487ae83b18Aa18` |
| ComputeExecutionCondition         | v1.0.0  | `0x411e198cf1F1274F69C8d9FF50C2A5eef95423B0` |
| ConditionStoreManager             | v1.0.0  | `0x028ff50FA80c0c131596A4925baca939E35A6164` |
| DIDRegistry                       | v1.0.0  | `0xd1Fa86a203902F763D6f710f5B088e5662961c0f` |
| DIDRegistryLibrary                | v1.0.0  | `0x93468169aB043284E53fb005Db176c8f3ea1b3AE` |
| DIDSalesTemplate                  | v1.0.0  | `0x862f483F35B136313786D67c0794E82deeBc850a` |
| Dispenser                         | v1.0.0  | `0xED520AeF97ca2afc2f477Aab031D9E68BDe722b9` |
| EpochLibrary                      | v1.0.0  | `0x42623Afd182D3752e2505DaD90563d85B539DD9B` |
| EscrowComputeExecutionTemplate    | v1.0.0  | `0xfB5eA07D3071cC75bb22585ceD009a443ed82c6F` |
| EscrowPaymentCondition            | v1.0.0  | `0x0C5cCd10a908909CF744a898Adfc299bB330E818` |
| HashLockCondition                 | v1.0.0  | `0xe565a776996c69E61636907E1159e407E3c8186d` |
| LockPaymentCondition              | v1.0.0  | `0x7CAE82F83D01695FE0A31099a5804bdC160b5b36` |
| NFTAccessCondition                | v1.0.0  | `0x49b8BAa9Cd224ea5c4488838b0454154cFb60850` |
| NFTAccessTemplate                 | v1.0.0  | `0x3B2b32cD386DeEcc3a5c9238320577A2432B03C1` |
| NFTHolderCondition                | v1.0.0  | `0xa963AcB9d5775DaA6B0189108b0044f83550641b` |
| NFTLockCondition                  | v1.0.0  | `0xD39e3Eb7A5427ec4BbAf761193ad79F6fCfA3256` |
| NFTSalesTemplate                  | v1.0.0  | `0xEe41F61E440FC2c92Bc7b0a902C5BcCd222F0233` |
| NeverminedToken                   | v1.0.0  | `0xEC1032f3cfc8a05c6eB20F69ACc716fA766AEE17` |
| SignCondition                     | v1.0.0  | `0xb96818dE64C492f4B66B3500F1Ee2b0929C39f6E` |
| TemplateStoreManager              | v1.0.0  | `0x4c161ea5784492650993d0BfeB24ff0Ac2bf8437` |
| ThresholdCondition                | v1.0.0  | `0x08D93dFe867f4a20830f1570df05d7af278c5236` |
| TransferDIDOwnershipCondition     | v1.0.0  | `0xdb6b856F7BEBba870053ba58F6e3eE48448173d3` |
| TransferNFTCondition              | v1.0.0  | `0x2de1C38030A4BB0AB4e60E600B3baa98b73400D9` |
| WhitelistingCondition             | v1.0.0  | `0x6D8D5FBD139d81dA245C3c215E0a50444434d11D` |

#### Rinkeby (Ethereum) Testnet

The contract addresses deployed on Nevermined `Rinkeby` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.2  | `0x6fD85bdc2181955d1e13e69cF6b7D823065C3Ca7` |
| AccessTemplate                    | v1.1.2  | `0xb0c62D9396C2FEcBb51eD6EB26c0Ed4f5eA4a346` |
| AgreementStoreManager             | v1.1.2  | `0xC2ED028fAf0b638A194C40d7E223088FA4cF85DC` |
| ComputeExecutionCondition         | v1.1.2  | `0xA142534b8c7130CFE1bf73128E86ec9c9369Faa4` |
| ConditionStoreManager             | v1.1.2  | `0xFc0cA52987D5494eD42B9f317803b54C0161b98D` |
| DIDRegistry                       | v1.1.2  | `0xC0a99b11eC971fc6041a685fb04DC5A35F65C2FF` |
| DIDRegistryLibrary                | v1.1.2  | `0xA72435e7990d4D9b3Bf31aF6da90c5814Ae1799F` |
| DIDSalesTemplate                  | v1.1.2  | `0x903071Ed3061Ebb36FFc865910D4CfdEfaCfC615` |
| Dispenser                         | v1.1.2  | `0xfaAF4c7E8a6A7a5598F22559b5c2cdeBEB9e6B0e` |
| EpochLibrary                      | v1.1.2  | `0x717920AbFBa53187613b3e7AE7b9992F1A7d96ca` |
| EscrowComputeExecutionTemplate    | v1.1.2  | `0xEA051aA47feC676F0962fE4EF44D3728f7EB4a0F` |
| EscrowPaymentCondition            | v1.1.2  | `0xb7aD2564D07870126fF96A14E2959b16141529C6` |
| HashLockCondition                 | v1.1.2  | `0x31E11A66E07a17C620A14D554C216c2622be377e` |
| LockPaymentCondition              | v1.1.2  | `0x8D2049565125700276f4407dbE269c4b275eE21e` |
| NFT721AccessTemplate              | v1.1.2  | `0x8A9f71c256FD31E8b73396316fFB57F70CEE19e1` |
| NFT721HolderCondition             | v1.1.2  | `0xAAc307dEC41cFD667f70365A7C51E632eDAAE6F9` |
| NFT721SalesTemplate               | v1.1.2  | `0x49AfF1F940C5d8C10FC8b81eD4155BF05dfcb9Ef` |
| NFTAccessCondition                | v1.1.2  | `0x6aA035fc4683D413fAa8bAe3f00CaAc712C2A502` |
| NFTAccessTemplate                 | v1.1.2  | `0x0aDeA2BE5f5E38DC60700e8a3a5203feE02985DB` |
| NFTHolderCondition                | v1.1.2  | `0x83342074cAb5b624Ea2361782AcC32da76641F33` |
| NFTLockCondition                  | v1.1.2  | `0xF951001D5516C682c5aF6DF2cB0250E4addd1252` |
| NFTSalesTemplate                  | v1.1.2  | `0x24edffc52926739E8403E451b791378349f38818` |
| NeverminedToken                   | v1.1.2  | `0x937Cc2ec24871eA547F79BE8b47cd88C0958Cc4D` |
| SignCondition                     | v1.1.2  | `0x287C2FdD23d3E2C18217e7329B62dBa3F8be777c` |
| TemplateStoreManager              | v1.1.2  | `0x45eBFAdAdc64D86F2bC7ed756EA2D5AfC0c64e51` |
| ThresholdCondition                | v1.1.2  | `0x683132AD20b4048073256484772a9fa6eeccf4e0` |
| TransferDIDOwnershipCondition     | v1.1.2  | `0x269Dec0aBCb0232422F5B13cd343e63CdB922818` |
| TransferNFT721Condition           | v1.1.2  | `0x5975fE95EABBDe0AAFD879AEEeC2172391d560a5` |
| TransferNFTCondition              | v1.1.2  | `0x6e81A4571C35F5786043fC9f6545F95c7B4E90A7` |
| WhitelistingCondition             | v1.1.2  | `0x1f361FfdA721eFc38Ca389603E39F31fdEddAbaf` |

#### Mumbai (Polygon) Testnet

The contract addresses deployed on `Mumbai` Polygon Test Network:

| Contract                         | Version | Address                                      |
|----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition              | v1.3.8  | `0x945640C6c957CE2c485A5226bA5C3B0BB0BDC95C` |
| AaveCollateralDepositCondition   | v1.3.8  | `0x82883682842BDfb0F8857d8bfb3a8Eec125b15EC` |
| AaveCollateralWithdrawCondition  | v1.3.8  | `0x43138F5BA8Cf6289c7cc0C5ef9A9107685cb8931` |
| AaveCreditTemplate               | v1.3.8  | `0x6FE4D7B76011D537CcbC58d31BB937B1B9efDa98` |
| AaveCreditVault                  | v1.3.8  | `undefined`                                  |
| AaveRepayCondition               | v1.3.8  | `0xD3F86E8f4B313e966C216C97D986943837c69c12` |
| AccessCondition                  | v1.3.8  | `0xef94426a0F59773FD41F95413C2993ef89A49E70` |
| AccessProofCondition             | v1.3.8  | `0xA689E151d88D836Ea85bBd101d04E988BcE32178` |
| AccessProofTemplate              | v1.3.8  | `0x04eb3fcDe85DDA32964B67e68b6243686ED09383` |
| AccessTemplate                   | v1.3.8  | `0x97F7Fb122a1959e50e405945A4b5e58886Ae02fa` |
| AgreementStoreManager            | v1.3.8  | `0xdf4B027dE9F763D5D93b42a792b9D434f1ECcD9A` |
| ComputeExecutionCondition        | v1.3.8  | `0xc241b431a8f168e8E170712f6660576F343dEa89` |
| ConditionStoreManager            | v1.3.8  | `0xE4DCb428A43147D5b6F55fCf2126B1Ac025D90bA` |
| DIDRegistry                      | v1.3.8  | `0xdA0F96eAF4Da21cceCAb7ba3A4e3Abe81B675e6b` |
| DIDRegistryLibrary               | v1.3.8  | `0xF8439a7b46079Dcb19A5022fB47aE049D1D866a1` |
| DIDSalesTemplate                 | v1.3.8  | `0x99A7ee1E65ED4b6b501C188c6eB1D91e5474bc79` |
| Dispenser                        | v1.3.8  | `0x416E4D8e3B1786b86A7B66182eA071377AaCD949` |
| DistributeNFTCollateralCondition | v1.3.8  | `0xF17f815A62E6B0140FE27B398926676F95A44a7a` |
| EpochLibrary                     | v1.3.8  | `0x3466E5E9b487BeD8F726731d454C1A0437bcded7` |
| EscrowComputeExecutionTemplate   | v1.3.8  | `0x3390Db0b2F386335E7eca00a162c524E09919A99` |
| EscrowPaymentCondition           | v1.3.8  | `0xfD6EF09cD0bce14C500C0638e1Bfea95ea14B97B` |
| HashLockCondition                | v1.3.8  | `0x87699B40c6FfB3f98b07A58c7De033DfEdD15A2c` |
| LockPaymentCondition             | v1.3.8  | `0x073257E693CF0712F76539d2B5398D2f39A3508a` |
| NFT721AccessTemplate             | v1.3.8  | `0x5ca1E92c485dc87c412e1562F4B9724ddAb76882` |
| NFT721HolderCondition            | v1.3.8  | `0x68dD1018017ac496F1f5Cc20E5e85e296Ce5d62a` |
| NFT721LockCondition              | v1.3.8  | `0x85ddDa67C79FE263E1149A0307850C291b083Fe6` |
| NFT721SalesTemplate              | v1.3.8  | `0x3D81a919d733f099Ee6bD28B36575C771Da7728c` |
| NFT721Upgradeable                | v1.3.8  | `0x22f7ec2bB9efe58D6128C615e6F752DBF31568Ab` |
| NFTAccessCondition               | v1.3.8  | `0x44351cA057d8743fB39d2Cc376937A5998E33303` |
| NFTAccessTemplate                | v1.3.8  | `0xc375F44EddcFE204ad5d6cED468940007f40ADf4` |
| NFTHolderCondition               | v1.3.8  | `0xa2DCd0f3d464962CA9b41E3aA041d8d329ce26C6` |
| NFTLockCondition                 | v1.3.8  | `0xcaf4C717e46459f8B6579061239291Fce4E9d5a6` |
| NFTSalesTemplate                 | v1.3.8  | `0xD51B97C3766431424058a605C0223fE133a342dB` |
| NFTUpgradeable                   | v1.3.8  | `0x808B946ef931238F63FAd63bef6E48F7a7a56d87` |
| NeverminedToken                  | v1.3.8  | `0xDdD54af82CF7959A7FC51081aFc0D63d60Eb42E9` |
| PlonkVerifier                    | v1.3.8  | `0xf4FAe9fBfB6Bb0c0385d938EDE801f8793734c3a` |
| SignCondition                    | v1.3.8  | `0xf56067E603167d314fDa5432bD9B35b6f943183F` |
| TemplateStoreManager             | v1.3.8  | `0x3b3E21B9f2693F71D49662637B3a76c2feeDD29A` |
| ThresholdCondition               | v1.3.8  | `0x40b69aB1bF3Ebd85a457bA0C06F7Cb249517AA95` |
| TransferDIDOwnershipCondition    | v1.3.8  | `0xcb35F43497ce1bb8d220e483f2eb044E63Eb22C3` |
| TransferNFT721Condition          | v1.3.8  | `0x6aB2275Aa96f87e1bFf902E6aefCf8d267dEEDcf` |
| TransferNFTCondition             | v1.3.8  | `0xcad0C65Ad0345976f237b67981d34b002b610397` |
| WhitelistingCondition            | v1.3.8  | `0xECF1e8c626ddeaE3260e2AbfE53447E939Ca30F8` |

#### Aurora Testnet

The contract addresses deployed on `Aurora` Test Network:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.6  | `0xb9fD8208312ECB87875860c0F109118522885D9E` |
| AccessProofCondition              | v1.1.6  | `0x64950B0DF2aBc338b3191cBa0a8a87beBda2A315` |
| AccessProofTemplate               | v1.1.6  | `0x774B9A093eeC6e4196Eb82B914d675DCc9d08599` |
| AccessTemplate                    | v1.1.6  | `0x8353452CEf320A7F280B52dB7B30aA17bF8Fe754` |
| AgreementStoreManager             | v1.1.6  | `0x5368E27DBbA96070a3284FD7a79A34bb75b6B464` |
| ComputeExecutionCondition         | v1.1.6  | `0xFbf27C54B16679DDbFd8678713C586aD40323461` |
| ConditionStoreManager             | v1.1.6  | `0x5e119AddB2bce6cbe7044305915963CC4ab2bB6C` |
| DIDRegistry                       | v1.1.6  | `0xa389Fbea7Fdd9A052394b36B88e943C2c4c82be0` |
| DIDRegistryLibrary                | v1.1.6  | `0xA98A97E2986d81b93C712b836241EaFf6D689AB6` |
| DIDSalesTemplate                  | v1.1.6  | `0xA3E7F6cb1990b9f1f6b097be6D0905e03f5E1b85` |
| Dispenser                         | v1.1.6  | `0x7F5AD4E1a5d52A8f26C13d8B0C62BAa23E7bbD98` |
| EpochLibrary                      | v1.1.6  | `0x8CC543360af2643491788723B48baeBE0a80C8E1` |
| EscrowComputeExecutionTemplate    | v1.1.6  | `0xaa2627619d684921468edd8E2F62836749eFf1d4` |
| EscrowPaymentCondition            | v1.1.6  | `0x1775c299e68d075B7B6FB96B350dCDC808D1489a` |
| HashLockCondition                 | v1.1.6  | `0xd7ed0f2967F913c08b48c3494454471dED723297` |
| LockPaymentCondition              | v1.1.6  | `0x9Aa8f07dD00E859278822baECcc23F02A031898E` |
| NFT721AccessTemplate              | v1.1.6  | `0xca627BEb138F91470ff06AD7D24f3e51996b0653` |
| NFT721HolderCondition             | v1.1.6  | `0x3a43FC31E66E3b3545C912DD824790612866Fcd0` |
| NFT721SalesTemplate               | v1.1.6  | `0x05679Bea4229C18330fE0AC8679ab93E56F6b7Da` |
| NFTAccessCondition                | v1.1.6  | `0x742661264Fc11B909b85B278186e62D2DfE2233f` |
| NFTAccessTemplate                 | v1.1.6  | `0x80EEA56a10c1020508c13aB86C36c398B45FeF79` |
| NFTHolderCondition                | v1.1.6  | `0x5E1AF7dC0B8D461Cd02c80763025C482B3E6B17d` |
| NFTLockCondition                  | v1.1.6  | `0x34D2F25f967a6F6f87Df7F166BA8cBe3372aA827` |
| NFTSalesTemplate                  | v1.1.6  | `0x7F4Aab50B4d07493F22668417ef1433469895F51` |
| NeverminedToken                   | v1.1.6  | `0x43a0Fcde497c2051B8D207afA4145f27a9194d69` |
| PlonkVerifier                     | v1.1.6  | `0x7B7686C399734Fe082D6f558853992b5368325b8` |
| SignCondition                     | v1.1.6  | `0x7886DB81c0BD9Da700E8Fd21Ec3f12c5ce8D2a06` |
| TemplateStoreManager              | v1.1.6  | `0x780d3Ab357f1C44014d27d60765b7d4F9a7b90Ed` |
| ThresholdCondition                | v1.1.6  | `0xFEF1a4F4827F0B3a281700D796D2710Ac2C86105` |
| TransferDIDOwnershipCondition     | v1.1.6  | `0xBc331069400E907F33c6280a433552f784567a0c` |
| TransferNFT721Condition           | v1.1.6  | `0x144BD5752D3DbF42e9B7aF106FEe8E5160a9CE13` |
| TransferNFTCondition              | v1.1.6  | `0x1F66d913AB40095700dbB1a5a1D369996E3Dcb9e` |
| WhitelistingCondition             | v1.1.6  | `0x10C7501d55228EE102f403410a9b40f6330669CE` |

### Mainnets

#### Ethereum Mainnet

The contract addresses deployed on `Production` Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.2  | `0xBa635a16ad65fc44776F4577E006e54B739170e1` |
| AccessTemplate                    | v1.1.2  | `0x5cc43778946671Ab88Be0d98B2Bc25C0c67095bb` |
| AgreementStoreManager             | v1.1.2  | `0xD0cFcf159dC1c6573ba203c7f37EF7fAAa9c0E88` |
| ComputeExecutionCondition         | v1.1.2  | `0xDc8c172404e3cF4D16Bc0De877656c4ba58f3384` |
| ConditionStoreManager             | v1.1.2  | `0x2Da0b5a6B0015B698025Ad164f82BF01E8B43214` |
| DIDRegistry                       | v1.1.2  | `0xA77b7C01D136694d77494F2de1272a526018B04D` |
| DIDRegistryLibrary                | v1.1.2  | `0xA1B7057C80d845Abea287608293930d02197a954` |
| DIDSalesTemplate                  | v1.1.2  | `0x81a2A6b639E6c3a158368B2fAF72a3F51Fa45B00` |
| EpochLibrary                      | v1.1.2  | `0x6D77b0aa745D3498a36971a3C0138Ee6c2B947cA` |
| EscrowComputeExecutionTemplate    | v1.1.2  | `0x7c912E94aF9e8Bbf1e4Dcf2Cdf5506ea71E084D9` |
| EscrowPaymentCondition            | v1.1.2  | `0xc33269A0E2Edca46c3d0b2B2B25aFeEE6F828405` |
| HashLockCondition                 | v1.1.2  | `0x6B309450FaE559913132585b06CCD5Fe9999037f` |
| LockPaymentCondition              | v1.1.2  | `0x611923E1d809a53aB2731Dd872778B3cEdD5C1D4` |
| NFT721AccessTemplate              | v1.1.2  | `0x0d9c4CB03fB90ABC58F23C52bD9E3eD27fE55f39` |
| NFT721HolderCondition             | v1.1.2  | `0x0a83EDEeB843E9e96f57bf33f53969BF052c2cE4` |
| NFT721SalesTemplate               | v1.1.2  | `0xA5BA02CbdC3c005aFC616A53d97488327ef494BE` |
| NFTAccessCondition                | v1.1.2  | `0xa2D1D6DA85df69812FF741d77Efb77CAfF1d9dc9` |
| NFTAccessTemplate                 | v1.1.2  | `0x335E1A2ec8854074BC1b64eFf0FF642a443243a5` |
| NFTHolderCondition                | v1.1.2  | `0x9144f4831aa963963bf8737b45C5eea810efB7e7` |
| NFTLockCondition                  | v1.1.2  | `0x877E2Fd93Eb74095591b90ADc721A128b637b21C` |
| NFTSalesTemplate                  | v1.1.2  | `0x2b87C77F7023cb3956aeE3490CfC1Da90571E7DB` |
| SignCondition                     | v1.1.2  | `0x10da0625d8300BF40dE3721a0150F0E724611d44` |
| TemplateStoreManager              | v1.1.2  | `0xfD0cf3a91EC3BE427785783EE34a9116AED085b6` |
| ThresholdCondition                | v1.1.2  | `0xea8F5b9Ddd826eC48B1e8991A947D6EaAE495213` |
| TransferDIDOwnershipCondition     | v1.1.2  | `0xE2AC5Bca96a7f9ECa2037F001AD51C7f37820bAF` |
| TransferNFT721Condition           | v1.1.2  | `0x89B39c7b8602778316fA51E00235CE418aC06c2F` |
| TransferNFTCondition              | v1.1.2  | `0x3c8D330419f59C1586C1D4F8e4f3f70F09606455` |
| WhitelistingCondition             | v1.1.2  | `0x489f500aA3ED426eA0d45FB7769cfba85f1AA737` |

#### Aurora Mainnet

The contract addresses deployed on `Aurora` Mainnet:

| Contract                          | Version | Address                                      |
|-----------------------------------|---------|----------------------------------------------|
| AccessCondition                   | v1.1.7  | `0xEA2Ab20CC1c567D9cd56E4561Aa2aebDB60f9a1E` |
| AccessProofCondition              | v1.1.7  | `0xa1B731118AcA483f64Ef1FB7008583eC0B35d50D` |
| AccessProofTemplate               | v1.1.7  | `0x1a22eB22F726399812Ca3B998C2D09FDf0f3Ac0C` |
| AccessTemplate                    | v1.1.7  | `0x672Cc04436ADeD82b448B2f6De58267e1809e366` |
| AgreementStoreManager             | v1.1.7  | `0xc6Ab25648B0c5a473Bd37D95c60a918fE4aD8c86` |
| ComputeExecutionCondition         | v1.1.7  | `0x23C91929eeD7fbe4deEdc0dBe2980A93a02844D2` |
| ConditionStoreManager             | v1.1.7  | `0x5CC62ffDA628D60b49C81aeF2d3D87CBb4267174` |
| DIDRegistry                       | v1.1.7  | `0xb03e4A759763a45e9823082D2c6D8C905A21a8A1` |
| DIDRegistryLibrary                | v1.1.7  | `0x09050EA73A24bdD3B96Eb753D8aAcB07238f8E5D` |
| DIDSalesTemplate                  | v1.1.7  | `0x46A23e3b87E31f74960007a698d5ec70fa0097A3` |
| EpochLibrary                      | v1.1.7  | `0x2e0c35E54FeeaCb838cDF5c848f27d7163d87f85` |
| EscrowComputeExecutionTemplate    | v1.1.7  | `0x5C0C69A8454b91874C029211cFA5DF6a3cFBe182` |
| EscrowPaymentCondition            | v1.1.7  | `0xB9f14F8e6b801bAd954bD272cf136Fe04099d9a8` |
| HashLockCondition                 | v1.1.7  | `0x159B2eF7254051e871b8E3009B8596BFA1F5cE36` |
| LockPaymentCondition              | v1.1.7  | `0xcdf2C7178D9f48dcB4a41fd6A63D9C69E859a796` |
| NFT721AccessTemplate              | v1.1.7  | `0x168E5D053393E95C8026d4BEEaaDE1CBaCEa4F37` |
| NFT721HolderCondition             | v1.1.7  | `0x553B42E76feFF07b9AadaCC5bf1b324663BF8A5E` |
| NFT721SalesTemplate               | v1.1.7  | `0x6d8a38D3c18C8658d3c6750aa85Ab20Aff8cFCae` |
| NFTAccessCondition                | v1.1.7  | `0xFE6C051Fa306d2c05907D088b27a74E8F7aEF35F` |
| NFTAccessTemplate                 | v1.1.7  | `0x0B81C7bbfb34BF3215Ac143F69E4C20B879021aE` |
| NFTHolderCondition                | v1.1.7  | `0x08BF83818ed6B9432Af5A594C1D8b4E228a0473B` |
| NFTLockCondition                  | v1.1.7  | `0x8eb87F2eADc51bE42742929D13fbD165C171D18D` |
| NFTSalesTemplate                  | v1.1.7  | `0x09fB79E828d04F0ADDb0898a47C534935a24663F` |
| PlonkVerifier                     | v1.1.7  | `0xb0Ee4c6F6E0f15EB20c0930c9C215E964FE83Dfe` |
| SignCondition                     | v1.1.7  | `0x0D5DA0633b4d32b018F86D1fcF98661Ee60aBEfA` |
| TemplateStoreManager              | v1.1.7  | `0x4b3dC484ED5997e930e88BA7A398B3A4C685941c` |
| ThresholdCondition                | v1.1.7  | `0xB9319f213617713DbB04dB9696168196792509Bb` |
| TransferDIDOwnershipCondition     | v1.1.7  | `0x2023dA12E6b6053B8C98f96828dd68DAAe65BF63` |
| TransferNFT721Condition           | v1.1.7  | `0xd5dA61ce4baaB2EaAB0B6740140166b029829EB4` |
| TransferNFTCondition              | v1.1.7  | `0x9238fC0F0dfA556e6dcDEaB073B551343b206E3f` |
| WhitelistingCondition             | v1.1.7  | `0x8Cc86980a4e5ca39E01A7a927e15bf14aEb6D7e8` |

#### Polygon Mainnet

The contract addresses deployed on `Polygon` Mainnet:

| Contract                         | Version | Address                                      |
|----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition              | v1.3.5  | `0xCA5572C614DbB0E4732D31110E0F57443CE82109` |
| AaveCollateralDepositCondition   | v1.3.5  | `0xe03699489579f1f353505F082F5Cc81EA87869e4` |
| AaveCollateralWithdrawCondition  | v1.3.5  | `0x6147930674C2F8248844066113533501C9191AE7` |
| AaveCreditTemplate               | v1.3.5  | `0x17172c561CdE0C976c66070f0B1045e9bC4B92aE` |
| AaveCreditVault                  | v1.3.5  | `undefined`                                  |
| AaveRepayCondition               | v1.3.5  | `0x872C621513b7B52224e398a1ebDf698030e399Ee` |
| AccessCondition                  | v1.3.5  | `0x86920086caf3e696da048440c8D435727FB10B99` |
| AccessProofCondition             | v1.3.5  | `0xbE3b5569549ad7a5Ad526a64b6c60591995272ec` |
| AccessProofTemplate              | v1.3.5  | `0xaD77e6f5276f0D7629Fe1BaC8822Fc9367Da1e93` |
| AccessTemplate                   | v1.3.5  | `0x8cCc9097F05fE49fe70014a36831304C2B7d2F47` |
| AgreementStoreManager            | v1.3.5  | `0x8BDFCf8b40aD1d9Fb88C2145bd444460220Fe80d` |
| ComputeExecutionCondition        | v1.3.5  | `0x61475a123f13166Bf4709Db8050528CD10d51013` |
| ConditionStoreManager            | v1.3.5  | `0x04505fE64c4D1eE50d56f2C320E4235b49832292` |
| DIDRegistry                      | v1.3.5  | `0x3161f5C96a1173f248F8eD83717763b575878c11` |
| DIDRegistryLibrary               | v1.3.5  | `0xC6ca4751af695B0A06D76cC3C5F821db98588B75` |
| DIDSalesTemplate                 | v1.3.5  | `0x377A4C3c6E2e34783ABb7C0B6e7dDA367b2Bf42c` |
| DistributeNFTCollateralCondition | v1.3.5  | `0x467eDB45eeAD763F45DE731Fa85142a4210EAa0B` |
| EpochLibrary                     | v1.3.5  | `0xd58954867aB29d335b390B4456129355057d2E10` |
| EscrowComputeExecutionTemplate   | v1.3.5  | `0x92A85E107865C154bA254349f4fEe5730248fc9F` |
| EscrowPaymentCondition           | v1.3.5  | `0x003948364B028970e8daf3455a8BF715B550d3E5` |
| HashLockCondition                | v1.3.5  | `0x68761d3b6134574ebfe6FFB5f5ffac23228fe8D4` |
| LockPaymentCondition             | v1.3.5  | `0xa269156EA80491bFcEFd1bF658e5154CB40ab3eA` |
| NFT721AccessTemplate             | v1.3.5  | `0xDD97Dd97000AE1a80B776AE88FBaa4FD733181f6` |
| NFT721HolderCondition            | v1.3.5  | `0x2754eE65Eb368dE6fCA18144dBdE8911134C8a98` |
| NFT721LockCondition              | v1.3.5  | `0x50695106D2B3dE2F3B5E3a3Dcd00e6672eCc8dcD` |
| NFT721SalesTemplate              | v1.3.5  | `0xBf5B1ec95Cef13083835a1AA4d17a8DB4b323DAa` |
| NFT721Upgradeable                | v1.3.5  | `0xa4250853E77Fe50CAe5985526938Fe271E644a58` |
| NFTAccessCondition               | v1.3.5  | `0x07d7dE53BFb00eC78CafA32a33bd08FdF080e565` |
| NFTAccessTemplate                | v1.3.5  | `0x5F5EFAa1f524804Be49ddd283d939CBDE7EF3a32` |
| NFTHolderCondition               | v1.3.5  | `0x6978A78Df973f3eA7EeE92dc1baCC38b21BCDa1a` |
| NFTLockCondition                 | v1.3.5  | `0x8ecda5Ba1A7D29E00fdAc20F4EF0413fd9820d6C` |
| NFTSalesTemplate                 | v1.3.5  | `0x1916daf4f3f4a1c464665681466CdB0F0eE10600` |
| NFTUpgradeable                   | v1.3.5  | `0xB53B2C7e03e040b6B8d0DC99f2eb9920872B430C` |
| PlonkVerifier                    | v1.3.5  | `0xE02BB107C31Df2180042f8473E64B2b252597Ec4` |
| SignCondition                    | v1.3.5  | `0xEd91191a38E56DDAE9d90e1E14081f860Ab137a4` |
| TemplateStoreManager             | v1.3.5  | `0xfC864122E74073D65f8E87c107A0337543FA7FD2` |
| ThresholdCondition               | v1.3.5  | `0x83072123bcc317864723b5f65dFC755d5803494e` |
| TransferDIDOwnershipCondition    | v1.3.5  | `0x6A1eb7070263639635Ad1253fdBc922Ee96B17D9` |
| TransferNFT721Condition          | v1.3.5  | `0x1745E00946eF71aeF4fF807e6d0767AA0D004266` |
| TransferNFTCondition             | v1.3.5  | `0x80a6609C30B438694f956DedaCB6144b9B09bC13` |
| WhitelistingCondition            | v1.3.5  | `0xF65c2F699b0F24834Ea9B0D4cB0637D502A780D8` |

#### Celo Mainnet

The contract addresses deployed on `Celo` Mainnet:

| Contract                         | Version | Address                                      |
|----------------------------------|---------|----------------------------------------------|
| AaveBorrowCondition              | v1.3.10 | `0x84A4D31Bf5ec8Fd4c68520b1dB1Ec63dfc3061cd` |
| AaveCollateralDepositCondition   | v1.3.10 | `0x6b6a71a4deF5a4Bb867EE7506e59C73FA12Cf44d` |
| AaveCollateralWithdrawCondition  | v1.3.10 | `0xe534B75D01560c7c6731860C6c771bA98cFaC52E` |
| AaveCreditTemplate               | v1.3.10 | `0x73b4DF9Ab077213F601f57bDED875b4b4dbc6e51` |
| AaveCreditVault                  | v1.3.10 | `undefined`                                  |
| AaveRepayCondition               | v1.3.10 | `0x7FC87b1AeaF90459a2F77a99b5Ee1E3c80D1042B` |
| AccessCondition                  | v1.3.10 | `0x461c5e60886b00F332914eec39B45a837d7E14E6` |
| AccessProofCondition             | v1.3.10 | `0x27cf7813465788b7a71286f1E855F012576544F2` |
| AccessProofTemplate              | v1.3.10 | `0x1049Be6BCBdB4752d7FcfdEf88d619f382451040` |
| AccessTemplate                   | v1.3.10 | `0x8626629F9253857ACF4568ed448429a8F94aF00E` |
| AgreementStoreManager            | v1.3.10 | `0x7309242968DE8f3CBE64aC8bdB5019dB3Af2feeA` |
| ComputeExecutionCondition        | v1.3.10 | `0x92B2324529e8A3A741F7dc5f9ad9Cc8ef1d4D6E9` |
| ConditionStoreManager            | v1.3.10 | `0x8452Bb335287F7514e57Fa2107075746e0705cA9` |
| DIDRegistry                      | v1.3.10 | `0xfd357a7507397E860f243ecECDb4E1258aF193cd` |
| DIDRegistryLibrary               | v1.3.10 | `0xd426d224F17Bc3b378f3EB92279FF79d5F2FF859` |
| DIDSalesTemplate                 | v1.3.10 | `0x2E037FbC8D67A12ACa79f1Cf265e1c8198b27D91` |
| DistributeNFTCollateralCondition | v1.3.10 | `0x5eE9a8B061E2dc2D106CA8e33ee03Fa8F0b8bbF1` |
| EpochLibrary                     | v1.3.10 | `0x3764B8d2D010d26CfD29390f5c1660e98cBa1920` |
| EscrowComputeExecutionTemplate   | v1.3.10 | `0x7326aEb34F10eFaf921BDD1426FADf214295d147` |
| EscrowPaymentCondition           | v1.3.10 | `0xF6d09cc91b4758AA8D83b4b3CC3C7F102b4a4073` |
| HashLockCondition                | v1.3.10 | `0x8EfFACb261a56A0fC8D713b19667a2CcD9662fF7` |
| LockPaymentCondition             | v1.3.10 | `0x31CB0a50229c07849924101CF048230F6a67F145` |
| NFT721AccessTemplate             | v1.3.10 | `0x210cDbEf6FD853466E13b22B5a34015c0e2A0673` |
| NFT721HolderCondition            | v1.3.10 | `0xDFFF8517FAfa19C5DC7587508F3Fd93f208b507a` |
| NFT721LockCondition              | v1.3.10 | `0x4c9c1c7802532CF0b13DbcA3Bd9CD3a13DA7B9Ac` |
| NFT721SalesTemplate              | v1.3.10 | `0x382D54e4BB0709517c1BCa5Ee79CB5a1Da19BE07` |
| NFT721Upgradeable                | v1.3.10 | `0x3432493Ba54Da0A9565e3FE5180C5eD013F40Fb9` |
| NFTAccessCondition               | v1.3.10 | `0x14b53aDC7541b78E8eC5499Ea8671399f26D3741` |
| NFTAccessTemplate                | v1.3.10 | `0xa64953e9719E9f485a7DaFba06975a4B376C81a0` |
| NFTHolderCondition               | v1.3.10 | `0x1Bfce4D6E007e39bF5Fa31BddBd26c4bF7ea7f4F` |
| NFTLockCondition                 | v1.3.10 | `0x2A14415aa652C9DA808E11c064d9EbFeffc1C3d1` |
| NFTSalesTemplate                 | v1.3.10 | `0x4f98191e4Fabae6Eba7Fd32C60d3bF16e2339597` |
| NFTUpgradeable                   | v1.3.10 | `0xA193081fe7006a3124981f330E2e3406360fA02b` |
| PlonkVerifier                    | v1.3.10 | `0xCb9B51377fA9C278d4Eeb093059463eb6aA3ecd6` |
| SignCondition                    | v1.3.10 | `0xfA0AB9ce92d74F2bb5870426256b918F1f408300` |
| TemplateStoreManager             | v1.3.10 | `0xEEb5d8DF745745439452Fa61993Ab6fB98DdA111` |
| ThresholdCondition               | v1.3.10 | `0x1B286c35b0D998e99e7474d6eF37F2805641F329` |
| TransferDIDOwnershipCondition    | v1.3.10 | `0x4e51732f893092190B82942a0378386C93B10c87` |
| TransferNFT721Condition          | v1.3.10 | `0x5d377489E2e83512b6ed91d33412CD88afc24F9e` |
| TransferNFTCondition             | v1.3.10 | `0x64fcf6F217534518B582D7150F55311813f358D8` |
| WhitelistingCondition            | v1.3.10 | `0xCEd4a67A9d44c7A4357f168116d6476724CA492A` |

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

Load the ABI of the `NeverminedToken` contract on the `Rinkeby` network:

```javascript
const NeverminedToken = require('@nevermined-io/contracts/artifacts/NeverminedToken.rinkeby.json')
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
