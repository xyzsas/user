<template>
  <div class="group">
    <h2 v-if="!data.length">正在获取数据...</h2>
    <p v-else>小括号内数字为用户数量</p>
    <v-treeview
      :items="data"
      open-on-click
      hoverable
    >
      <template v-slot:append="{ item }">
        <v-btn icon v-if="!item.children" @click="show(item)">
          <v-icon>mdi-account</v-icon>
        </v-btn>
        <v-btn icon v-if="!item.id" @click="dialog = true; message = item.group" color="error">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-treeview>
    <v-bottom-sheet v-model="sheet" inset>
      <v-sheet scrollable style="padding: 30px 20px;">
        <h2>用户列表</h2>
        <v-list style="height:80vh; overflow-y:auto">
          <v-list-item
            v-for="item in list"
            :key="item.id"
          >
            <v-list-item-content>
              <v-list-item-title v-text="item.name" />
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="userInfo(item)">
                <v-icon color="grey lighten-1">mdi-information</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-bottom-sheet>
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title>删除用户组</v-card-title>
        <v-card-text>请输入<strong>{{ message }}</strong>来确认</v-card-text>
        <v-text-field outlined dense style="width:85%; margin-left: 7.5%" v-model="text"></v-text-field>
        <v-card-text :style="style">{{ tip }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="deleteGroup()" :disabled="message!==text" :loading="loading">确定</v-btn>
          <v-btn text color="error" @click="dialog=false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const SS = window.sessionStorage

export default {
  name: 'Group',
  data: () => ({
    loading: false,
    data: [],
    map: {},
    sheet: false,
    list: [],
    dialog: false,
    message: '',
    text: '',
    error: '',
    tip: '',
    style: ''
  }),
  mounted() { 
    if (SS.groups) return
    this.tree()
  },
  methods: {
    userInfo(item) {
      this.sheet = false
      this.list = []
      this.$emit('user', item.id)
    },
    parseTree() {

    },
    show(item) {
      this.sheet = true
      this.list = this.map[item.group]
    },
    async deleteGroup() {
      this.loading = true
      await this.$ajax
        .delete(`/user/admin?id=${encodeURIComponent(this.message)}&group=1`, { headers: { 'token': SS.token } })
        .then(() => {
          this.tip = '删除用户组成功!'
          this.style = 'color: green;'
        })
        .catch(err => {
          this.tip = '删除用户组失败: ' + err.response.data
          this.style = 'color: red;'
        })
      delete SS.groups
      this.data = []
      await this.tree()
      this.loading = false
    },
    async tree() {
      try {
        const resp = await this.$ajax({
          method: 'GET',
          url: `/user/admin?id=${encodeURIComponent(SS.group)}&group=1`,
          headers: { 'token': SS.token }
        })
        for (const g in resp.data) {
          if (g === '/') continue
          const y = g.split('/')[1]
          if (this.data.length === 0) this.data = [{ name: y, group: g, children: []}]
          for (let i = 0; i < this.data.length; i++) {
            if (y === this.data[i].name) {
              let cl = { 
                name: g,
                group: g
              }
              this.data[i]['children'].push(cl)
              this.map[g] = []
              for (const s in resp['data'][g]) {
                const stu = {
                  name: resp['data'][g][s],
                  id: s
                }
                this.map[g].push(stu)
              }
              cl['name'] += `(${this.map[g].length})`
              break
            } else {
              this.data.push({ name: y, children: []})
              i--
            }
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>
  div.group {
    padding: 30px 3%;
  }
</style>
