const circomlib = require('circomlibjs')

// const ZqField = require('ffjavascript').ZqField
// const Scalar = require('ffjavascript').Scalar
// const F = new ZqField(Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617'))

let F

const snarkjs = require('snarkjs')
const { unstringifyBigInts } = require('ffjavascript').utils

function conv(x) {
    let acc = 1n;
    let res = 0n;
    for (let el of x) {
        res = res + BigInt(el)*acc
        acc = acc * 256n
    }
    return res
}

function conv2(x) {
    let acc = 1n;
    let res = 0n;
    for (let el of x) {
        res = res * 256n
        res = res + BigInt(el)
    }
    return res
}

/*
console.log(F)
console.log(Scalar)
console.log(ZqField)
*/
function conv(x) {
    let res = F.toObject(x)
    // console.log(res)
    return res
}

/*
function conv(x) {
    console.log(x)
    return BigInt('0x' + Buffer.from(x).toString('hex')).toString(10)
}
*/

exports.makeProof = async function(orig1, orig2, buyerK, providerK) {
    const poseidon = await circomlib.buildPoseidonReference()
    const babyJub = await circomlib.buildBabyjub()
    const mimcjs = await circomlib.buildMimcSponge()
    F = poseidon.F

    console.log('pos f', poseidon.F.toObject)

    const origHash = poseidon([F.e(orig1), F.e(orig2)])

    console.log('hash', origHash, conv(origHash), conv2(origHash))

    const buyerPub = babyJub.mulPointEscalar(babyJub.Base8, buyerK)
    const providerPub = babyJub.mulPointEscalar(babyJub.Base8, providerK)

    const k = babyJub.mulPointEscalar(buyerPub, providerK)

    const cipher = mimcjs.hash(orig1, orig2, k[0])

    // let test = 1200
    let test = conv(buyerPub[0])

    const snarkParams = {
        // private
        xL_in: orig1,
        xR_in: orig2,
        provider_k: providerK,
        // public
        // buyer_x: conv(buyerPub[0]),
        buyer_x: test,
        buyer_y: conv(buyerPub[1]),
        provider_x: conv(providerPub[0]),
        provider_y: conv(providerPub[1]),
        cipher_xL_in: conv(cipher.xL),
        cipher_xR_in: conv(cipher.xR),
        hash_plain: conv(origHash)
    }

    console.log(snarkParams)

    const { proof } = await snarkjs.plonk.fullProve(
        snarkParams,
        'circuits/keytransfer.wasm',
        'circuits/keytransfer.zkey'
    )

    const signals = [
//        buyerPub[0],
        test,
        buyerPub[1],
        providerPub[0],
        providerPub[1],
        cipher.xL,
        cipher.xR,
        origHash
    ]

    const proofSolidity = (await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(proof), signals))
    console.log('sol proof', proofSolidity)
    const proofData = proofSolidity.split(',')[0]

    // buyerPub[0] = test.toString(10)
    buyerPub[0] = test

    return {
        origHash: conv(origHash),
        buyerPub: [test, conv(buyerPub[1])],
        providerPub: [conv(providerPub[0]), conv(providerPub[1])],
        cipher: [conv(cipher.xL), conv(cipher.xR)],
        proof: proofData
    }
}
