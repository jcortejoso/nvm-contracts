
const Scalar = require("ffjavascript").Scalar
const ZqField = require("ffjavascript").ZqField;
const F = new ZqField(Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617"));
const Web3Utils = require("web3-utils");

const SEED = "mimcsponge";
const NROUNDS = 220;

exports.getConstants = (seed, nRounds) => {
    if (typeof seed === "undefined") seed = SEED;
    if (typeof nRounds === "undefined") nRounds = NROUNDS;
    const cts = new Array(nRounds);
    let c = Web3Utils.keccak256(SEED);
    for (let i=1; i<nRounds; i++) {
        c = Web3Utils.keccak256(c);

        const n1 = Web3Utils.toBN(c).mod(Web3Utils.toBN(F.p.toString()));
        const c2 = Web3Utils.padLeft(Web3Utils.toHex(n1), 64);
        cts[i] = F.e(Web3Utils.toBN(c2).toString());
    }
    cts[0] = F.e(0);
    cts[cts.length - 1] = F.e(0);
    return cts;
};

const cts = exports.getConstants(SEED, NROUNDS);

exports.decrypt = (_xL_in, _xR_in, _k) =>{
    let xL = F.e(_xL_in);
    let xR = F.e(_xR_in);
    const k = F.e(_k);
    for (let i=0; i<NROUNDS; i++) {
        const c = cts[NROUNDS-1-i];
        const t = (i==0) ? F.add(xL, k) : F.add(F.add(xL, k), c);
        const xR_tmp = F.e(xR);
        if (i < (NROUNDS - 1)) {
            xR = xL;
            xL = F.sub(xR_tmp, F.pow(t, 5));
        } else {
            xR = F.sub(xR_tmp, F.pow(t, 5));
        }
    }
    return {
        xL: F.normalize(xL),
        xR: F.normalize(xR),
    };
};
