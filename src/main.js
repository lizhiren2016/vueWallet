// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import 'element-ui/lib/theme-chalk/index.css'
import Axios from 'axios'
import Localstorage from './lib/localstorage/index'

Vue.config.productionTip = false
Vue.prototype.$axios = Axios
Vue.prototype.$localstorage = new Localstorage()

// 安装路由
Vue.use(VueRouter)

// 安装 ElementUI
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
