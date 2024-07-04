#!/usr/bin/env bash
set -e

if [ -z $1 ]; then
  config=dev1
else
  config="$1"
fi

if [ -z $2 ]; then
  distDir="./dist"
else
  distDir="$2"
fi

echo "config: $config"
echo "distDir: $distDir"

ng version
ng build --output-path="$distDir" -c $config --deleteOutputPath=true --sourceMap=false

