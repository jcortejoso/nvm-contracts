#!/bin/bash

# default to false in case it is not set
DEPLOY_CONTRACTS="${DEPLOY_CONTRACTS:-false}"

echo "deploy contracts is ${DEPLOY_CONTRACTS}"

if [ "${DEPLOY_CONTRACTS}" = "true" ]
then
    # remove ready flag if we deploy contracts
    rm -f /nevermined-contracts/artifacts/ready

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

tail -f /dev/null
