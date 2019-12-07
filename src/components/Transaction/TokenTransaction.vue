<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="box">
      <h3 class="title">发送交易</h3>
      <el-form-item label="Contract：" prop="contractAddress">
        <el-input type="text" placeholder="合约账户地址" v-model="form.contractAddress" :disabled="disabledContractAddress" @blur.prevent="initializeContract()" />
      </el-form-item>
      <el-form-item v-show="form.symbol" label="Symbol：" prop="symbol" >
        <el-input type="text" placeholder="Symbol" v-model="form.symbol" :disabled="true"/>
      </el-form-item>
      <el-form-item v-show="form.decimals" label="Decimals：" prop="decimals" >
        <el-input type="text" placeholder="Decimals" v-model="form.decimals" :disabled="true"/>
      </el-form-item>
      <el-form-item v-show="form.balance" label="Balance：" prop="balance" >
        <el-input type="text" placeholder="Balance" v-model="form.balance" :disabled="true"/>
      </el-form-item>
      <el-form-item label="To：" prop="to">
        <el-input type="text" placeholder="转账地址" v-model="form.to" />
      </el-form-item>
      <el-form-item label="Value：" prop="value">
        <el-input type="text" placeholder="转账金额" v-model="form.value" />
      </el-form-item>
      <el-form-item>
        <el-button type="danger" v-on:click="signTransaction('form')">发 送</el-button>
        <el-button v-on:click="jump('personal',wallet)">返 回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import myWallet from '@/lib/wallet/index'

export default {
  name: 'TokenTransaction',
  data () {
    return {
      disabledContractAddress: false,
      contract: {},
      wallet: this.$route.params,
      activeWallet: {},
      web3: {},
      signedTransaction: '',
      form: {
        gasPrice: '',
        gasLimit: 41000,
        nonce: '',
        value: '',
        to: '',
        contractAddress: '',
        symbol: '',
        decimals: '',
        balance: 0
      },
      rules: {
        value: [
          {required: true, message: '转账金额不可为空', trigger: 'blur'}
        ],
        to: [
          {required: true, message: '转账地址不可为空', trigger: 'blur'},
          { pattern: /0x[a-zA-Z0-9]{40}/, message: '无效的地址', trigger: 'blur' }
        ],
        contractAddress: [
          {required: true, message: '合约地址不可为空', trigger: 'blur'},
          { pattern: /0x[a-zA-Z0-9]{40}/, message: '无效的地址', trigger: 'blur' }
        ]
      }
    }
  },
  created: function () {
    this.activeWallet = myWallet.wallet.connect(this.wallet)
    this.web3 = myWallet.web3.constructor()
  },
  methods: {
    // 初始化
    async initializeContract () {
      const {contractAddress} = this.form
      const pattern = /0x[a-zA-Z0-9]{40}/
      if (pattern.test(contractAddress)) {
        this.disabledContractAddress = true
        this.form.gasPrice = await this.getGasPrice()
        this.newContract()
        this.getContractBalance()
      }
    },
    // 创建合约
    async newContract () {
      this.contract = myWallet.wallet.newContract('0x4dd42d34242be4d5009ccae04f5617e554a2d364')
      this.form.decimals = await this.contract.decimals()
      this.form.symbol = await this.contract.symbol()
    },
    // 获取余额
    async getContractBalance () {
      myWallet.wallet.getContractBalance(this.contract, this.activeWallet.address, (err, balance) => {
        if (err) {
          alert(err.message)
          return
        }
        this.form.balance = balance
      })
    },
    // 签名交易
    signTransaction (formName) {
      const {to, value, decimals, balance, gasLimit} = this.form
      this.$refs[formName].validate(async function (valid) {
        if (valid) {
          if ((value - balance) / `1e+${decimals}` > 0) {
            return alert('账户余额不足以本次交易！')
          }
          const gasPrice = await this.activeWallet.provider.getGasPrice()
          let contractWithSigner = this.contract.connect(this.activeWallet)
          contractWithSigner.transfer(to, value, {
            gasPrice: gasPrice,
            gasLimit: gasLimit
          }).then(function (tx) {
            console.log(tx)
            alert('交易成功!')
            this.jump('personal', this.wallet)
          }.bind(this))
        }
      }.bind(this))
    },
    // 发送交易
    sendTransaction (signedTransaction) {
      this.web3.eth.sendSignedTransaction(signedTransaction, function (err, txId) {
        if (err) {
          console.warn(err.message)
          return
        }
        this.jump('personal', this.wallet)
      }.bind(this))
    },
    // 获取网络中的GasPrice
    async getGasPrice () {
      const gasPrice = await this.web3.eth.getGasPrice()
      return gasPrice
    },
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
