const {
    getAddresses
} = require('@oceanprotocol/dori')
const network = process.argv[2]

getAddresses({
    network
})
