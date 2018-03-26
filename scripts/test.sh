#!/usr/bin/env bash

cd packages/core
yarn prod
yarn test:ci
