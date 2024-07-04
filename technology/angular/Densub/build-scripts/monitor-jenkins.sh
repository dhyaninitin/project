#!/usr/bin/env bash

set -e

pid=$("ps -ef | grep 'jenkins.pid' | grep -v 'grep jenkins.pid'")

if [ -z "$pid" ]; then
  systemctl stop jenkins
  systemctl start jenkins
fi
