import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      component: () => import( /* webpackChunkName: "login" */ './components/Login.vue')
    },
    {
      path: '/home',
      component: () => import( /* webpackChunkName: "user" */ './components/user/Home.vue'),
      redirect: '/welcome',
      children: [{
          path: '/welcome',
          component: () => import( /* webpackChunkName: "user" */ './components/user/Welcome.vue')
        },
        {
          path: '/users',
          component: () => import( /* webpackChunkName: "user" */ './components/user/users.vue')
        },
        {
          path: '/rights',
          component: () => import( /* webpackChunkName: "power" */ './components/power/Rights.vue')
        },
        {
          path: '/roles',
          component: () => import( /* webpackChunkName: "power" */ './components/power/roles.vue')
        },
        {
          path: '/params',
          component: () => import( /* webpackChunkName: "goods" */ './components/goods/params.vue')
        },
        {
          path: '/categories',
          component: () => import( /* webpackChunkName: "goods" */ './components/goods/categories.vue')
        },
        {
          path: '/goods',
          component: () => import( /* webpackChunkName: "goods" */ './components/goods/list.vue')
        },
        {
          path: '/goods/add',
          component: () => import( /* webpackChunkName: "goods" */ './components/goods/Add.vue')
        },
        {
          path: '/goods/edit',
          component: () => import( /* webpackChunkName: "goods" */ './components/goods/edit.vue')
        },
        {
          path: '/orders',
          component: () => import( /* webpackChunkName: "orders" */ './components/orders/orders.vue')
        },
        {
          path: '/reports',
          component: () => import( /* webpackChunkName: "reports" */ './components/report/Report.vue')
        }
      ]
    },
  ]
})