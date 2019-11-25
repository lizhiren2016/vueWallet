const bip39 = require('bip39')
const Keystore = require('./keystore')

const wordlist = bip39.wordlists.EN
const util = {}

util.bufferToArray = function (buffer) {
  const length = buffer.length
  let data = []
  for (let i = 0; i < length; i++) {
    data.push(buffer[i])
  }
  return data
}

util.validSeed = function (seed) {
  if (typeof seed !== 'string') {
    return false
  }
  return bip39.validateMnemonic(seed, wordlist)
}

util.validHdPath = function validHdPath (hdPath) {
  if (hdPath !== '' && hdPath !== undefined) {
    return true
  }
  return false
}

util.fromHdKey = function (hdKey, randomSeed, callback) {
  try {
    if (!hdKey._privateKey) {
      throw new Error('Something wrong in hdkey.')
    }
    const keystore = new Keystore(hdKey._privateKey)

    keystore.hdKey = hdKey
    callback(null, {keystore, randomSeed})
  } catch (err) {
    callback(err, null)
  }
}

module.exports = exports = util
