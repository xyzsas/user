<template>
  <div class="user">
    <v-row style="width: 450px">
      <v-col><v-text-field ref="id" style="width: 300px;" label="用户ID" type="text" outlined dense v-model="id" :error-messages="error" hint="请输入需查询的用户ID" @keyup.enter="search"></v-text-field></v-col>
      <v-col><v-btn color="primary" @click="search" :loading="loading">查询</v-btn></v-col>
    </v-row>
    <h2>用户信息</h2>
    <br>
    <v-text-field ref="name" outlined dense style="width: 300px;" type="text" v-model="update.name" :error-messages="errorMessages" label="姓名"></v-text-field>
    <v-text-field ref="group" outlined dense style="width: 300px;" type="text" v-model="update.group" label="分组" disabled></v-text-field>
    <v-text-field ref="role" outlined dense style="width: 300px;" type="text" v-model="update.role" :error-messages="errorMessages" label="角色"></v-text-field>
    <v-text-field ref="phone" outlined dense style="width: 300px;" type="text" v-model="update.phone" :error-messages="errorMessages" label="电话"></v-text-field>
    <v-text-field ref="pwd" outlined dense style="width: 300px;" type="password" v-model="update.pwd" :error-messages="errorMessages" label="密码"></v-text-field>
    <p style="font-size: 0.8rem" v-if="tip">{{ tip }}</p>
    <v-btn style="width: 100px" color="primary" @click="submit">提交</v-btn>
  </div>
</template>

<script>
const SS = window.sessionStorage

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
    info: false,
    disable: true,
    errorMessages: '',
    loading: false,
    tip: ' '
  }),
  methods: {
    async search() {
      if (!this.id) {
        this.error = '请输入用户ID'
        return
      }
      this.loading = true
      try {
        const res = await this.$ajax({
          type: 'GET',
          url: '/user/admin?id=' + encodeURIComponent(this.id),
          headers: {
            'token': SS.token
          }
        })
        this.update = res.data
        this.update.pwd = 'fake password'
        this.info = true
      } catch (err) {
        this.error = err.response.data
      }
      this.loading = false
    },
    async submit() {
      this.errorMessages = ''
      if (!this.info) {
        this.error = '请先查询用户'
        return
      } 
      this.tip = '正在提交请稍后'
      let body = {
        name: this.update.name,
        role: this.update.role,
        phone: this.update.phone
      }
      if (this.update.pwd !== 'fake password') body['password'] = this.update.pwd
      try {
        await this.$ajax({
          type: 'PUT',
          url: '/user/admin?id=' + encodeURIComponent(this.id),
          headers: {
            'token': SS.token
          },
          body: body
        })
        this.tip = '提交成功!'
      } catch (err) {
        this.tip = '提交失败!' + err.response.data
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
