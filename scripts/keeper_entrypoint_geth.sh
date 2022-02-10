#!/bin/sh

echo Starting up

# We need to move the artifacts folder where it is expected
mkdir -p /nevermined-contracts/artifacts
cp -rp /artifacts/* /nevermined-contracts/artifacts/

exec geth "$@"
