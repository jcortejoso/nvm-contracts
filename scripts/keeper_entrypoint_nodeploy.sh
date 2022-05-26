#!/bin/sh

# We need to move the artifacts folder where it is expected and start openethereum
cp -rp /artifacts/* /nevermined-contracts/artifacts/
cp -rp /circuits/* /nevermined-contracts/circuits/

exec /home/openethereum/openethereum "$@"
