#!/bin/bash

set -ev

cd $(dirname "$BASH_SOURCE")
git pull
npm install
npm run reload
