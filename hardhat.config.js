/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@openzeppelin/hardhat-upgrades')
require('@nomiclabs/hardhat-truffle5')

module.exports = {
    solidity: {
        version: '0.8.9',
        settings: {
            optimizer: {
                enabled: true,
                runs: 10
            }
        }
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
            initialBaseFeePerGas: 0
        },
        spree: {
            url: 'http://localhost:8545',
            accounts: {
                mnemonic: 'taxi music thumb unique chat sand crew more leg another off lamp'
            }
            //            accounts: ['0xb3244c104fb56d28d3979f6cd14a8b5cf5b109171d293f4454c97c173a9f9374'],
        },
        external: {
            url: 'http://localhost:18545'
        }
    }
}
