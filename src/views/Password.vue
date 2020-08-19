<template>
  <div class="password">
    <h1 v-if="title.length > 0">{{ title }}</h1>
    <v-card class="form" :style="formStyle">
      <h2>修改密码</h2>
      <v-text-field ref="Opwd" style="width: 250px;" label="原密码" type="password" outlined dense v-model="Opwd" :error-messages="Oerror" :messages="messages" hint="请输入原始密码" @keyup.enter="$refs.Npwd.focus"></v-text-field>
      <v-text-field ref="Npwd" style="width: 250px;" label="新密码" type="password" loading outlined dense v-model="Npwd" hint="推荐使用八位以上的复杂密码" :error-messages="Nerror" @keyup.enter="$refs.Cpwd.focus">
        <template v-slot:progress>
          <v-progress-linear
            :value="progress"
            :color="color"
            absolute
            style="margin-top: -3px; border-radius: 10px;"
            height="4"
          ></v-progress-linear>
        </template>
      </v-text-field>
      <v-text-field ref="Cpwd" style="width: 250px;" label="确认密码" type="password" outlined dense v-model="Cpwd" :error-messages="Cerror" hint="请再次输入新密码" @keyup.enter="next"></v-text-field>
      <v-btn :disabled="!Opwd || !Npwd || !Cpwd" fab color="primary" @click="next" :loading="loading">
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import Hashes from 'jshashes'

function sha256 (msg) {
  return new Hashes.SHA256().b64(msg)
}

function hash2 (msg) {
  return sha256(msg + 'XYZSAS_STATIC_SALT')
}

export default {
  name: 'Password',
  data: () => ({
    loading: false,
    title: '',
    Oerror: '',
    Nerror: '',
    Cerror: '',
    formStyle: '',
    Opwd: '',
    Npwd: '',
    Cpwd: '',
    random: ''
  }),
  mounted() {
    const SS = window.sessionStorage
    if (SS.id === undefined) window.location.href = '/'
  },
  computed: {
    messages () {
      if (!this.loading) return ''
      return '正在验证...'
    },
    progress () {
      if (this.Npwd.length < 8) return this.Npwd.length * 2
      let base = 20
      if (this.Npwd.match(/([a-z])+/)) base += 20
      if (this.Npwd.match(/([0-9])+/)) base += 20
      if (this.Npwd.match(/([A-Z])+/)) base += 20
      if (this.Npwd.match(/([\W])+/) && this.Npwd.match(/(![\u4E00-\u9FA5])+/)) base += 20
      if (this.Npwd.length > 16) base += 20
      return base
    },
    color () {
      return ['error', 'warning', 'success'][Math.floor(this.progress / 40)]
    },
  },
  watch: {
    Opwd () {
      this.Oerror = ''
    },
    Npwd () {
      this.Nerror = ''
    },
    Cpwd () {
      this.Cerror = ''
    }
  },
  methods: {
    async next() {
      this.loading = true
      if (this.Opwd === this.Npwd) {
        this.Nerror = '新旧密码不能相等'
        this.loading = false
        return
      }
      if (this.Npwd !== this.Cpwd) {
        this.Cerror = '确认密码不正确'
        this.loading = false
        return
      }
      const SS = window.sessionStorage
      try {
        const res = await this.$ajax.get('/user/auth?id=' + encodeURIComponent(SS.id))
        this.random = res.data;
      } catch {
        this.Oerror = '网络错误，请稍后重试'
        this.loading = false
        return
      }
      try {
        await this.$ajax.put('/user/auth', {
          random: this.random,
          password: sha256(hash2(this.Opwd) + this.random),
          newPassword: hash2(this.Npwd)
        })
        delete SS.token
        this.formStyle = 'opacity: 0;'
        this.title = '修改密码成功，请重新登录'
        await new Promise(r => setTimeout(r, 2000));
        window.location.href = '/'
      } catch (err) {
        this.Oerror = '网络错误'
        if (err.response) this.Oerror = err.response.data
      }
      this.loading = false
    },
  }
}
</script>

<style scoped>
  div.password {
    color: #333;
    background: #F2F2F2;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  h2 {
    margin-bottom: 20px;
  }

  .form {
    height: 400px;
    padding: 30px 100px;
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.5s ease;
  }

  @media (max-width: 500px) {
    .form {
      width: 100%;
      padding: 30px 10px;
    }
  }
</style>
