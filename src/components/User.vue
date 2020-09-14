<template>
  <div class="user">
    <v-row style="width: 95%; max-width: 500px; margin-left: 3%;">
      <v-text-field label="用户名" type="text" outlined v-model="identifier" :error-messages="error" hint="请输入需查询的用户名" @keyup.enter="search"></v-text-field>
      <v-btn color="primary" @click="search" fab :disabled="!identifier" :loading="searchLoading" style="margin-left: 20px;">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-row>

    <v-card v-if="user" style="padding: 20px 30px;">
      <v-card-title>用户信息</v-card-title>
      <v-card-subtitle>{{ id }}</v-card-subtitle>
      <v-text-field outlined style="width: 300px;" type="text" v-model="user.name" :disabled="submitLoading" label="姓名"></v-text-field>
      <v-text-field outlined style="width: 300px;" type="text" v-model="user.group" label="用户组" :disabled="submitLoading"></v-text-field>
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
    identifier: '',
    error: '',
    reset: false,
    user: null,
    searchLoading: false,
    submitLoading: false,
    tip: ' ',
    style: '',
    id: ''
  }),
  props: ['uid', 'random'],
  mounted () {
    if (this.uid) {
      this.id = this.uid
      this.search()
    }
  },
  watch: {
    identifier () {
      this.error = ''
    },
    random () {
      this.identifier = ''
      this.id = this.uid
      this.user = null
      this.search()
    }
  },
  methods: {
    async search() {
      this.identifier = this.identifier.toUpperCase()
      if (this.identifier) this.id = hash1(this.identifier)
      this.searchLoading = true
      await this.$ajax
        .get('/admin/user?id=' + encodeURIComponent(this.id), { headers: { 'token': SS.token } })
        .then(resp => {
          this.user = resp.data
          if (!this.identifier) this.identifier = this.user.identifier
        })
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
        phone: this.user.phone,
        group: this.user.group
      }
      if (this.reset) body['password'] = "1"
      try {
        await this.$ajax.put('/admin/user?id=' + encodeURIComponent(this.id), body, {
            headers: { 'token': SS.token }
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
        .delete('/admin/user?id=' + encodeURIComponent(this.id), { headers: { 'token': SS.token } })
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
    padding: 30px 3%;
  }
</style>
