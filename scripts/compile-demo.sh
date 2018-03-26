#!/usr/bin/env bash

# Abort if any command fails
set -o errexit

echo "Compiling the editor"
cd packages/editor
yarn build

echo "Compiling the demo"
cd ../demo
yarn prod

echo "Deploying the demo"
git worktree add gh-pages origin/gh-pages
rm -r gh-pages/*
cp -r dist/* gh-pages
cd gh-pages
git add .
git commit -m "CHORE: Update demo."
git push
cd ../
rm -r gh-pages
