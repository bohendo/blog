FROM node:14.15.4-alpine3.12
WORKDIR /root
ENV HOME /root
ENV PATH ./node_modules/.bin:/root/node_modules/.bin:$PATH
RUN apk add --update --no-cache bash curl g++ gcc git jq make python3
RUN npm config set unsafe-perm true && npm install -g npm@7.11.1
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for

RUN npm install -g lerna@4.0.0

COPY Makefile /Makefile
COPY test.sh /test.sh
COPY entry.sh /entry.sh

ENTRYPOINT ["bash", "/entry.sh"]
