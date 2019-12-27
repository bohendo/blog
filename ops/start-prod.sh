#!/usr/bin/env bash
set -e

# turn on swarm mode if it's not already on
docker swarm init 2> /dev/null || true

####################
# External Env Vars

BLOG_DOMAINNAME="${BLOG_DOMAINNAME:-localhost}"
BLOG_EMAIL="${BLOG_EMAIL:-noreply@gmail.com}" # for notifications when ssl certs expire
BLOG_MODE="${BLOG_MODE:-local}" # One of: release, staging, local

####################
# Internal Config

server_port="8080"
number_of_services="2" # NOTE: Gotta update this manually when adding/removing services :(
project="blog"

####################
# Helper Functions

# Get images that we aren't building locally
function pull_if_unavailable {
  if [[ -z "`docker image ls | grep ${1%:*} | grep ${1#*:}`" ]]
  then
    # But actually don't pull images if we're running locally
    if [[ "$BLOG_DOMAINNAME" != "localhost" ]]
    then docker pull $1
    fi
  fi
}

########################################
## Docker Image Config

if [[ "$BLOG_MODE" == "local" || "$BLOG_MODE" == "staging" ]]
then version="`git rev-parse HEAD | head -c 8`"
elif [[ "$BLOG_MODE" == "release" ]]
then version="`cat package.json | jq .version | tr -d '"'`"
else echo "Unknown mode ($BLOG_MODE) for domain: $BLOG_DOMAINNAME. Aborting" && exit 1
fi

server_image="${project}_server:$version"
proxy_image="${project}_proxy:$version"

pull_if_unavailable "$server_image"
pull_if_unavailable "$proxy_image"

########################################
## Deploy according to configuration

echo "Deploying server image: $server_image to $BLOG_DOMAINNAME"

mkdir -p modules/database/snapshots /tmp/$project
cat - > /tmp/$project/docker-compose.yml <<EOF
version: '3.4'

volumes:
  certs:

services:
  proxy:
    image: $proxy_image
    environment:
      DOMAINNAME: $BLOG_DOMAINNAME
      EMAIL: $BLOG_EMAIL
      SERVER_URL: http://server:8080
      MODE: prod
    logging:
      driver: "json-file"
      options:
          max-file: 10
          max-size: 10m
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - certs:/etc/letsencrypt

  server:
    image: $server_image
    environment:
      NODE_ENV: production
    logging:
      driver: "json-file"
      options:
          max-file: 10
          max-size: 10m

EOF

docker stack deploy -c /tmp/$project/docker-compose.yml $project

echo -n "Waiting for the $project stack to wake up."
while [[ "`docker container ls | grep $project | wc -l | tr -d ' '`" != "$number_of_services" ]]
do echo -n "." && sleep 2
done
echo " Good Morning!"

