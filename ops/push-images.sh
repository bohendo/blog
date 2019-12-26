#!/usr/bin/env bash
set -e

username="`whoami`"
organization="${GITLAB_USER_ID-$username}"
project="blog"
registry_url="${CI_REGISTRY:-registry.gitlab.com}"

commit=`git rev-parse HEAD | head -c 8`
release=`cat package.json | grep '"version":' | awk -F '"' '{print $4}'`

version="$1" # one of "commit" or "release"
shift
images=$@

if [[ "$version" == "commit" ]]
then version=$commit
elif [[ "$version" == "release" ]]
then version=$release
else echo 'First arg should either be "commit" or "release" followed by images to push' && exit 1
fi

function safePush {
  image=${project}_$1
  echo;echo "Pushing $registry_url/$organization/$image:$version"
  if [[ -n "`curl -sflL "$registry_url/$image/tags/$version"`" ]]
  then
    echo "Image $organization/$image:$version already exists on the container registy, Aborting push"
    return
  else
    docker tag $image:$commit $organization/$image:$version
    docker push $organization/$image:$version
    # latest images are used as cache for build steps, keep them up-to-date
    docker tag $organization/$image:$version $organization/$image:latest
    docker push $organization/$image:latest
  fi
}

for image in $images
do safePush $image
done
