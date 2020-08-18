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
    component: () => import ('../views/Password.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
