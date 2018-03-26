#!/usr/bin/env bash

cd packages/core
yarn nyc report --reporter=text-lcov | coveralls
