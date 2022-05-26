#!/bin/bash

ganache-cli --port 18545 &
sleep 5

npx hardhat run ./scripts/deploy/truffle-wrapper/deployContractsWrapper.js

for i in artifacts/*.external.json; do
  echo $i
  myth a -a $(jq -r .address $i) --rpc localhost:18545
done

