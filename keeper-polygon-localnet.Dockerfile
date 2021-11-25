FROM golang:1.16
LABEL maintainer="Keyko <root@keyko.io>"

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get -y update && apt-get -y install \
    nodejs \
    python \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/0xPolygon/polygon-sdk.git /polygon-sdk
COPY networks/polygon-localnet/genesis.json /polygon-sdk/genesis.json
COPY scripts/keeper_entrypoint_polygon.sh /

WORKDIR /polygon-sdk
RUN go build main.go

COPY . /nevermined-contracts
WORKDIR /nevermined-contracts

RUN npm install -g yarn
RUN yarn

ENV MNEMONIC="taxi music thumb unique chat sand crew more leg another off lamp"
ENV DEPLOY_CONTRACTS=true
ENV LOCAL_CONTRACTS=true
ENV REUSE_DATABASE=false
ENV NETWORK_NAME=polygon-localnet
ENV KEEPER_RPC_HOST=localhost
ENV KEEPER_RPC_PORT=8545

RUN /nevermined-contracts/scripts/keeper_deploy_polygon_dockerfile.sh

ENTRYPOINT ["/keeper_entrypoint_polygon.sh"]