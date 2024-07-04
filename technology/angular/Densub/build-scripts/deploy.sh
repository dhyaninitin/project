#!/usr/bin/env bash

#bash -e -x build-scripts/install-nginx.sh "archives/densub-angular-$GIT_BRANCH-$GIT_COMMIT-$JOB-II.zip" densub@dev1.densub.com

set -e

if [ -z $2 ]; then
  echo "usage: $(basename $0) <archive file> <wwwDir>"
  exit 1
fi

archiveFile="$1"
wwwDir="$2"
rollbackDir="$wwwDir-rollback"

rm -rf "$rollbackDir"
mv "$wwwDir" "$rollbackDir"
mkdir -p "$wwwDir"
unzip "$archiveFile" -d "$wwwDir"
