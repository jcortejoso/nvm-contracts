const {
    getAddresses
} = require('@keyko-io/contract-tools')
const network = process.argv[2]

getAddresses({
    network
})
