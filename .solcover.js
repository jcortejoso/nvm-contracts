module.exports = {
  skipFiles: ["test"],
  mocha: {
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
  providerOptions: {
    gas: 0xfffffffffff,
    gasPrice: 0x01,
  },
}
