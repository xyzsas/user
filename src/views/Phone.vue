<template>
  <div class="reset">
    <v-card class="form">
      <h1>学生事务系统</h1>
      <h3>绑定手机</h3>
      <v-text-field ref="input" style="width: 250px;" label="手机号" outlined rounded v-model="input" :error-messages="error" :messages="messages" @keyup.enter="next"></v-text-field>
      <v-btn :disabled="!input" fab color="primary" @click="next" :loading="loading">
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
const SS = window.sessionStorage

export default {
  name: 'Phone',
  data: () => ({
    loading: false,
    success: false,
    error: '',
    input: SS.phone,
    message: ''
  }),
  computed: {
    messages () {
      if (this.message) return this.message
      if (!this.loading) return ''
      else return '正在绑定手机...'
    }
  },
  watch: {
    input () {
      this.error = ''
    }
  },
  methods: {
    async next () {
      this.loading = true
      try {
        const res = await this.$ajax.put('/phone', {
          phone: this.input
        }, { headers: { token: SS.token }})
        this.message = res.data
        SS.phone = this.input
        await new Promise(r => setTimeout(r, 1000))
        window.location.href = '/index.html'
      } catch (err) {
        this.error = '网络错误'
        if (err.response) this.error = err.response.data
      }
      this.loading = false
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
