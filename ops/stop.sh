#!/usr/bin/env bash
set -e

project="blog"

docker container stop ${project}_builder 2> /dev/null || true
docker stack rm $project 2> /dev/null || true

echo -n "Waiting for the $project stack to shutdown."

# wait until there are no more containers in this stack
while [[ -n "`docker container ls --quiet --filter label=com.docker.stack.namespace=$project`" ]]
do echo -n '.' && sleep 3
done

# wait until the stack's network has been removed
while [[ -n "`docker network ls --quiet --filter label=com.docker.stack.namespace=$project`" ]]
do echo -n '.' && sleep 3
done

echo ' Goodnight!'
