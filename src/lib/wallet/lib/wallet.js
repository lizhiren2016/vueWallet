'use strict'
const bip39 = require('bip39')
const { ethers } = require('ethers')
const HDKey = require('hdkey')
const BigNumber = require('bignumber.js')
const util = require('./util')
const abi = require('./abi')

const defaultHDPath = 'm/44\'/60\'/0\'0' // BIP44路径定义规范
const wallet = {}

/**
 * 初始化合约
 * @param address {String} 合约地址
 * @param network {string} 网络地址
 * @returns {Contract}
 */
wallet.newContract = function (address, network) {
  const defaultProvider = ethers.getDefaultProvider(network || 'ropsten')
  return new ethers.Contract(address, abi, defaultProvider)
}

/**
 * 获取合约账户余额
 * @param contract {Object} 合约对象
 * @param address {String} 查询的地址
 * @param callback
 */
wallet.getContractBalance = function (contract, address, callback) {
  contract.balanceOf(address).then(function (balance) {
    callback(null, new BigNumber(balance).toNumber())
  }).catch(err => {
    callback(err, null)
  })
}

// 使用随机数作为私钥创建钱包账号
wallet.RandomNumberGeneration = function (callback) {
  try {
    const privateKey = ethers.utils.randomBytes(32)
    const wallet = new ethers.Wallet(privateKey)
    console.log('账号地址: ' + wallet.address)
    // 注意 ethers.utils.randomBytes 生成的是一个字节数组，
    // 如果想用十六进制数显示出来表示，需要转化为 BigNumber 代码如下：
    let randomNumber = ethers.utils.bigNumberify(privateKey)
    console.log(randomNumber._hex)
    callback(null, wallet)
  } catch (err) {
    callback(err, null)
  }
}

// 通过助记词方式创建钱包账号
wallet.randomSeedGenerate = function (randomSeed, hdPath, callback) {
  try {
    // 若传入的randomSeed不存在，则自动生成一个randomSeed
    if (!randomSeed || !util.validSeed(randomSeed)) {
      randomSeed = bip39.generateMnemonic()
    }
    // 通过助记词转化为种子
    const seed = bip39.mnemonicToSeedSync(randomSeed)
    // 使用BIP-0032或类似的方法生成确定性钱包
    hdPath = (util.validHdPath(hdPath)) ? hdPath : defaultHDPath

    // 通过生成种子的进一步生成私钥
    const hdKey = HDKey.fromMasterSeed(seed)
    // 利用hdPath导出子私钥
    const _hdKey = hdKey.derive(hdPath)
    // 通过私钥导出keystore（生成一个keystore对象）
    util.fromHdKey(_hdKey, randomSeed, callback)
  } catch (err) {
    callback(err, null)
  }
}

// 获取以太账户余额
wallet.getBalance = function (activeWallet, callback) {
  activeWallet.getBalance('pending').then(function (balance) {
    const formatBalance = ethers.utils.formatEther(balance, { commify: true })
    callback(null, formatBalance)
  }, function (err) {
    callback(err, null)
  })
}

// 获取TransactionCount
wallet.getTransactionCount = function (activeWallet, callback) {
  activeWallet.getTransactionCount('pending').then(function (transactionCount) {
    callback(null, transactionCount)
  }).catch(err => {
    callback(err, null)
  })
}

// 连接到network
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

wallet.utils = function () {
  return ethers.utils
}

module.exports = exports = wallet
