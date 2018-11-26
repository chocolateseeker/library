import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios';
Vue.prototype.axios = axios;
axios.defaults.withCredentials = true

//QS是axios库中带的，不需要我们再npm安装一个

Vue.config.productionTip = false
// 注册element-ui
Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
