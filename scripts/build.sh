#!/bin/sh

wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau

yarn run circom circuits/keytransfer.circom --r1cs --wasm --sym
mv keytransfer.r1cs circuits
mv keytransfer.sym circuits
mv keytransfer.wasm circuits
yarn run snarkjs plonk setup circuits/keytransfer.r1cs powersOfTau28_hez_final_14.ptau circuits/keytransfer.zkey
yarn run snarkjs zkey export verificationkey circuits/keytransfer.zkey circuits/verification_key.json
yarn run snarkjs zkey export solidityverifier circuits/keytransfer.zkey contracts/verifier.sol
# sed -i 's/pragma solidity >=0.7.0 <0.9.0/pragma solidity 0.6.12/' contracts/verifier.sol