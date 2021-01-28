#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=en_US.UTF-8
## Generating web3j stubs

shopt -s nullglob # Avoid literal evaluation if not files
mkdir -p ./tmp/

#for file in artifacts/*.development.json
for file in build/contracts/*.json
do
    tmpFile=$(basename $file)
    #tmpFile=${tmpFile//.development/}

    cp $file ./tmp/${tmpFile}

    web3j truffle generate ./tmp/${tmpFile} -o src/main/java -p io.keyko.nevermined.contracts
done

rm -rf ./tmp/
