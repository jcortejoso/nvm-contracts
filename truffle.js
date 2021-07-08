require('ts-node/register')

const HDWalletProvider = require('@truffle/hdwallet-provider')
const NonceTrackerSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/nonce-tracker.js')
const utils = require('web3-utils')

const rpcHost = process.env.KEEPER_RPC_HOST
const rpcPort = process.env.KEEPER_RPC_PORT
const url = process.env.KEEPER_RPC_URL
const MNEMONIC = process.env.MNEMONIC

const hdWalletStartIndex = 0
const hdWalletAccounts = 5

let hdWalletProvider

const setupWallet = (
    url
) => {
    if (!hdWalletProvider) {
        hdWalletProvider = new HDWalletProvider({
            mnemonic: MNEMONIC,
            providerOrUrl: url,
            addressIndex: hdWalletStartIndex,
            numberOfAddresses: hdWalletAccounts,
            shareNonce: false,
            pollingInterval: 8000
        })

        const nonceTracker = new NonceTrackerSubprovider()
        hdWalletProvider.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(hdWalletProvider.engine)
    }
    return hdWalletProvider
}

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: rpcHost || 'localhost',
            port: rpcPort || 18545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6721975
        },
        // spree network from docker
        spree: {
            provider: () => setupWallet(
                url || 'http://localhost:8545'
            ),
            network_id: 0x2324, // 8996
            gas: 8000000,
            gasPrice: 10000,
            from: '0xe2DD09d719Da89e5a3D0F2549c7E24566e947260'
        },
        // integration the ocean testnet
        integration: {
            provider: () => setupWallet(
                url || 'https://integration.keyko.com'
            ),
            network_id: 0x897, // 2199
            gas: 6000000,
            gasPrice: 10000,
            from: '0x90eE7A30339D05E07d9c6e65747132933ff6e624'
        },
        // staging the ocean beta network
        staging: {
            provider: () => setupWallet(
                url || 'https://staging.keyko.com'
            ),
            network_id: 0x2323, // 8995
            gas: 6000000,
            gasPrice: 10000,
            from: '0x90eE7A30339D05E07d9c6e65747132933ff6e624'
        },
        // kovan the ethereum testnet
        kovan: {
            provider: () => setupWallet(
                url || `https://kovan.infura.io/v3/${process.env.INFURA_TOKEN}`
            ),
            network_id: 0x2A, // 42
            from: '0x2c0D5F47374b130EE398F4C34DBE8168824A8616'
        },
        // rinkeby the ethereum testnet
        rinkeby: {
            provider: () => setupWallet(
                url || `https://rinkeby.infura.io/v3/${process.env.INFURA_TOKEN}`
            ),
            network_id: 0x4, // 4
            gas: 11 * 1000000,
            gasPrice: utils.toWei("5", "gwei"),
            timeoutBlocks: 200,
            skipDryRun: true,
            from: '0x73943d14131268F23b721E668911bCDDEcA9da62'
        },
        // alfajores the celo testnet
        'celo-alfajores': {
            provider: () => setupWallet(
                url || 'https://alfajores-forno.celo-testnet.org'
            ),
            network_id: 44787,
            from: '0x4747eAb1698a5c72DC3fD07A3074B2E1795D7294'
        },
        // baklava the celo testnet
        'celo-baklava': {
            provider: () => setupWallet(
                url || 'https://baklava-forno.celo-testnet.org'
            ),
            network_id: 62320,
            from: '0x4747eAb1698a5c72DC3fD07A3074B2E1795D7294'
        },
        // Polygon Networks: https://docs.matic.network/docs/develop/network-details/network/
        // Polygon: mumbai testnet
        mumbai: {
            provider: () => setupWallet(
                url || 'https://matic-mumbai.chainstacklabs.com'
            ),
            network_id: 80001,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            from: '0x73943d14131268F23b721E668911bCDDEcA9da62'
        },
        // Polygon: matic mainnet
        matic: {
            provider: () => setupWallet(
                url || 'https://matic-mainnet.chainstacklabs.com'
            ),
            network_id: 137,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            from: '0x73943d14131268F23b721E668911bCDDEcA9da62'
        },
        // mainnet the ethereum mainnet
        mainnet: {
            provider: () => setupWallet(
                url || `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`
                // url || `http://localhost:8545`
            ),
            network_id: 0x1, // 1
            from: '0x3f3c526f3A8623b11aAD5c30d6De88E45e385FaD',
            gas: 7 * 1000000,
            gasPrice: utils.toWei('8', 'gwei')
        },
        // production mainnet
        production: {
            provider: () => setupWallet(
                url || 'https://mainnet.nevermined.io'
            ),
            network_id: 0xCEA11, // 846353
            from: '0xba3e0ec852dc24ca7f454ea545d40b1462501711',
            gas: 6 * 1000000,
            gasPrice: utils.toWei('10', 'mwei')
        }
    },
    plugins: ['solidity-coverage', 'truffle-contract-size'],
    compilers: {
        solc: {
            version: '0.6.12',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 400
                }
            }
        }
    }
}
