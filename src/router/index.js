import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Generate from '@/components/Generate/Generate'
import ImportWallet from '@/components/ImportWallet/ImportWallet'
import Personal from '@/components/Personal/Personal'

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
      path: '/import-wallet',
      name: 'importWallet',
      component: ImportWallet
    },
    {
      // 导入wallet账户
      path: '/personal',
      name: 'personal',
      component: Personal
    }
  ]
})
