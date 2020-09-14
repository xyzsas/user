<template>
  <div class="reset">
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

export default {
  name: 'Reset',
  data: () => ({
    loading: false,
    success: false,
    error: '',
    formStyle: '',
    input: '',
    step: 'username',
    random: '',
    id: '',
    message: ''
  }),
  computed: {
    tip () {
      if (this.step === 'username') return '重置密码'
      else return '输入验证码'
    },
    label () {
      if (this.step === 'username') return '用户名'
      else return '验证码'
    },
    icon () {
      if (this.step === 'username') return 'mdi-arrow-right'
      else return 'mdi-check'
    },
    messages () {
      if (this.step === 'number' && this.message && !this.success) return this.message
      if (!this.loading) return ''
      if (this.success) return '成功重置密码为用户名，请重新登录'
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
    async sendCode () {
      try {
        const res = await this.$ajax.get('/phone?id=' + encodeURIComponent(this.id))
        this.message = res.data
        return true
      } catch (err) {
        this.error = '网络错误'
        if (err.response) this.error = err.response.data
        return false
      }
    }, 
    async username () {
      this.input = this.input.toUpperCase()
      this.id = hash1(this.input)
      if (!await this.sendCode()) return
      this.formStyle = 'opacity: 0;'
      await new Promise(r => setTimeout(r, 1000))
      this.input = ''
      this.step = 'number'
      this.message = ''
      this.$nextTick(() => this.$refs.input.focus())
      this.formStyle = ''
    },
    async password () {
      try {
        await this.$ajax.post('/phone', {
          id: this.id,
          code: this.input
        })
        this.success = true
        await new Promise(r => setTimeout(r, 3000));
        this.formStyle = 'opacity: 0;'
        await new Promise(r => setTimeout(r, 500));
        window.location.href = '/'
      } catch (err) {
        this.error = '网络错误'
        if (err.response) this.error = err.response.data
        await new Promise(r => setTimeout(r, 7000));
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
  div.reset {
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
