<template>
  <div class="group">
    <h2 v-if="!data.length">正在获取数据...</h2>
    <p v-else>右侧数字为用户组中的用户数，点击数字可查看用户姓名列表</p>
    <v-treeview
      :items="data"
      open-on-click
      hoverable
    >
      <template v-slot:append="{ item }">
        <v-btn text v-if="item.leaf" @click="show(item)">
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
        <v-card-text>您正在进行危险操作，删除用户组将会删除所有子用户组和所有用户！请输入<code>{{ message }}</code>来确认删除</v-card-text>
        <v-text-field outlined dense style="width:85%; margin-left: 7.5%" v-model="text"></v-text-field>
        <v-card-text :style="style">{{ tip }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="deleteGroup()" :disabled="message!==text" :loading="loading">确定</v-btn>
          <v-btn text @click="dialog=false">关闭</v-btn>
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
    style: ''
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
    parseTree() {
    },
    traverse(array, index, root) {
      if (root === undefined) {
        root = []
      }
      for (let i = 0; i < root.length; i++) {
        if (root[i]['short'] === array[index]) {
          return this.traverse(array, index + 1, root[i]['children'])
        }
      }
      return {'index': index, 'root': root}
    },
    show(item) {
      this.sheet = true
      this.list = this.map[item.name]
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
      this.data = []
      await this.tree()
      this.loading = false
      this.message = ''
    },
    async tree() {
      try {
        const resp = await this.$ajax({
          method: 'GET',
          url: `/user/admin?id=${encodeURIComponent(SS.group)}&group=1`,
          headers: { 'token': SS.token }
        })
        this.map = resp.data
        let item = resp.data
        for (let key in item) {
          if (key === '/') continue
          const array = key.split('/')
          array.shift()
          array.pop()
          if (array === undefined) continue
          let parent = '/'
          // traverse tree to find where to insert
          let a = this.traverse(array, 0, this.data)
          a
          let i = a['index']
          let temp = a['root']
          for (let j = 0; j < i; j++) {
            parent = parent + array[j] + '/'
          }
          for (;i < array.length; i++) {
            let o = { 'name': parent + array[i] + '/', 'short': array[i], 'children': [] }
            temp.push(o)
            parent = o.name
            temp = o['children']
            if (i === array.length - 1) o['leaf'] = true
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
