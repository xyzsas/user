<template>
  <div class="login">
    <v-card class="form" :style="formStyle">
      <h1>学生事务系统</h1>
      <h3>{{ tip }}</h3>
      <v-text-field ref="input" style="width: 250px;" :label="label" :type="step" outlined rounded v-model="input" :error-messages="error" :messages="messages" @keyup.enter="next"></v-text-field>
      <v-btn :disabled="!input" fab color="primary" @click="next" :loading="loading">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
      <div @click="reset" style="color: #BDBDBD; font-size: 0.75rem; position: absolute; right: 10px; bottom: 5px; cursor: pointer;">重置密码</div>
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
    success: false,
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
      if (this.success) return '登录成功，正在跳转...'
      if (this.step === 'username') return '安全检查中，请耐心等待'
      else return '正在验证您的身份...'
    }
  },
  methods: {
    reset () {
      this.$router.push('reset')
    },
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
        const res = await this.$ajax.get('/auth?id=' + encodeURIComponent(id))
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
        const { data } = await this.$ajax.post('/auth', {
          random: this.random,
          password: sha256(hash2(this.input) + this.random)
        })
        const SS = window.sessionStorage
        SS.token = data.token
        SS.name = data.user.name
        SS.id = data.user.id
        SS.group = data.user.group
        SS.role = data.user.role
        SS.phone = data.user.phone
        SS.message = JSON.stringify(data.message)
        console.log(data.message)
        this.success = true
        await new Promise(r => setTimeout(r, 1000));
        this.formStyle = 'opacity: 0;'
        await new Promise(r => setTimeout(r, 500));
        let url = this.$route.query.c || '/'
        if (this.$route.query.c === 'AAUTH') {
          url = 'https://aauth.link/reenter.html?code=' + data.code + '&state=' + this.$route.query.state
        }
        window.location.href = url
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
    position: relative;
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
