import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from 'axios'

Vue.config.productionTip = false

Vue.prototype.$ajax = axios.create({
  baseURL: 'https://sas.aauth.link/'
})
Vue.prototype.$swal = window.Swal
Vue.prototype.$swal.catch = err => {
  window.Swal.fire('错误', err.response ? err.response.data : '网络错误', 'error')
}


new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
