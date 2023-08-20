import Vue from 'vue'
import App from './App'
// 导入网络请求的包：按需导入 $http 对象
import {
  $http
} from '@escook/request-miniprogram'
// 导入store 的实例对象
import store from '@/store/store.js'


// 在 uni-app 项目中，可以把 $http 挂载到 uni 顶级对象之上，方便全局调用
uni.$http = $http
//封装的展示消息提示弹框的方法
uni.$showMsg = function(title = '数据请求失败！', duration = 1500) {
  uni.showToast({
    title,
    duration,
    icon: 'none'
  })
}
//请求的根路径
$http.baseUrl = 'https://www.uinav.com'

// 请求拦截器：请求开始之前做一些事情
$http.beforeRequest = function(options) {
  uni.showLoading({
    title: '数据加载中...'
  })
  // 判断当前请求的是否为有权限的接口
  if(options.url.indexOf('/my/') !== -1){
    options.header = {
      Authorization:store.state.m_user.token
    }
  }
}
// 响应拦截器：请求完成之后做一些事情
$http.afterRequest = function(options) {
  uni.hideLoading()
}
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App,
  // 将 store 挂载到 Vue 实例上
  store
})
app.$mount()