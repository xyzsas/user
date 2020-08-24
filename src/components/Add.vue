<template>
  <div class="add">
    <h2 style="margin: 20px;">
      待添加用户({{ users.length }})
      <v-btn style="margin: 10px;" color="secondary" @click="sheet = true">导入用户信息</v-btn>
      <v-btn style="margin: 10px;" :loading="loading" color="primary" @click="upload">上传用户信息</v-btn>
    </h2>
    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-1"
    ></v-data-table>
    <v-bottom-sheet v-model="sheet" inset>
      <v-sheet style="padding: 30px 20px;">
        <h3>导入用户数据</h3>
        <p>请将用户数据粘贴到文本框中并点击确认（每行一个用户，数据之间用空格或tab隔开）。</p>
        <v-textarea height="40vh" outlined label="用户名 姓名 用户组 角色 (手机)" v-model="raw"></v-textarea>
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

export default {
  name: 'Add',
  data: () => ({
    sheet: false,
    dialog: false,
    message: '',
    loading: false,
    raw: '',
    headers: [
      { text: '用户名', value: 'id' },
      { text: '姓名', value: 'name' },
      { text: '用户组', value: 'group' },
      { text: '角色', value: 'role' },
      { text: '手机', value: 'phone' },
      { text: '状态', value: 'status' }
    ],
    users: []
  }),
  methods: {
    importRaw () {
      const t = this.raw.split('\n')
      for (let u of t) {
        const c = u.split(/\s+/)
        if (c.length < 4) continue
        this.users.push({
          id: c[0].toUpperCase(),
          name: c[1],
          group: c[2],
          role: c[3],
          phone: c[4]
        })
      }
      this.raw = ''
      this.sheet = false
    },
    async upload () {
      this.loading = true
      while (this.users.length) {
        let cot = 0
        let payload = {}
        for (const u of this.users) {
          if (!u.status) {
            payload[u.id] = [u.name, u.group, u.role, u.phone]
            if (++cot === 200) break
          }
        }
        if (!cot) break
        const res = await this.$ajax.post('/user/admin', payload, {
          headers: { token: SS.token }
        })
          .then(resp => {
            for (let i = 0; i < this.users.length;) {
              if (resp.data[this.users[i].id] === true) {
                this.users.splice(i, 1)
              } else {
                if (resp.data[this.users[i].id] === false) this.users[i].status = '错误！'
                i++
              }
            }
            return true
          })
          .catch(err => {
            this.message = err.response.data
            this.dialog = true
            return false
          })
        if (!res) break
      }
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
