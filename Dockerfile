FROM node:14-alpine
LABEL maintainer="Nevermined <root@nevermined.io>"

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

RUN yarn
RUN sh ./scripts/build.sh

RUN yarn clean
RUN yarn compile

ENTRYPOINT ["/nevermined-contracts/scripts/keeper.sh"]
