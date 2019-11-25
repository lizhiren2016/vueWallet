<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="login-box">
    <h3 class="login-title">导入账户</h3>
    <el-form-item label="密码" prop="password">
      <el-input type="password" placeholder="请输入密码" v-model="form.password"/>
    </el-form-item>
    <el-form-item label="Keystore" prop="keystoreJson">
      <div class="columns">
        <div class="column is-third-quarter">
          <div class="control">
            <input id="file-seed" class="input" type="file" v-on:change="readKeystoreJsonFile" placeholder="Keystore JSON">
          </div>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" v-on:click="importWallet('form')" :disabled="disabled">确 定</el-button>
      <el-button v-on:click="jump('main')">取 消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import myWallet from '@/lib/wallet/index'

export default {
  name: 'ImportWallet',
  data () {
    return {
      disabled: false,
      keystore: {},
      address: '',
      privateKey: '',
      fileName: '',
      viewType: 1,
      form: {
        keystoreJson: '',
        password: ''
      },
      generateMnemonicForm: {
        randomSeed: ''
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        keystoreJson: [
          {required: true, message: 'keyStoreJson不可为空', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '密码不可为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 读取上传的keyStore JSON
    readKeystoreJsonFile (e) {
      var files = e.target.files

      if (files.length > 1) {
        alert('请只选择一个文件')
        return
      }
      if (!/(.*)\.json/.test(files[0].name)) {
        alert('请选择有效的keyStore JSON文件')
        return
      }
      var reader = new FileReader()

      reader.onload = function (e) {
        this.form.keystoreJson = e.target.result
      }.bind(this)

      reader.onerror = function (e) {
        alert('Something wrong happened!')
      }

      reader.readAsText(files[0])
    },
    // 导入Wallet
    importWallet (formName) {
      const {keystoreJson, password} = this.form
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.disabled = true
          myWallet.wallet.fromEncryptedJson(keystoreJson, password, (err, wallet) => {
            if (err) {
              this.disabled = false
              alert(err.message)
              return
            }
            this.disabled = false
            this.jump('personal', wallet)
          })
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
    width: 1024px;
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
