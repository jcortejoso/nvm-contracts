FROM node:10-alpine
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
      python

COPY . /nevermind-contracts
WORKDIR /nevermind-contracts

RUN npm install -g npm
RUN npm install

ENTRYPOINT ["/nevermind-contracts/scripts/keeper.sh"]
