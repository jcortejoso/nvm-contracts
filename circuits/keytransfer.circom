pragma circom 2.0.0;

include "circomlib/circuits/pointbits.circom";
include "circomlib/circuits/escalarmulany.circom";
include "circomlib/circuits/escalarmulfix.circom";

include "circomlib/circuits/mimcsponge.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/gates.circom";
include "circomlib/circuits/comparators.circom";

template Main() {
	signal input provider_k;

	signal input xL_in; // plain text part 1
	signal input xR_in; // plain text part 2

	signal input buyer_x;
	signal input buyer_y;
	signal input provider_x;
	signal input provider_y;
	signal input cipher_xL_in; // cipher text part 1
	signal input cipher_xR_in; // cipher text part 2
	signal input hash_plain; // hash of plain text

	signal output buyer_x_out;
	signal output buyer_y_out;
	signal output provider_x_out;
	signal output provider_y_out;
	signal output cipher_xL_in_out; // cipher text part 1
	signal output cipher_xR_in_out; // cipher text part 2
	signal output hash_plain_out; // hash of plain text
	var i;

	component snum2bits = Num2Bits(253);
    snum2bits.in <== provider_k;

	// compute secret key

	component mulAny = EscalarMulAny(253);
    for (i=0; i<253; i++) {
        mulAny.e[i] <== snum2bits.out[i];
    }
	mulAny.p[0] <== buyer_x;
	mulAny.p[1] <== buyer_y;

	// check provider public key matches to private key
	var BASE8[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];
    component mulFix = EscalarMulFix(253, BASE8);
    for (i=0; i<253; i++) {
        mulFix.e[i] <== snum2bits.out[i];
    }

	mulFix.out[0]-provider_x === 0;
	mulFix.out[1]-provider_y === 0;

	// encrypt and hash
	component encrypt = MiMCFeistel(220);
	component hashplain = Poseidon(2);

	encrypt.xL_in <== xL_in;
	encrypt.xR_in <== xR_in;
	encrypt.k <== mulAny.out[0];

	hashplain.inputs[0] <== xL_in;
	hashplain.inputs[1] <== xR_in;

	// check that hashes are correct
	encrypt.xL_out - cipher_xL_in === 0;
	encrypt.xR_out - cipher_xR_in === 0;
	hashplain.out === hash_plain;

	buyer_x_out <== buyer_x;
	buyer_y_out <== buyer_y;
	provider_x_out <== provider_x;
	provider_y_out <== provider_y;
	cipher_xL_in_out <== cipher_xL_in;
	cipher_xR_in_out <== cipher_xR_in;
	hash_plain_out <== hash_plain;
}

template Main2() {
	signal input buyer_x;
	signal input buyer_y;
	signal input provider_x;
	signal input provider_y;
	signal input cipher_xL_in; // cipher text part 1
	signal input cipher_xR_in; // cipher text part 2
	signal input hash_plain; // hash of plain text

	signal output buyer_x_out;
	signal output buyer_y_out;
	signal output provider_x_out;
	signal output provider_y_out;
	signal output cipher_xL_in_out; // cipher text part 1
	signal output cipher_xR_in_out; // cipher text part 2
	signal output hash_plain_out; // hash of plain text

//	buyer_x === 25786834116938684156307823097376212196300791911526042045152431814741858569744;
	buyer_x === 1200;

	buyer_x_out <== buyer_x;
	buyer_y_out <== buyer_y;
	provider_x_out <== provider_x;
	provider_y_out <== provider_y;
	cipher_xL_in_out <== cipher_xL_in;
	cipher_xR_in_out <== cipher_xR_in;
	hash_plain_out <== hash_plain;
}

component main = Main2();
