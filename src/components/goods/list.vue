<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 面包屑导航结束 -->
    <!-- 卡片区域开始 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="querInfo.query" clearable @clear="getGoodsLists">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsLists"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="GoodsLists" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="90px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditpage(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeGoodsById(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页脚开始 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      querInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      // 数据总条数
      total: 0,
      // 商品分类存储
      GoodsLists: [],
      // 添加商品的表格数据存储
      addGoodsForm: {},
    };
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsLists() {
      const { data: res } = await this.$http.get("goods", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.GoodsLists = res.data.goods;
      this.total = res.data.total;
      console.log(res);
    },
    handleSizeChange(newVal) {
      this.querInfo.pagesize = newVal;
      this.getGoodsLists();
    },
    handleCurrentChange(newVal) {
      this.querInfo.pagenum = newVal;
      this.getGoodsLists();
    },
    // 添加商品
    goAddGoods() {
      this.$router.push("/goods/add");
    },
    showEditpage(id) {
      window.sessionStorage.setItem("id", id);
      this.$router.push("/goods/edit");
    },
    removeGoodsById(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`goods/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getGoodsLists();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
  },
  created() {
    this.getGoodsLists();
  },
};
</script>

<style>
</style>