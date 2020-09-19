<template>
  <div class="group">
    <h2 v-if="!data.length">{{ title }}</h2>
    <p v-else>右侧数字为用户组中的用户数，点击数字可查看用户姓名列表</p>
    <v-treeview
      :items="data"
      open-on-click
      hoverable
    >
      <template v-slot:append="{ item }">
        <v-btn text v-if="map[item['name']]" @click="show(item)">
          {{ Object.keys(map[item['name']]).length }}
        </v-btn>
        <v-btn icon v-if="!item.id" @click="dialog = true; message = item.name" color="error">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-treeview>
    <v-bottom-sheet v-model="sheet" inset>
      <v-sheet scrollable style="padding: 30px 20px;">
        <h2>用户列表</h2>
        <v-list style="height:80vh; overflow-y:auto">
          <v-list-item
            v-for="(value, name) in list"
            :key="name"
          >
            <v-list-item-content>
              <v-list-item-title v-text="value" />
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="userInfo(name)">
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
        <v-card-text>您正在进行危险操作，删除用户组将会删除所有子用户组和所有用户！<br>请输入<code>{{ message }}</code>来确认删除</v-card-text>
        <v-text-field outlined dense style="width:85%; margin-left: 7.5%" v-model="text"></v-text-field>
        <v-card-text :style="style">{{ tip }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="deleteGroup()" :disabled="message!==text" :loading="loading">确定</v-btn>
          <v-btn text @click="dialog=false; tip = ''; style = ''; text = ''">关闭</v-btn>
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
    list: {},
    dialog: false,
    message: '',
    text: '',
    error: '',
    tip: '',
    style: '',
    groupArray: [],
    visited: {},
    title: '正在加载数据...'
  }),
  mounted() { 
    this.tree()
  },
  methods: {
    userInfo(item) {
      this.sheet = false
      this.list = []
      this.$emit('user', item)
    },
    show(item) {
      this.sheet = true
      this.list = this.map[item.name]
    },
    async deleteGroup() {
      this.loading = true
      await this.$ajax
        .delete(`/admin/user?group=${encodeURIComponent(this.message)}`, { headers: { 'token': SS.token } })
        .then(() => {
          this.tip = '删除用户组成功!'
          this.style = 'color: green;'
        })
        .catch(err => {
          this.tip = '删除用户组失败: ' + err.response.data
          this.style = 'color: red;'
        })
      for (let i = 0; i < this.groupArray.length; i++) {
        if (this.groupArray[i].includes(this.message)) {
          this.groupArray.splice(i, 1)
          i--
        }
      }
      this.visited = {}
      this.data = this.parseTree(0).children
      this.loading = false
      this.message = ''
    },
    async getTree() {
      try {
        const { data } = await this.$ajax({
          method: 'GET',
          url: `/admin/user?group=${encodeURIComponent(SS.group)}`,
          headers: { 'token': SS.token }
        })
        this.map = data
        return true
      } catch (err) {
        this.title = err.response.data
        if (err.response.status === 401) window.location.href = '/'
        return false
      }
    },
    parseTree (x) { // process the object of groupArray[x]
      this.visited[x] = true
      const g = this.groupArray[x]
      let res = { name: g, children: [] }
      for (let i = x + 1; i < this.groupArray.length; i++) {
        if (this.visited[i]) continue;
        if (this.groupArray[i].indexOf(g) === 0) {
          res.children.push(this.parseTree(i))
        }
      }
      return res
    },
    async tree() {
      if (!await this.getTree()) return
      let groupSet = new Set()
      for (const g in this.map) {
        const levels = g.substr(SS.group.length).split('/')
        let cur = SS.group
        groupSet.add(cur)
        for (let i = 0; i < levels.length - 1; i++) {
          cur += levels[i] + '/'
          groupSet.add(cur)
        }
      }
      this.groupArray = Array.from(groupSet).sort()
      this.data = this.parseTree(0).children
    }
  }
}
</script>

<style scoped>
  div.group {
    padding: 30px 3%;
  }
</style>
