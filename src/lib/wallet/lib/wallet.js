'use strict'
const bip39 = require('bip39')
const { ethers } = require('ethers')
const HDKey = require('hdkey')
const util = require('./util')

const defaultHDPath = 'm/44\'/60\'/0\'0' // BIP44路径定义规范
const wallet = {}

wallet.generate = function (randomSeed, hdPath, callback) {
  try {
    if (!randomSeed || !util.validSeed(randomSeed)) {
      randomSeed = bip39.generateMnemonic()
    }
    const seed = bip39.mnemonicToSeedSync(randomSeed)
    hdPath = (util.validHdPath(hdPath)) ? hdPath : defaultHDPath

    const hdKey = HDKey.fromMasterSeed(seed)
    const _hdKey = hdKey.derive(hdPath)
    util.fromHdKey(_hdKey, randomSeed, callback)
  } catch (err) {
    callback(err, null)
  }
}

wallet.getBalance = function (activeWallet, callback) {
  activeWallet.getBalance('pending').then(function (balance) {
    const formatBalance = ethers.utils.formatEther(balance, { commify: true })
    callback(null, formatBalance)
  }, function (err) {
    callback(err, null)
  })
}

wallet.connect = function (wallet, network) {
  const defaultProvider = ethers.getDefaultProvider(network || 'ropsten')
  return wallet.connect(defaultProvider)
}

wallet.fromEncryptedJson = function (keystoreJson, password, callback) {
  ethers.Wallet.fromEncryptedJson(keystoreJson, password).then(function (wallet) {
    callback(null, {wallet})
  }, function (err) {
    callback(err, null)
  })
}

wallet.getTransactionCount = function (activeWallet, callback) {
  activeWallet.getTransactionCount('pending').then(function (transactionCount) {
    callback(null, transactionCount)
  }).catch(err => {
    callback(err, null)
  })
}

module.exports = exports = wallet
