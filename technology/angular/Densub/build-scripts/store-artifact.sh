#!/usr/bin/env bash

set -e

if [ -z $3 ]; then
  echo "usage: $(basename $0) <key file> <archive file> <artifact location>"
  exit 1
fi

keyFile="$1"
archiveFile="$2"
artifactLocation="$3"

scp -i "$keyFile" "$archiveFile" "$artifactLocation"
