import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入elementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入 axios 
import axios from 'axios'
// 导入 vue-table-with-tree-grid  树状表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 把 axios 包挂载到 vue 的原型对象上  
Vue.prototype.$http = axios
// 配置请求的根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 路由拦截器
axios.interceptors.request.use(config => {
  // 为请求头对象，添加Token验证的Authorization字段;
  config.headers.Authorization = window.sessionStorage.getItem('token');
  //最后必须return config;
  return config
})
// 全局时间过滤器
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal);

  const y = dt.getFullYear();

  const m = (dt.getMonth() + 1 + '').padStart(2, '0');

  const d = (dt.getDate() + '').padStart(2, '0');

  const hh = (dt.getHours() + '').padStart(2, '0');

  const mm = (dt.getMinutes() + '').padStart(2, '0');

  const ss = (dt.getSeconds() + '').padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})
Vue.use(ElementUI)
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')