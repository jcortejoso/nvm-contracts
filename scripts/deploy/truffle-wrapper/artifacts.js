const { hardhatArguments, upgrades } = require('hardhat')
const glob = require('glob')
const fs = require('fs')

const web3Utils = require('web3-utils')

const network = hardhatArguments.network || 'hardhat'
const { version } = JSON.parse(fs.readFileSync('./package.json'))

function createFunctionSignature({
    functionName,
    parameters
} = {}) {
    const signature = `${functionName}(${parameters.join(',')})`

    const signatureHash = web3Utils.sha3(signature)
    return signatureHash.substring(0, 10)
}

function generateFunctionSignaturesInABI(
    abi
) {
    abi
        .filter((abiEntry) => abiEntry.type === 'function')
        .forEach((abiEntry) => {
            const parameters = abiEntry.inputs.map((i) => i.type)
            abiEntry.signature = createFunctionSignature({
                functionName: abiEntry.name,
                parameters
            })
        })

    return abi
}

function createArtifact(
    name,
    contract,
    proxyAddress,
    implementationAddress,
    version,
    libraries
) {
    return {
        name,
        abi: generateFunctionSignaturesInABI(contract.abi),
        bytecode: contract.bytecode,
        address: proxyAddress,
        implementation: implementationAddress,
        version,
        libraries
    }
}

async function exportArtifacts(contracts, addressBook, libraries) {
    const files = glob.sync('./artifacts/**/*.json').filter(a => !a.match('.dbg.')).filter(a => contracts.some(b => a.match(b + '.json')))
    for (const c of contracts) {
        const implAddress = await upgrades.erc1967.getImplementationAddress(addressBook[c])
        const file = files.find(a => a.match(c))
        const contract = JSON.parse(fs.readFileSync(file))
        const artifact = createArtifact(c, contract, addressBook[c], implAddress, `v${version}`, libraries[c] || {})
        fs.writeFileSync(`new-artifacts/${c}.${network}.json`, JSON.stringify(artifact, null, 2))
    }
    fs.writeFileSync('new-artifacts/ready', '')
}

function readArtifact(c) {
    return JSON.parse(fs.readFileSync(`new-artifacts/${c}.${network}.json`))
}

async function writeArtifact(c, contract, libraries) {
    const files = glob.sync('./artifacts/**/*.json').filter(a => !a.match('.dbg.')).filter(a => a.match(c + '.json'))
    const file = files.find(a => a.match(c))
    const data = JSON.parse(fs.readFileSync(file))
    const implAddress = await upgrades.erc1967.getImplementationAddress(contract.address)
    const artifact = createArtifact(c, data, contract.address, implAddress, `v${version}`, libraries || {})
    fs.writeFileSync(`new-artifacts/${c}.${network}.json`, JSON.stringify(artifact, null, 2))
}

module.exports = {
    writeArtifact,
    readArtifact,
    exportArtifacts
}
