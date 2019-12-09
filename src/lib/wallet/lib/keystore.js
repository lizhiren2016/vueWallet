
const ethUtil = require('ethereumjs-util')
const crypto = require('crypto')
const scrypt = require('scrypt-async')
const uuid = require('uuid')
// const util = require('./util')
const keystore = function (privateKey) {
  if (!privateKey) {
    throw new Error('Please enter private key.')
  }
  if (!ethUtil.isValidPrivate(privateKey)) {
    throw new Error('Private key is invalid.')
  }
  this._privateKey = privateKey
  this._publicKey = ethUtil.privateToPublic(privateKey)
}

Object.defineProperty(keystore.prototype, 'privateKey', {
  get: function () {
    return this._privateKey
  }
})

Object.defineProperty(keystore.prototype, 'publicKey', {
  get: function () {
    return this._publicKey
  }
})

Object.defineProperty(keystore.prototype, 'hdKey', {
  get: function () {
    return this._hdKey
  },
  set: function (hdKey) {
    this._hdKey = hdKey
  }
})

keystore.prototype.getAddress = function () {
  return ethUtil.publicToAddress(this._publicKey)
}

keystore.prototype.getHexAddress = function (withPrefix) {
  if (withPrefix) {
    return '0x' + this.getAddress().toString('hex')
  }
  return this.getAddress().toString('hex')
}

keystore.prototype.getV3Filename = function () {
  const date = new Date()

  return [
    'UTC--',
    date.toJSON().replace(/:/g, '-'),
    '--',
    this.getHexAddress()
  ].join('')
}

keystore.prototype.toJson = function (password, opts) {
  return master.toV3String(password, opts)
}

keystore.prototype.getPrivateKey = function () {
  return this._privateKey
}

keystore.prototype.getHexPrivateKey = function () {
  return this._privateKey.toString('hex')
}

keystore.prototype.getPublicKey = function () {
  return this._publicKey
}

keystore.prototype.getHexPublicKey = function () {
  return this._publicKey.toString('hex')
}

keystore.prototype.toV3String = function (password, options, callback) {
  this.toV3(password, options, function (err, v3) {
    if (err) {
      callback(err, null)
      return
    }
    callback(null, JSON.stringify(v3))
  })
}

// see https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition/b66dfbe3e84287f6fa61c079007255270cd20c14
// 通过用户传入的password对私钥进行加密，并生成keystore文件
keystore.prototype.toV3 = function (password, options, callback) {
  try {
    // 先检查私钥是否生成
    if (!this._privateKey) {
      throw new Error('Please generate wallet with private key.')
    }

    // 选项默认为空
    options = options || {}

    // 用以加密以太坊私钥的强对称加密算法默认：aes-128-ctr
    const cipherAlgorithm = options.cipher || 'aes-128-ctr'
    const salt = options.salt || crypto.randomBytes(32) // 盐值
    // aes-128-ctr 加密所用到的初始化向量
    const iv = options.iv || crypto.randomBytes(16)
    const id = uuid.v4({ random: options.uuid || crypto.randomBytes(16) }) // id
    const kdf = options.kdf || 'scrypt' // 指派密钥派生函数，默认scrypt
    const kdfparams = {
      // kdf 密钥生成时所需要的参数
      dklen: options.dklen || 32,
      salt: salt.toString('hex')
    }
    const cb = function (derivedKey) {
      // 利用kdf生成完加密密钥之后调用该函数进一步利用加密密钥生成ciphertext
      derivedKey = new Buffer(derivedKey)

      let cipher = crypto.createCipheriv(cipherAlgorithm, derivedKey.slice(0, 16), iv)

      if (!cipher) {
        callback(new Error('Unsupported cipher algorithm.'), null)
        return
      }

      // 利用kdf密钥生成函数生成的加密密钥对私钥加密得到私钥加密密文 ==>ciphertext
      const ciphertext = Buffer.concat([ cipher.update(this.privateKey), cipher.final() ])
      // 计算校验值 mac
      const mac = ethUtil.keccak(Buffer.concat([ derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex') ]))

      // 拼接全部生成完毕的数据(keystore)并返回
      const v3 = {
        version: 3,
        id: id,
        address: this.getHexAddress(),
        crypto: {
          ciphertext: ciphertext.toString('hex'),
          cipherparams: {
            iv: iv.toString('hex')
          },
          cipher: cipherAlgorithm,
          kdf: kdf,
          kdfparams: kdfparams,
          mac: mac.toString('hex')
        }
      }

      callback(null, v3)
    }.bind(this)

    if (kdf === 'pbkdf2') {
      kdfparams.c = options.c || 262144
      kdfparams.prf = 'hmac-sha256'
      crypto.pbkdf2(new Buffer(password), salt, kdfparams.c, kdfparams.dklen, 'sha256', function (err, derivedKey) {
        if (err) {
          callback(err, null)
          return
        }
        cb(derivedKey)
      })
    } else if (kdf === 'scrypt') {
      // const saltUse = util.bufferToArray(salt)

      kdfparams.n = options.n || 262144
      kdfparams.r = options.r || 8
      kdfparams.p = options.p || 1

      scrypt(password, salt, {N: kdfparams.n, r: kdfparams.r, p: kdfparams.p, dklen: kdfparams.dklen, encoding: 'binary'}, cb)
    } else {
      throw new Error('Unsupported key derivation function.')
    }
  } catch (err) {
    callback(err, null)
  }
}

module.exports = exports = keystore
