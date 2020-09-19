<template>
  <div class="add">
    <h2 style="margin: 20px;">
      待更新用户({{ users.length }})
      <v-btn style="margin: 10px;" color="secondary" @click="sheet = true">导入用户信息</v-btn>
      <v-btn style="margin: 10px;" :loading="loading" color="primary" @click="upload">上传用户信息</v-btn>
    </h2>
    <v-data-table
      :key="random"
      :headers="headers"
      :items="users"
      class="elevation-1"
    ></v-data-table>
    <v-bottom-sheet v-model="sheet" inset>
      <v-sheet style="padding: 30px 20px;">
        <h3>导入用户数据</h3>
        <p>请将用户数据粘贴到文本框中并点击确认（每行一个用户，数据之间用空格或tab隔开）。</p>
        <v-textarea height="40vh" outlined label="用户名 新用户组" v-model="raw"></v-textarea>
        <v-btn color="secondary" @click="importRaw">确认</v-btn>
      </v-sheet>
    </v-bottom-sheet>
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title>用户管理</v-card-title>
        <v-card-text>{{ message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const SS = window.sessionStorage
import Hashes from 'jshashes'

function hash1 (msg) {
  return new Hashes.MD5().b64(msg).substr(7, 10)
}

export default {
  name: 'Add',
  data: () => ({
    sheet: false,
    dialog: false,
    message: '',
    loading: false,
    raw: '',
    random: 0,
    headers: [
      { text: '用户名', value: 'id' },
      { text: '用户组', value: 'group' },
      { text: '状态', value: 'status' }
    ],
    users: []
  }),
  methods: {
    importRaw () {
      const t = this.raw.split('\n')
      for (let u of t) {
        const c = u.split(/\s+/)
        if (c.length < 2) continue
        this.users.push({
          id: c[0],
          group: c[1]
        })
      }
      this.raw = ''
      this.sheet = false
    },
    async upload () {
      this.loading = true
      for (let i = 0; i < this.users.length; i++) {
        const u = this.users[i]
        await this.$ajax
          .put('/admin/user?id=' + encodeURIComponent(hash1(u.id.toUpperCase())), { group: u.group }, {
            headers: { token: SS.token }
          })
          .then(() => {
            this.users.splice(i, 1)
            i--
          })
          .catch(err => {
            u.status = err.response.data
          })
      }
      this.random++
      this.loading = false
    }
  }
}
</script>

<style scoped>
  div.add {
    padding: 30px 50px;
  }
</style>
