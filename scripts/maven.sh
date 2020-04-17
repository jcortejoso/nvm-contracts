#!/bin/bash

## Copying and formatting artifacts

shopt -s nullglob # Avoid literal evaluation if not files

mkdir ./tmp/
rm -rf ./target/

for file in artifacts/*.development.json
do
    tmpFile=$(basename $file)
    tmpFile=${tmpFile//.development/}

    cp $file ./tmp/${tmpFile}
done

mvn clean install

rm -rf ./tmp/
