#!/bin/sh

export BASE=v1.3.6
export BRANCH=$(git rev-parse --abbrev-ref HEAD)

rm -f .openzeppelin/unknown-31337.json
git checkout $BASE
yarn
yarn compile

# npx hardhat node --port 18545 > /dev/null 2>&1 &

sleep 10

npx hardhat run ./scripts/deploy/truffle-wrapper/deployContractsWrapper.js --network external || exit 1

git checkout $BRANCH
yarn

export FAIL=true

npx hardhat run ./scripts/deploy/truffle-wrapper/upgradeContractsWrapper.js --network external || exit 1
npx hardhat run ./scripts/deploy/truffle-wrapper/upgradePlonkVerifier.js --network external || exit 1
