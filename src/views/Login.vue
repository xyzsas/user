<template>
  <div class="login">
    <v-card class="form" :style="formStyle">
      <h1>学生事务系统</h1>
      <h3>{{ tip }}</h3>
      <v-text-field ref="input" style="width: 250px;" :label="label" :type="step" outlined rounded v-model="input" :error-messages="error" :messages="messages" @keyup.enter="next"></v-text-field>
      <v-btn :disabled="!input" fab color="primary" @click="next" :loading="loading">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import Hashes from 'jshashes'

function hash1 (msg) {
  return new Hashes.MD5().b64(msg).substr(7, 10)
}

function sha256 (msg) {
  return new Hashes.SHA256().b64(msg)
}

function hash2 (msg) {
  return sha256(msg + 'XYZSAS_STATIC_SALT')
}

export default {
  name: 'Login',
  data: () => ({
    loading: false,
    error: '',
    formStyle: '',
    input: '',
    step: 'username',
    random: ''
  }),
  computed: {
    tip () {
      if (this.step === 'username') return '登录'
      else return '输入密码'
    },
    label () {
      if (this.step === 'username') return '用户名'
      else return '密码'
    },
    icon () {
      if (this.step === 'username') return 'mdi-arrow-right'
      else return 'mdi-check'
    },
    messages () {
      if (!this.loading) return ''
      if (this.step === 'username') return '安全检查中，请耐心等待'
      else return '正在验证您的身份...'
    }
  },
  methods: {
    async next () {
      this.loading = true
      this.error = ''
      if (this.step === 'username') await this.username()
      else await this.password()
      this.loading = false
    },
    async username () {
      this.input = this.input.toUpperCase()
      const id = hash1(this.input)
      try {
        const res = await this.$ajax.get('/user/auth?id=' + id)
        this.random = res.data;
      } catch {
        this.error = '网络错误，请稍后重试'
        return
      }
      this.formStyle = 'opacity: 0;'
      await new Promise(r => setTimeout(r, 1000));
      this.input = ''
      this.step = 'password'
      this.$nextTick(() => this.$refs.input.focus())
      this.formStyle = ''
    },
    async password () {
      try {
        const { data } = await this.$ajax.post('/user/auth', {
          random: this.random,
          password: sha256(hash2(this.input) + this.random)
        })
        this.input = ''
        const SS = window.sessionStorage
        SS.token = data.token
        SS.name = data.user.name
        SS.id = data.user.id
        SS.group = data.user.group
        SS.role = data.user.role
        this.formStyle = 'opacity: 0;'
        window.location.href = '/index.html'
      } catch (err) {
        this.error = '网络错误'
        if (err.response) this.error = err.response.data
        await new Promise(r => setTimeout(r, 2000));
        this.formStyle = 'opacity: 0;'
        await new Promise(r => setTimeout(r, 1000));
        this.error = ''
        this.step = 'username'
        this.input = ''
        this.formStyle = ''
      }
    }
  }
}
</script>

<style scoped>
  div.login {
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

  h3 {
    position: relative;
    width: 100%;
    color: #555;
    margin: 10px 0 20px;
  }

  .form {
    height: 310px;
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
