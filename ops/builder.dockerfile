FROM node:12.13.0-alpine3.9
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make python
RUN npm config set unsafe-perm true
RUN npm install -g npm@6.12.0
RUN npm install -g lerna@3.19.0
COPY ops /ops
ENV PATH="./node_modules/.bin:${PATH}"
ENTRYPOINT ["bash", "/ops/permissions-fixer.sh"]
