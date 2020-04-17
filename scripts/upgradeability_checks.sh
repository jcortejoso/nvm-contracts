#!/bin/bash
# THIS SCRIPT USES SLITHER TO VALIDATE THAT THE CURRENT KEEPER CONTRACTS ARE UPGRADEABLE
# for more info about Slither contract upgradeability check, check out the link below
# https://github.com/crytic/slither/wiki/Upgradeability-Checks#proxy-contract

zos_version=$(npm info zos version)

# download the same zos version
wget https://github.com/zeppelinos/zos/archive/v"$zos_version".tar.gz
tar xfvz v"$zos_version".tar.gz
mv zos-"$zos_version" zos
rm v"$zos_version".tar.gz
cd zos/packages/lib
npm install
rm contracts/mocks/WithConstructorImplementation.sol
cd ../../../

# run slither-check-upgradeability
files=$(pwd)/files
for entry in contracts/*/*/*
do
    echo $(basename "$entry") | cut -f 1 -d "." >> files
done
while IFS= read -r contract
do
  slither-check-upgradeability zos/packages/lib/ UpgradeabilityProxy . "$contract"
done < "$files"
rm "$files"
