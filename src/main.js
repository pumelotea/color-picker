import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import HttpApi from '@/apis/http.api'
import '@/configs/router.config'
import iView from 'iview';
import 'iview/dist/styles/iview.css';


Vue.use(iView);
Vue.use(HttpApi)

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
