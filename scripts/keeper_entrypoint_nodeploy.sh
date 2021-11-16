#!/bin/bash

# We need to move the artifacts folder where it is expected and start openethereum
cp -rp /nevermined-contracts/artifacts2/* /nevermined-contracts/artifacts/

exec /home/openethereum/openethereum \
      --config /home/openethereum/config/config.toml \
      --db-path /home/openethereum/chains \
      --keys-path /home/openethereum/.local/keys \
      --base-path /home/openethereum/base \
      --min-gas-price 0 \
      --jsonrpc-cors all \
      --jsonrpc-interface all \
      --jsonrpc-hosts all \
      --jsonrpc-apis all \
      --unsafe-expose \
      --no-warp \
      --unlock 0x00bd138abd70e2f00903268f3db08f2d25677c9e \
      --node-key 0xb3244c104fb56d28d3979f6cd14a8b5cf5b109171d293f4454c97c173a9f9374

# exec /home/openethereum/openethereum "$@"
