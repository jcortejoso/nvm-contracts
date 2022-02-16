#!/bin/sh

rm -f .openzeppelin/unknown-31337.json
git checkout master
yarn
yarn compile

npx hardhat node --port 18545

npx hardhat run ./scripts/deploy/truffle-wrapper/deployContractsWrapper.js --network external

git checkout $BRANCH
yarn

npx hardhat run ./scripts/deploy/truffle-wrapper/upgradeContractsWrapper.js --network external
