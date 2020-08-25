<template>
  <div class="user">
    <v-row style="width: 450px">
      <v-col><v-text-field ref="id" style="width: 300px;" label="用户ID" type="text" outlined dense v-model="id" :error-messages="error" hint="请输入需查询的用户ID" @keyup.enter="search"></v-text-field></v-col>
      <v-col><v-btn color="primary" @click="search" :loading="loading"><v-icon>mdi-magnify</v-icon></v-btn></v-col>
    </v-row>
    <h2>用户信息</h2>
    <br>
    <v-text-field ref="name" outlined style="width: 300px;" type="text" v-model="update.name" :error-messages="errorMessages" :disabled="disable" label="姓名"></v-text-field>
    <v-text-field ref="group" outlined style="width: 300px;" type="text" v-model="update.group" label="用户组" disabled></v-text-field>
    <v-text-field ref="role" outlined style="width: 300px;" type="text" v-model="update.role" :error-messages="errorMessages" :disabled="disable" label="角色"></v-text-field>
    <v-text-field ref="phone" outlined style="width: 300px;" type="text" v-model="update.phone" :error-messages="errorMessages" :disabled="disable" label="手机"></v-text-field>
    <v-checkbox ref="pwd" v-model="update.pwd" :disabled="disable" label="重置密码"></v-checkbox>
    <p style="font-size: 0.8rem"  :style="style" v-if="tip">{{ tip }}</p>
    <v-btn style="width: 100px" color="primary" @click="submit" :disabled="disable">
      <v-icon>mdi-check</v-icon>
    </v-btn>
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
    update: {
      name: '',
      group: '',
      role: '',
      phone: '',
      pwd: '',
    },
    disable: true,
    errorMessages: '',
    loading: false,
    tip: ' ',
    style: ''
  }),
  watch: {
    id () {
      this.error = ''
    }
  },
  methods: {
    async search() {
      if (!this.id) {
        this.error = '请输入用户ID'
        return
      }
      this.id = this.id.toUpperCase()
      this.loading = true
      try {
        const res = await this.$ajax({
          type: 'GET',
          url: '/user/admin?id=' + encodeURIComponent(hash1(this.id)),
          headers: {
            'token': SS.token
          }
        })
        this.update = res.data
        this.disable = false
      } catch (err) {
        this.error = err.response.data
      }
      this.loading = false
    },
    async submit() {
      this.errorMessages = ''
      this.tip = '正在提交请稍后'
      let body = {
        name: this.update.name,
        role: this.update.role,
        phone: this.update.phone
      }
      if (this.update.pwd) body['password'] = "1"
      console.log(body)
      try {
        await this.$ajax({
          type: 'PUT',
          url: '/user/admin?id=' + encodeURIComponent(hash1(this.id)),
          headers: {
            'token': SS.token
          },
          body: body
        })
        this.tip = '提交成功!'
        this.style = 'color: green'
      } catch (err) {
        this.tip = '提交失败!' + err.response.data
        this.style = 'color: red'
      }
    }
  }
}
</script>

<style scoped>
  div.user {
    padding: 30px 50px;
  }
</style>
