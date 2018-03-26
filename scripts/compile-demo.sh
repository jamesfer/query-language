#!/usr/bin/env bash

echo "Compiling the editor"
cd packages/editor
yarn build

echo "Compiling the demo"
cd ../demo
yarn prod

#echo "Deploying the demo"
#cp -R dist /tmp/demo-dist/

