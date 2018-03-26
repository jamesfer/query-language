#!/usr/bin/env bash

# Abort if any command fails
set -o errexit

echo "Compiling the editor"
cd packages/editor
yarn build

echo "Compiling the demo"
cd ../demo
yarn prod
