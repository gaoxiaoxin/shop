<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="card">
      <!-- 表格区域 -->
      <el-table :data="rightsLIst" border style="width: 100%" stripe class="show_table">
        <el-table-column type="index" label="序列" width="50px"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0' ">一级权限</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1' ">二级权限</el-tag>
            <el-tag type="warning" v-else>三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的权限列表
      rightsLIst: [],
    };
  },
  methods: {
    //   获取数据权限列表
    async getRightsList() {
      const { data: res } = await this.$http.get("/rights/list");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据权限列表失败");
      }
      this.rightsLIst = res.data;
      console.log(res);
    },
  },
  created() {
    this.getRightsList();
  },
};
</script>

<style scoped>
.show_table {
  margin-bottom: 20px;
}
</style>