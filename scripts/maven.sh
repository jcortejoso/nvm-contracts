#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=en_US.UTF-8
## Generating web3j stubs

shopt -s nullglob # Avoid literal evaluation if not files
mkdir ./tmp/

for file in artifacts/*.development.json
do
    tmpFile=$(basename $file)
    tmpFile=${tmpFile//.development/}

    cp $file ./tmp/${tmpFile}

    web3j truffle generate --javaTypes ./tmp/${tmpFile} -o src/main/java -p io.keyko.nevermind.contracts
done

rm -rf ./tmp/
