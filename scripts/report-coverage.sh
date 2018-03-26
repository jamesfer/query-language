#!/usr/bin/env bash

yarn nyc report --reporter=text-lcov | coveralls
