import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Generate from '@/components/Generate/Generate'
import ImportWallet from '@/components/ImportWallet/ImportWallet'
import Personal from '@/components/Personal/Personal'
import Transaction from '@/components/Transaction/Transaction'
import TokenTransaction from '@/components/Transaction/TokenTransaction'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      // 生成wallet账户
      path: '/generate',
      name: 'generate',
      component: Generate
    },
    {
      // 导入wallet账户
      path: '/import_wallet',
      name: 'importWallet',
      component: ImportWallet
    },
    {
      // 账户中心
      path: '/personal',
      name: 'personal',
      component: Personal
    },
    {
      // 普通交易
      path: '/transaction',
      name: 'transaction',
      component: Transaction
    },
    {
      // token交易
      path: '/token_transaction',
      name: 'tokenTransaction',
      component: TokenTransaction
    }
  ]
})
