<template>
  <div>
    <el-form label-width="80px" class="box">
      <h3 class="title">钱包详情</h3>
      <el-form-item label="账号：">
        <el-input type="text" :placeholder="wallet.address" disabled />
      </el-form-item>
      <el-form-item label="余额：">
        <el-input type="text" :placeholder="balance" disabled />
      </el-form-item>
      <el-form-item label="Nonce：">
        <el-input type="text" :placeholder="form.nonce" disabled />
      </el-form-item>
      <el-form-item>
        <el-button type="success" v-on:click="refreshData()">刷 新</el-button>
        <el-button type="danger" v-on:click="jump('transaction',wallet)">发送交易</el-button>
        <el-button type="danger" v-on:click="jump('tokenTransaction',wallet)">发送Token交易</el-button>
        <el-button v-on:click="jump('main')">退 出</el-button>
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
      personalModel: true,
      ethTransactionModel: false,
      tokenTransactionModel: false,
      balance: 0,
      wallet: this.$route.params,
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
          alert(err.message)
          return
        }
        this.balance = balance
      })
    },
    getTransactionCount () {
      myWallet.wallet.getTransactionCount(this.activeWallet, (err, transactionCount) => {
        if (err) {
          alert(err.message)
          return
        }
        this.form.nonce = transactionCount
      })
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
    // 路由跳转
    jump (path, params) {
      this.$router.push({name: path, params})
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
