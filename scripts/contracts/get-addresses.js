const {
    getAddresses
} = require('@nevermined-io/contract-tools')
const network = process.argv[2]

getAddresses({
    network
})
