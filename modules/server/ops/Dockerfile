FROM node:14.15.4-alpine3.12
WORKDIR /root
ENV HOME /root
ENV PATH ./node_modules/.bin:/root/node_modules/.bin:$PATH
RUN apk add --update --no-cache bash curl g++ gcc git jq make python3
# npm 7.x.x doesn't seem to respect the --production flag so stick with 6.x.x for now
RUN npm config set unsafe-perm true && npm install -g npm@6.14.13
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for

COPY package.json package.json
RUN npm install --production

COPY ops ops
COPY dist dist

ENTRYPOINT ["bash", "ops/entry.sh"]
