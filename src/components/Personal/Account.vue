<template>
  <div>
    <el-form v-show="!transactionModel" label-width="80px" class="box">
      <h3 class="title">账户列表</h3>
      <el-form-item label="账号：">
        <el-input type="text" :placeholder="wallet.address" disabled />
      </el-form-item>
      <el-form-item label="ETH余额：">
        <el-input type="text" :placeholder="balance" disabled />
      </el-form-item>
      <el-form-item label="ETH余额：">
        <el-input type="text" :placeholder="balance" disabled />
      </el-form-item>
      <el-form-item label="Nonce：">
        <el-input type="text" :placeholder="form.nonce" disabled />
      </el-form-item>
      <el-form-item>
        <el-button type="success" v-on:click="refreshData()">刷 新</el-button>
        <el-button type="danger" v-on:click="isShow(true)">发送普通交易</el-button>
        <el-button type="danger" v-on:click="isShow(true)">发送Token交易</el-button>
        <el-button v-on:click="jump('/')">退 出</el-button>
      </el-form-item>
    </el-form>
    <el-form v-show="transactionModel" ref="form" :model="form" :rules="rules" label-width="80px" class="box">
      <h3 class="title">发送交易</h3>
      <el-form-item label="Nonce：" prop="nonce">
        <el-input type="text" placeholder="交易序列号" v-model="form.nonce" />
      </el-form-item>
      <el-form-item label="GasPrice：" prop="gasPrice">
        <el-input type="text" placeholder="gas的费用" v-model="form.gasPrice" />
      </el-form-item>
      <el-form-item label="GasLimit：" prop="gasLimit">
        <el-input type="text" placeholder="消耗gas的数量" v-model="form.gasLimit" />
      </el-form-item>
      <el-form-item label="To：" prop="to">
        <el-input type="text" placeholder="转账地址" v-model="form.to" />
      </el-form-item>
      <el-form-item label="Value：" prop="value">
        <el-input type="text" placeholder="转账金额" v-model="form.value" />
      </el-form-item>
      <el-form-item>
        <el-button type="danger" v-on:click="signTransaction('form')">发 送</el-button>
        <el-button v-on:click="isShow(false)">返 回</el-button>
      </el-form-item>
    </el-form>
    <el-form v-show="tokenTransactionModel" ref="form" :model="form" :rules="rules" label-width="80px" class="box">
      <h3 class="title">发送交易</h3>
      <el-form-item label="Nonce：" prop="nonce">
        <el-input type="text" placeholder="交易序列号" v-model="form.nonce" />
      </el-form-item>
      <el-form-item label="GasPrice：" prop="gasPrice">
        <el-input type="text" placeholder="gas的费用" v-model="form.gasPrice" />
      </el-form-item>
      <el-form-item label="GasLimit：" prop="gasLimit">
        <el-input type="text" placeholder="消耗gas的数量" v-model="form.gasLimit" />
      </el-form-item>
      <el-form-item label="To：" prop="to">
        <el-input type="text" placeholder="转账地址" v-model="form.to" />
      </el-form-item>
      <el-form-item label="Value：" prop="value">
        <el-input type="text" placeholder="转账金额" v-model="form.value" />
      </el-form-item>
      <el-form-item>
        <el-button type="danger" v-on:click="signTransaction('form')">发 送</el-button>
        <el-button v-on:click="isShow(false)">返 回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import whilst from 'async/whilst'
import myWallet from '@/lib/wallet/index'

export default {
  name: 'Personal',
  data () {
    return {
      transactionModel: false,
      tokenTransactionModel: false,
      balance: 0,
      wallet: this.$route.params.wallet,
      activeWallet: {},
      web3: {},
      signedTransaction: '',
      form: {
        gasPrice: '10',
        gasLimit: '21000',
        nonce: '',
        value: '',
        to: ''
      },
      rules: {
        gasPrice: [
          {required: true, message: 'GasPrice不可为空', trigger: 'blur'}
        ],
        gasLimit: [
          {required: true, message: 'GasLimit不可为空', trigger: 'blur'}
        ],
        nonce: [
          {required: true, message: '交易序列号不可为空', trigger: 'blur'}
        ],
        value: [
          {required: true, message: '转账金额不可为空', trigger: 'blur'}
        ],
        to: [
          {required: true, message: '转账地址不可为空', trigger: 'blur'},
          { pattern: /0x[a-zA-Z0-9]{40}/, message: '无效的地址', trigger: 'blur' }
        ]
      }
    }
  },
  created: function () {
    this.activeWallet = myWallet.wallet.connect(this.wallet)
    this.web3 = myWallet.web3.constructor()
    this.refreshData()
  },
  methods: {
    refreshData () {
      this.getBalance()
      this.getTransactionCount()
    },
    // 获取账户余额
    getBalance () {
      myWallet.wallet.getBalance(this.activeWallet, (err, balance) => {
        if (err) {
          alert(err.message())
          return
        }
        this.balance = balance
      })
    },
    getTransactionCount () {
      myWallet.wallet.getTransactionCount(this.activeWallet, (err, transactionCount) => {
        if (err) {
          alert(err.message())
          return
        }
        this.form.nonce = transactionCount
      })
    },
    // 签名交易
    signTransaction (formName) {
      const {to, nonce, gasPrice, gasLimit, value} = this.form
      const {utils} = this.web3
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const txParams = {
            to: to,
            chainId: 3,
            value: utils.toHex(utils.toWei(value, 'ether')),
            nonce: utils.toHex(nonce),
            gasPrice: utils.toHex(utils.toWei(gasPrice, 'gwei')),
            gasLimit: utils.toHex(gasLimit)
          }
          let valueTx = myWallet.tx.valueTx(txParams)
          const privateKey = Buffer.from(
            this.wallet.privateKey.slice(2),
            'hex'
          )
          valueTx.sign(privateKey)
          const signedTransaction = '0x' + valueTx.serialize().toString('hex')
          this.sendTransaction(signedTransaction)
        }
      })
    },
    // 发送交易
    sendTransaction (signedTransaction) {
      this.web3.eth.sendSignedTransaction(signedTransaction, function (err, txId) {
        if (err) {
          console.warn(err.message)
          return
        }
        this.isShow(false)
        this.refreshData()
        this.confirmedTransaction(txId, function (err, tx) {
          if (err) {
            console.warn(err.message)
            return
          }
          console.log('Transaction confirmed', tx)
        })
      }.bind(this))
    },
    // 确认交易
    async confirmedTransaction (txId, callback) {
      const {eth} = this.web3
      let confirmed = false
      let limit = 5
      let blockNumber = await this.getBlockNumber()
      return whilst(
        function () {
          return confirmed === false
        },
        function (callback) {
          eth.getTransaction(txId, function (err, tx) {
            if (err) {
              window.setTimeout(function () {
                callback(err, null)
              }, 1000)
            }
            if (tx && tx.blockNumber !== null) {
              if (blockNumber >= (tx.blockNumber + limit)) {
                confirmed = true
                window.setTimeout(function () {
                  callback(null, tx)
                }, 1000)
                return
              }
            }
            window.setTimeout(function () {
              callback(null, null)
            }, 1000)
          })
        },
        function (err, tx) {
          if (err) {
            return callback(err, null)
          }
          if (tx && confirmed) {
            return callback(null, tx)
          }
        }
      )
    },
    // 获取网络区块数
    getBlockNumber () {
      const {eth} = this.web3
      return eth.getBlockNumber().then(block => {
        return block
      }).catch(err => {
        console.warn(err.message)
      })
    },
    isShow (value) {
      this.transactionModel = value
    },
    jump (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
  .box {
    border: 1px solid #DCDFE6;
    width: 700px;
    margin: 180px auto;
    padding: 35px 35px 15px 35px;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    box-shadow: 0 0 25px #909399;
  }
  .title {
    text-align: center;
    margin: 0 auto 40px auto;
    color: #303133;
  }
</style>
