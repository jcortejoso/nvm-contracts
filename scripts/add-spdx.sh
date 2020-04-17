#!/usr/bin/env bash

# Add SPDX (license information) lines
# to all source code files and documentation source files
# in this directory and subdirectories (recursively).
#
# To read about SPDX, see https://spdx.org/
#
# Note that this script might also edit files in your virtualenv,
# but that shouldn't be a problem,
# because Git should be ignoring changes in those files.

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
# This original script: https://github.com/bigchaindb/BEPs/blob/master/tools/add-spdx

cd contracts/
set -euo pipefail
IFS=$'\n\t'

# All files named *.js or *.go (JavaScript, Node.js or Golang)
find . -type f \( -name "*.sol" \) | while read fname; do
    # The file '$fname' begins with a pragma so add the SPDX lines on lines 2+
    sed -i '' -e '2s;^;// Copyright BigchainDB GmbH and Ocean Protocol contributors\
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)\
// Code is Apache-2.0 and docs are CC-BY-4.0\
;' $fname
done
