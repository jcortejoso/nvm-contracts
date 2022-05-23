FROM node:14-alpine
LABEL maintainer="Keyko <root@keyko.io>"

RUN apk add --no-cache --update\
      bash\
      g++\
      gcc\
      git\
      krb5-dev\
      krb5-libs\
      krb5\
      make\
      python3

COPY . /nevermined-contracts
WORKDIR /nevermined-contracts

RUN yarn --network-timeout 1000
RUN yarn clean
RUN yarn compile

ENTRYPOINT ["/nevermined-contracts/scripts/keeper.sh"]
