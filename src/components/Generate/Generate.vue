<template>
  <div >
    <!--创建账户密码-->
    <el-form v-show="viewType===1" ref="createAccountForm" :model="createAccountForm" :rules="rules" label-width="80px" class="login-box">
      <h3 class="login-title">创建新账户</h3>
      <el-form-item label="新密码" prop="password">
        <el-input type="password" placeholder="请输入密码" v-model="createAccountForm.password"/>
      </el-form-item>
      <el-form-item label="确认密码" prop="repeatPassword">
        <el-input type="password" placeholder="请再输入密码" v-model="createAccountForm.repeatPassword"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-on:click="generatePassword('createAccountForm')">创 建</el-button>
        <el-button v-on:click="jump('main')">取 消</el-button>
      </el-form-item>
    </el-form>

    <!--生成助记词生成账户地址-->
    <el-form v-show="viewType===2" ref="generateMnemonicForm" :model="generateMnemonicForm" label-width="80px" class="login-box">
      <h3 class="login-title">生成助记词</h3>
      <el-form-item label="助记词" prop="randomSeed">
        <el-input type="text" placeholder="该项留空则由系统自动生成" v-model="generateMnemonicForm.randomSeed"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-on:click="generateMnemonic()" :disabled="disabled">生 成</el-button>
        <el-button v-on:click="jump('main')">取 消</el-button>
      </el-form-item>
    </el-form>

    <!--显示生成的账户的信息-->
    <div class="info-box" v-show="viewType===3">
      <h3 class="login-title">账户信息</h3>
      <el-row>
        <el-col :span="24">address：{{address}}</el-col>
        <el-col :span="24">privateKey：{{privateKey}}</el-col>
        <el-col :span="24">randomSeed：{{generateMnemonicForm.randomSeed}}</el-col>
        <el-col :span="24" style="text-align: center;padding-top: 10px">
          <el-button type="primary" v-on:click="jump('personal', wallet)">进入钱包</el-button>
          <el-button type="success" v-on:click="jump('main')">返回首页</el-button>
          <el-button type="danger" >
            <a v-bind:download="fileName" v-bind:href="keystoreJsonDataLink" style="text-decoration:none;">下载</a>
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import myWallet from '@/lib/wallet/index'

export default {
  name: 'Generate',
  data () {
    return {
      wallet: {},
      disabled: false,
      keystore: {},
      hdPathString: 'm/44\'/60\'/0\'/0',
      address: '',
      privateKey: '',
      keystoreJson: '',
      keystoreJsonDataLink: '',
      fileName: '',
      viewType: 1,
      createAccountForm: {
        repeatPassword: '',
        password: ''
      },
      generateMnemonicForm: {
        randomSeed: ''
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        repeatPassword: [
          {required: true, message: '确认密码不可为空', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '新密码不可为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 生成账户地址
    generateAddress (password) {
      if (typeof this.keystore.getHexAddress !== 'function') {
        this.disabled = false
        return false
      }

      this.privateKey = this.keystore.getHexPrivateKey()
      this.address = this.keystore.getHexAddress(true)
      this.keystore.toV3String(password, {}, (err, v3Json) => {
        if (err) {
          this.disabled = false
          console.warn(err.message)
          return
        }
        this.keystoreJson = v3Json
        this.keystoreJsonDataLink = encodeURI('data:application/json;charset=utf-8,' + this.keystoreJson)
        this.fileName = `${this.keystore.getV3Filename()}.json`
        myWallet.wallet.fromEncryptedJson(v3Json, password, (err, wallet) => {
          if (err) {
            alert(err.message())
            return
          }
          this.wallet = wallet
          this.viewType = 3
          this.disabled = false
        })
      })
    },
    // 生成助记词
    generateMnemonic () {
      let {randomSeed} = this.generateMnemonicForm
      const {password} = this.createAccountForm
      this.disabled = true
      if (randomSeed) {
        // 校验用户输入的助记词
        if (randomSeed.split(' ').length !== 12 || !myWallet.util.validSeed(randomSeed)) {
          alert('助记词不正确')
          return
        }
      }
      myWallet.wallet.generate(randomSeed, this.hdPathString, (err, data) => {
        if (err) {
          this.disabled = false
          console.warn(err.message)
          return
        }
        this.keystore = data.keystore
        this.generateMnemonicForm.randomSeed = data.randomSeed
        this.generateAddress(password)
      })
    },
    // 生成账户密码
    generatePassword (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const {password, repeatPassword} = this.createAccountForm
          if (password === repeatPassword) {
            this.viewType = 2
          } else {
            alert('两次密码不一致')
          }
        }
      })
    },
    jump (path, params) {
      this.$router.push({name: path, params})
    }
  }
}
</script>

<style scoped>
  .login-box {
    border: 1px solid #DCDFE6;
    width: 350px;
    margin: 180px auto;
    padding: 35px 35px 15px 35px;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    box-shadow: 0 0 25px #909399;
  }

  .login-title {
    text-align: center;
    margin: 0 auto 40px auto;
    color: #303133;
  }

  .info-box {
    border: 1px solid #DCDFE6;
    width: 700px;
    margin: 180px auto;
    padding: 35px 35px 15px 35px;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    box-shadow: 0 0 25px #909399;
  }

  .el-col {
    text-align: left;
    padding: 5px;
  }

  a:link{
    color:aliceblue;
  }

  a:visited{
    color:aliceblue;
  }
</style>
