const EthTx = require('ethereumjs-tx').Transaction
const tx = {}

tx.valueTx = function (txParams) {
  return new EthTx(txParams, {chain: 'ropsten'})
}

tx.contractTx = function (data, txParams) {
  txParams.data = data
  return new EthTx(txParams)
}

module.exports = exports = tx
