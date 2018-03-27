#!/usr/bin/env bash
set -e

cd packages/core
yarn lint
yarn prod
yarn test:ci
