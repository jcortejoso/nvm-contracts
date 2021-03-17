#!/bin/bash

# We need to move the artifacts folder where it is expected and start openethereum
cp -rp /nevermined-contracts/artifacts2/* /nevermined-contracts/artifacts/

exec /home/openethereum/openethereum "$@"
