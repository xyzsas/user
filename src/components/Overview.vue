<template>
  <div class="overview">
    <h1 style="margin: 0 0 30px -10px;">{{ tip }}</h1>
    <p>管理员： {{ SS.name }}</p>
    <p>用户组权限： {{ SS.group }}</p>
    <p>功能简介：添加用户可批量导入用户，查询用户可根据用户id查询并更改用户信息，用户组可用于批量删除用户。</p>
    <p>角色：ADMIN表示管理员，其余为常规用户。</p>
    <p>用户组：必须以/开头，/结尾，形如文件目录。</p>
  </div>
</template>

<script>
const SS = window.sessionStorage

export default {
  name: 'Overview',
  data: () => ({
    SS: SS
  }),
  computed: {
    tip () {
      if (SS.role === 'ADMIN') return '用户管理'
      else return '权限不足'
    }
  },
}
</script>

<style scoped>
  div.overview {
    padding: 30px 50px;
  }
</style>
