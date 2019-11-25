<template>
  <div class="box">
    <h3 class="title">欢迎使用钱包</h3>
    <el-row>
      <el-col :span="24">
        <el-button type="primary" v-on:click="jump('generate')">创建新的账户</el-button>
      </el-col>
      <el-col :span="24">
        <el-button type="warning" v-on:click="jump('import-wallet')">导入已有账户</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  methods: {
    jump (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
  .box {
    border: 1px solid #DCDFE6;
    width: 350px;
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

  .el-col {
    text-align: center;padding-top: 10px
  }
</style>
