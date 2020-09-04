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
import Hashes from 'jshashes'

const SS = window.sessionStorage

function hash1 (msg) {
  return new Hashes.MD5().b64(msg).substr(7, 10)
}

export default {
  name: 'Phone',
  data: () => ({
    loading: false,
    success: false,
    error: '',
    input: SS.phone,
    id: '',
    message: ''
  }),
  computed: {
    messages () {
      if (this.message) return this.message
      if (!this.loading) return ''
      else return '正在绑定手机...'
    }
  },
  methods: {
    async next () {
      this.loading = true
      this.error = ''
      await this.phone()
      this.loading = false
    },
    async phone () {
      this.id = hash1(this.input)
      try {
        const res = await this.$ajax.put('/user/phone?id=' + encodeURIComponent(this.id), {
          phone: this.input
        }, {
          headers: { token: SS.token }
        })
        this.message = res.data
        console.log(res.data)
      } catch (err) {
        this.error = '网络错误'
        if (err.response) this.error = err.response.data
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
