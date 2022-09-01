#!/bin/bash
set -e

echo Setting ENV Variables
export CONFIG_PATH="/data/options.json"
echo Env Set

echo Listing Versions!
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"
echo "Yarn Version: $(yarn -v)"
ffmpeg -version

echo Checking Vosk SO
node ./utils/getVoskSO.js

echo Getting Model
node ./utils/getModel.js
echo Model Loaded

echo Starting Server
node index.js