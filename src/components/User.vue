<template>
  <div class="user">
    <v-row style="width: 100%; max-width: 500px;">
      <v-text-field label="用户名" type="text" outlined v-model="id" :error-messages="error" hint="请输入需查询的用户名" @keyup.enter="search"></v-text-field>
      <v-btn color="primary" @click="search" fab :disabled="!id" :loading="searchLoading" style="margin-left: 20px;">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-row>
    <v-card v-if="user" style="padding: 20px 30px;">
      <v-card-title>用户信息</v-card-title>
      <v-text-field outlined style="width: 300px;" type="text" v-model="user.name" disabled label="姓名"></v-text-field>
      <v-text-field outlined style="width: 300px;" type="text" v-model="user.group" label="用户组" disabled></v-text-field>
      <v-text-field outlined style="width: 300px;" type="text" v-model="user.role" :disabled="submitLoading" label="角色"></v-text-field>
      <v-text-field outlined style="width: 300px;" type="text" v-model="user.phone" :disabled="submitLoading" label="手机"></v-text-field>
      <v-checkbox v-model="reset" :disabled="submitLoading" label="重置密码为用户名"></v-checkbox>
      <p style="font-size: 0.8rem"  :style="style" v-if="tip">{{ tip }}</p>
      <v-row style="max-width: 400px;">
        <v-col>
          <v-btn color="secondary" @click="submit" :loading="submitLoading">修改用户信息</v-btn>
        </v-col>
        <v-col>
          <v-btn color="error" @click="remove" :loading="submitLoading">删除用户</v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import Hashes from 'jshashes'
const SS = window.sessionStorage

function hash1 (msg) {
  return new Hashes.MD5().b64(msg).substr(7, 10)
}

export default {
  name: 'User',
  data: () => ({
    id: '',
    error: '',
    reset: false,
    user: null,
    searchLoading: false,
    submitLoading: false,
    tip: ' ',
    style: ''
  }),
  watch: {
    id () {
      this.error = ''
      this.user = null
    }
  },
  methods: {
    async search() {
      this.id = this.id.toUpperCase()
      this.searchLoading = true
      await this.$ajax
        .get('/user/admin?id=' + encodeURIComponent(hash1(this.id)), { headers: { 'token': SS.token } })
        .then(resp => { this.user = resp.data })
        .catch(err => { this.error = err.response.data })
      this.searchLoading = false
      this.$forceUpdate()
    },
    async submit() {
      this.tip = '正在更新用户数据...'
      this.submitLoading = true
      let body = {
        name: this.user.name,
        role: this.user.role,
        phone: this.user.phone
      }
      if (this.reset) body['password'] = "1"
      try {
        await this.$ajax({
          method: 'PUT',
          url: '/user/admin?id=' + encodeURIComponent(hash1(this.id)),
          headers: { 'token': SS.token },
          body: body
        })
        this.tip = '更新用户信息成功!'
        this.style = 'color: green;'
      } catch (err) {
        this.tip = '更新用户信息失败: ' + err.response.data
        this.style = 'color: red;'
      }
      this.submitLoading = false
    },
    async remove () {
      this.tip = '正在删除用户'
      this.submitLoading = true
      await this.$ajax
        .delete('/user/admin?id=' + encodeURIComponent(hash1(this.id)), { headers: { 'token': SS.token } })
        .then(() => {
          this.tip = '删除用户成功!'
          this.style = 'color: green;'
        })
        .catch(err => {
          this.tip = '删除用户失败: ' + err.response.data
          this.style = 'color: red;'
        })
      this.submitLoading = false
    }
  }
}
</script>

<style scoped>
  div.user {
    padding: 30px;
  }
</style>
