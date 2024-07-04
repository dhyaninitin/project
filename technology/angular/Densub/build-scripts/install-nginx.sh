#!/usr/bin/env bash
set -e

# This file must be run on the target nginx web server

if [ -z $1 ]; then
  echo "usage: $(basename $0) archiveFile"
  exit 1
fi

archiveFile="$1"
archivePath="$(realname $1)"

if [ ! -e $archiveFile ]; then
  echo "$archive does not exist"
  exit 1
fi

name=$(basename -s .zip "$archiveFile")
installDir="/var/www/$name"
webroot="/var/www/densub"

#Should fail if $installDir already exists
mkdir "$installDir"

cd "$installDir"
unzip "$archivePath"

rm "$webroot"
ln -s "$installDir" "$webroot"

echo "web webroot size: $(du -sh /var/www)"
echo ""
echo "Available space"
df -h /var/www

echo "Note that old installations should be periodically removed before disk space is consumed"
