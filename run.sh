#!/bin/bash
set -e

echo Setting ENV Variables
export CONFIG_PATH="/data/options.json"
echo Env Set

#echo $LD_LIBRARY_PATH
#LD_LIBRARY_PATH=/usr/local/lib
#export LD_LIBRARY_PATH=/usr/local/lib

echo Listing Versions!
node -v
npm -v
yarn -v
ffmpeg -version

echo Starting Server
node index.js