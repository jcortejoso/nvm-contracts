#!/usr/bin/env sh
# OceanToken
docker run -t -v $(pwd):/src oceanprotocol/echidna:solc-0.5.6 echidna-test /src/test/verification/echidna/OceanToken.sol TEST --config /src/test/verification/echidna/OceanToken.yaml
