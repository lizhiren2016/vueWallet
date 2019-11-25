import Web3 from 'web3'

const web3js = {}

web3js.constructor = function () {
  return new Web3('https://ropsten.infura.io/v3/7d0d81d0919f4f05b9ab6634be01ee73')
}

module.exports = exports = web3js
