#!/bin/bash

base_folder=contracts_flatten
contract=$1
new_contract="${base_folder}/${contract#contracts/}"
mkdir -p $(dirname ${new_contract})
node_modules/truffle-flattener/index.js ${contract} > ${new_contract}

