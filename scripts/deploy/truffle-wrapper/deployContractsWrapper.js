/* global artifacts, web3 */
const { argv } = require('yargs')
const initializeContracts = require('./deploy/initializeContracts.js')
const setupContracts = require('./deploy/setupContracts.js')
const evaluateContracts = require('./evaluateContracts.js')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')
const { ethers, upgrades } = require('hardhat')
const glob = require('glob')
const fs = require('fs')
const { name, version } = require(`${process.env.PWD}/package.json`)

const web3Utils = require('web3-utils')

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
    version
) {
    return {
        name,
        abi: generateFunctionSignaturesInABI(contract.abi),
        bytecode: contract.bytecode,
        address: proxyAddress,
        implementation: implementationAddress,
        version
    }
}

async function exportArtifacts(contracts, addressBook) {
    let files = glob.sync('./artifacts/**/*.json').filter(a => !a.match('.dbg.')).filter(a => contracts.some(b => a.match(b+'.json')))
    let provider = {
        send: function (method, params) {
            return new Promise((resolve, reject) => {
                web3.currentProvider.send(
                    {
                        jsonrpc: '2.0',
                        method,
                        params,
                        id: Date.now()
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error)
                        }
                            resolve(result.result)
                    }
                )
            })
        }
    }
    for (let c of contracts) {
        const implAddress = await getImplementationAddress(provider, addressBook[c])
        let file = files.find(a => a.match(c))
        let contract = JSON.parse(fs.readFileSync(file))
        let artifact = createArtifact(c, contract, addressBook[c], implAddress, `v${version}`)
        fs.writeFileSync(`new-artifacts/${c}.json`, JSON.stringify(artifact,null,2))
    }
}

async function main() {
    const parameters = argv._
    const verbose = true
    const testnet = true
    const contracts = evaluateContracts({
        contracts: parameters.splice(2),
        verbose,
        testnet
    })

    const accounts = await web3.eth.getAccounts()
    // console.log(web3.eth.accounts)

    // console.log(contracts)
    const DIDRegistryLibrary = await ethers.getContractFactory('DIDRegistryLibrary')
    const didRegistryLibrary = await upgrades.deployProxy(DIDRegistryLibrary)
    await didRegistryLibrary.deployed()
    const EpochLibrary = await ethers.getContractFactory('EpochLibrary')
    const epochLibrary = await upgrades.deployProxy(EpochLibrary)
    await epochLibrary.deployed()

    const roles = {
        deployer: accounts[0],
        upgrader: accounts[1],
        ownerWallet: accounts[2],
        upgraderWallet: accounts[3]
    }

    console.log(roles)
    const {cache, addressBook} = await initializeContracts({
        contracts,
        roles,
        network: '',
        didRegistryLibrary: didRegistryLibrary.address,
        epochLibrary: epochLibrary.address,
        verbose
    })

    await setupContracts({
        web3,
        artifacts,
        addressBook,
        roles,
        verbose
    })

    contracts.push('DIDRegistryLibrary')
    contracts.push('EpochLibrary')
    addressBook['DIDRegistryLibrary'] = didRegistryLibrary.address
    addressBook['EpochLibrary'] = epochLibrary.address
    addressBook['PlonkVerifier'] = cache['PlonkVerifier'].address
    await exportArtifacts(contracts, addressBook)

    process.exit(0)
}

main()
