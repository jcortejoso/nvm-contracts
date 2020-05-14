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

COPY . /nevermined-contracts
WORKDIR /nevermined-contracts

RUN yarn

ENTRYPOINT ["/nevermined-contracts/scripts/keeper.sh"]
