#!/bin/sh
kill -9 `ps -ef |grep index.js | awk '{print $2}'`cho