const { web3, ethers } = require('hardhat')
const { readArtifact, exportLibraryArtifact } = require('./artifacts')
const { loadWallet } = require('./wallets')

async function main() {
    const verbose = true

    const c = 'PlonkVerifier'

    const { roles } = await loadWallet({})

    const afact = readArtifact(c)
    const factory = await ethers.getContractFactory(c, { libraries: afact.libraries })
    if (verbose) {
        console.log(`upgrading ${c} from ${afact.address}`)
    }
    const library = await factory.deploy()
    const h1 = library.deployTransaction.hash
    await library.deployed()
    const address = (await web3.eth.getTransactionReceipt(h1)).contractAddress
    await exportLibraryArtifact(c, address)

    if (verbose) {
        console.log(`setting dispute manager to ${address}`)
    }
    const afactCond = readArtifact('AccessProofCondition')
    const AccessProofCondition = await ethers.getContractFactory('AccessProofCondition')
    const cond = AccessProofCondition.attach(afactCond.address)
    const tx = await cond.changeDisputeManager(address, { from: roles.owner })
    await tx.wait()
}

main()
