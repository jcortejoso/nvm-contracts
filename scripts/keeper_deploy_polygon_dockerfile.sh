#!/bin/bash

set -em

# default to false in case it is not set
DEPLOY_CONTRACTS="${DEPLOY_CONTRACTS:-false}"

echo "deploy contracts is ${DEPLOY_CONTRACTS}"

if [ "${DEPLOY_CONTRACTS}" = "true" ]
then
    cd /polygon-sdk
    rm -rf test-chain
    cat genesis.json
    go run main.go server --dev --chain genesis.json &

    until curl --data '{"method":"web3_clientVersion","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545
    do
        sleep 1
    done

    cat genesis.json

    # remove ready flag if we deploy contracts
    rm -f /nevermined-contracts/artifacts/*

    cd /nevermined-contracts
    yarn clean
    yarn compile
    export NETWORK="${NETWORK_NAME:-development}"

    yarn deploy:${NETWORK}

    # set flag to indicate contracts are ready
    touch /nevermined-contracts/artifacts/ready
fi

# Fix file permissions
EXECUTION_UID=$(id -u)
EXECUTION_GID=$(id -g)
USER_ID=${LOCAL_USER_ID:-$EXECUTION_UID}
GROUP_ID=${LOCAL_GROUP_ID:-$EXECUTION_GID}
chown -R $USER_ID:$GROUP_ID /nevermined-contracts/artifacts

# We move the artifact directory as this path will be mounted in dockercompose
mv /nevermined-contracts/artifacts /artifacts
rm -rf /nevermined-contracts