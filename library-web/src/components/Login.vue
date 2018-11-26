<template>
  <el-card class="box-card">
  <div class="loginFrame">
    <el-form :model="loginForm" status-icon :rules="rule1" ref="loginForm" label-width="100px">
      <el-form-item label="用户名" prop="userId">
        <el-input v-model="loginForm.userId" autocomplete="off" placeholder="四位员工号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="loginForm.password" autocomplete="off" placeholder="初始密码为四位员工号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login" style="width:100%">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
  </el-card>
</template>
<script>
  import axios from 'axios';

  export default {
    data() {
      var validatePassword = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          callback();
        }
      };
      var validateUserId = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } else {
          callback();
        }
      }
      return {
        loginForm: {
          userId: '',
          password: '',
        },
        rule1: {
          userId: [
            {validator: validateUserId, trigger: 'blur'}
          ],
          password: [
            {validator: validatePassword, trigger: 'blur'}
          ],
        }
      };
    },
    methods: {
      login: function () {
        axios({
          method: 'post',
          url: '/cross/library/userLogin',
          data: {
            userId: this.loginForm.userId,
            password: this.loginForm.password
          },
        }).then(function (response) {
          var data = response.data;
          if (data.state === 0) {
            sessionStorage.setItem("userName", data.userInfo.userName);
            sessionStorage.setItem("userId", data.userInfo.userId);
            sessionStorage.setItem("department", data.userInfo.department);
            sessionStorage.setItem("team", data.userInfo.team);
            sessionStorage.setItem("role", data.userInfo.role);
            this.$router.replace('/library/index');
            return;
          } else if (data.state === -3) {
            alert("用户名或密码错误");
            return;
          }
        }.bind(this)).catch(function (error) {
          alert("登录错误！");
        })
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    }
  }
</script>
<style>
  .loginFrame {
    width: 100%;
  }
  .box-card{
    width:35%;
    margin:10% auto;
    padding:2% 4% 0 0;
  }
</style>
