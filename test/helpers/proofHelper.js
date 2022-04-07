const circomlib = require('circomlibjs')

const snarkjs = require('snarkjs')
const { unstringifyBigInts } = require('ffjavascript').utils

exports.makeProof = async function(orig1, orig2, buyerK, providerK) {
    const poseidon = await circomlib.buildPoseidonReference()
    const babyJub = await circomlib.buildBabyjub()
    const mimcjs = await circomlib.buildMimcSponge()
    const F = poseidon.F
    function conv(x) {
        const res = F.toObject(x)
        return res
    }
    const origHash = poseidon([F.e(orig1), F.e(orig2)])

    const buyerPub = babyJub.mulPointEscalar(babyJub.Base8, buyerK)
    const providerPub = babyJub.mulPointEscalar(babyJub.Base8, providerK)

    const k = babyJub.mulPointEscalar(buyerPub, providerK)

    const cipher = mimcjs.hash(orig1, orig2, k[0])

    const snarkParams = {
        // private
        xL_in: orig1,
        xR_in: orig2,
        provider_k: providerK,
        // public
        buyer_x: conv(buyerPub[0]),
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
        buyerPub[0],
        buyerPub[1],
        providerPub[0],
        providerPub[1],
        cipher.xL,
        cipher.xR,
        origHash
    ]

    console.log(signals)

    const proofSolidity = (await snarkjs.plonk.exportSolidityCallData(unstringifyBigInts(proof), signals))
    // const proofData = proofSolidity.split(',')[0]
    const proofData = '0x2e99da08e001219ce4b9f17c7e7c0e0a291dfd98c53d8d9785fa8da2124a1066170daab681414b1e95a1e8667373b6bb0930cb0067131a0a3dc288978d03de15109f1a55aa7a13124755bc7716912cc471e2a2d22dfbcca8d62d34f49699519e16b1da809311fa298b2d5b8963fdd286376937de84aa2f8766acd4404a4656d61018b5ca92e32a95c3a6e08695a1e19fbece97d5782822d887739fea606646c12ce3e0d8cd973e685eea86c733f83bdba979ae7cc1c2fbc2748c83f07918a7ff2669b6dc307fd4b1e7d5aad9ac397088bfaba41bbd8a24a9e3237ee48601d2632adc5c08ad151139cea577d29c4abb2925b0b7626a4f6a168b88fed788340de81c186255c3c13b078fc5f97dd53309bfafd4fdf838278af1206df32135a4c9ba03ef2748d917d9ef3c1deef5999c0ba1a5e275a1bc00fbe81f415e59147bf38a29f38b379da8d67bc99206311bb249625ed5f45f26969ec81ffd534ef0d14a7e09ccd72bc5dfc449605a04f44245d1dc9bb3bee93599d8add7f62eedb1dda61802a10fef2343e780cc84435ecb4662fa0186c650f261615182cb8275e885a7d81a133f18d173de18619b85c620acd4718b852173bbcd1f1fd8724f3ed1153713233ed3e1d4ac3308b4f08826051e461553041058c95b7e4ca85b756d00bb9674040ebcd7f6ece2858cb98d3d4a96afc5e938379c17a48a05fb3f069ceedb6f7f14eeab8beb3a3cb07bd624a16ae5c5eb90b679ad6693b7328079571cbf6034b413eee35ed8e5dc003fc14641b51f568a38d3fd683d8caf6302b1e069199b078b0ec2a3b29e9dffd9c53550f4cee72f132db19380bdce67d33296756a6184bac3258da214335a5f21398f65747b571e13647660448f32495d0ac8414c6eeb78f83004c077030cf66f9e24fb28a6765a561bfbd07cdfe591be5fab66a378d66ac5273c8360a0408db663b64680c2728c5bcd3f1e380a979125f078f6874078e079068136689a91f3a7ab5d10372d5119dab8b5ab61623bd28c02d39c7072e6991518e13a86a25cf7e94f2824afc2f596df4facfd760e88344a072ecf509bc507940e1ecc60f4e3922dd98d0761366f63ac27de34d375e7d873664b0c00305bc25b'

    return {
        origHash: conv(origHash),
        buyerPub: [conv(buyerPub[0]), conv(buyerPub[1])],
        providerPub: [conv(providerPub[0]), conv(providerPub[1])],
        cipher: [conv(cipher.xL), conv(cipher.xR)],
        proof: proofData
    }
}
