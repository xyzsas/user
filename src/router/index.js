import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/password',
    name: 'Password',
    component: () => import (/* webpackChunkName: "password" */ '../views/Password.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import (/* webpackChunkName: "admin" */ '../views/Admin.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
