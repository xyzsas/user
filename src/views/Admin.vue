<template>
  <div class="admin">
    <v-tabs v-model="tab">
      <v-tab key="overview">概览</v-tab>
      <v-tab key="add">添加用户</v-tab>
      <v-tab key="user">查询用户</v-tab>
      <v-tab key="group">用户组</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item key="overview">
        <overview></overview>
      </v-tab-item>
      <v-tab-item key="add">
        <add></add>
      </v-tab-item>
      <v-tab-item key="user">
        <user :uid="uid" :random="random"></user>
      </v-tab-item>
      <v-tab-item key="group">
        <group @user="user"></group>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
const SS = window.sessionStorage
import Overview from '@/components/Overview.vue'
import Add from '@/components/Add.vue'
import User from '@/components/User.vue'
import Group from '@/components/Group.vue'

export default {
  name: 'Admin',
  data: () => ({
    tab: 0,
    uid: '',
    random: 0
  }),
  components: {
    Overview, Add, User, Group
  },
  mounted () {
    if (SS.role !== 'ADMIN') window.location.href = '/index.html'
  },
  methods: {
    user (uid) {
      console.log('emit')
      this.tab = 2
      this.uid = uid
      this.random = Math.random()
    }
  }
}
</script>

<style scoped>
  div.admin {
    color: #555;
    width: 100%;
    min-height: 100vh;
  }
</style>
