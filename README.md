# vueWallet

> 本项目主要用于个人学习开发以太坊去中心化钱包，基于vue、ethers.js、web3等开发.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## 实现的功能

- 账号管理（主要是私钥的管理）
   - 根据随机助记词创建钱包
   - 钱包的导入导出（根据自定义助记词导入钱包、根据KeyStore导入钱包）
- 账号信息展示：如以太币余额、Token（代币）余额。
- 转账功能：发送以太币及发送 Token（代币）

## 特色
- 该钱包的特点就是简单，只具备一个数字钱包最基本的功能:密钥管理(私钥的 生成 + 导入 + 备份)和交易。密钥生成主要使用原生的bip-39库生成助记词(可自定义助记词或随机助记词)然后进一步生成私钥。
- 因为使用的是原生的库进行私钥生成，私钥生成过程会比较接触底层，备份使用Keystore进行保存。

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
