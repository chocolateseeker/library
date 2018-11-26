import Vue from 'vue'
import Router from 'vue-router'
import router from '../router'
import Login from '../components/Login.vue'
import Index from '../components/Index.vue'
import axios from 'axios';

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      name: 'Login',
      path: '/library',
      component: Login
    },
    {
      name: "Index",
      path: '/library/index',
      component: Index
    },
  ]
});
router.beforeEach((to, from, next) => {
  if (to.path == "/library") {
    next();
    return;
  }
  if (sessionStorage.getItem("userName") == null) {
    axios({
      url:"/cross/library/logout",
      method:"post",
    }).then(function(){
      next();
      router.replace("/library");
      return;
    }.bind(this)).catch(function (error) {
      next();
      router.replace("/library");
      return;
    });
  }
  axios({
    url: "/cross/library/loginConfirm",
    method: "post",
    data: {},
  }).then(function (response) {
    if (response.data != 0) {
      next();
      router.replace("/library");
    }
  }.bind(this)).catch(function (error) {
    alert("认证异常");
  })
  next();
})
