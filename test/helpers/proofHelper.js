const poseidon = require('circomlib').poseidon
const babyJub = require('circomlib').babyJub
const mimcjs = require('circomlib').mimcsponge
const ZqField = require('ffjavascript').ZqField
const Scalar = require('ffjavascript').Scalar
const F = new ZqField(Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617'))
const snarkjs = require('snarkjs')
const { unstringifyBigInts } = require('ffjavascript').utils

exports.makeProof = async function(orig1, orig2, buyerK, providerK) {
    const origHash = poseidon([orig1, orig2])
    const buyerPub = babyJub.mulPointEscalar(babyJub.Base8, F.e(buyerK))
    const providerPub = babyJub.mulPointEscalar(babyJub.Base8, F.e(providerK))

    const k = babyJub.mulPointEscalar(buyerPub, F.e(providerK))

    const cipher = mimcjs.hash(orig1, orig2, k[0])

    const snarkParams = {
        buyer_x: buyerPub[0],
        buyer_y: buyerPub[1],
        provider_x: providerPub[0],
        provider_y: providerPub[1],
        xL_in: orig1,
        xR_in: orig2,
        cipher_xL_in: cipher.xL,
        cipher_xR_in: cipher.xR,
        provider_k: providerK,
        hash_plain: origHash
    }

    // console.log(snark_params)

    const { proof } = await snarkjs.plonk.fullProve(
        snarkParams,
        'circuits/keytransfer.wasm',
        'circuits/keytransfer.zkey'
    )

    const signals = [
        buyerPub[0],
        buyerPub[1],
        providerPub[0],
        providerPub[1],
        cipher.xL,
        cipher.xR,
        origHash
    ]

    const proofSolidity = (await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(proof), signals))
    const proofData = proofSolidity.split(',')[0]

    return {
        origHash,
        buyerPub,
        providerPub,
        cipher: [cipher.xL, cipher.xR],
        proof: proofData
    }
}
