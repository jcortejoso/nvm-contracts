#!/usr/bin/env bash

truffle build \
&& docker run -t -v $(pwd):/src oceanprotocol/manticore:solc-0.5.6 ./src/test/verification/manticore/mcore.sh
