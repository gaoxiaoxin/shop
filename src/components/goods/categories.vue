<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card" shadow="always">
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success iconBig"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error iconBig" v-else style="color:red"></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <!-- 下面模板 中的 slot-scope="scope" 被删除 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="changeCateDialog(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row)"
          >删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!--  添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定级联选择器的数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- v-model 必须为一个数组 -->
          <el-cascader
            clearable
            change-on-select
            v-model="selectedKeys"
            :options="parentCateList"
            expand-trigger="hover"
            :props="cascaderProps"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="changeCateDialogVisible" width="50%">
      <el-form
        :model="changeCateForm"
        :rules="changeCateFormRules"
        ref="changeCateRef"
        label-width="100px"
      >
        <el-form-item label="修改分类" prop="cat_name">
          <el-input v-model="changeCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表
      cateList: [],
      //总数居条数
      total: 0,
      // 控制分配权限对话框的显示
      addCateDialogVisible: false,

      // 控制修改分类对话框的显示
      changeCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: "",
        // 父级分类的名称
        cat_pid: 0,
        // 当前分类的等级 , 默认为一级分类;
        cat_level: 0,
      },
      // 修改分类要添加的对象
      changeCateForm: {
        cat_id: 0,
        cat_name: "",
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类的名称。", trigger: "blur" },
        ],
      },
      // 修改分类表单的验证规则对象
      changeCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类的名称。", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // value 指定选项的值为选项对象的某个属性值
        value: "cat_id",
        // label 指定选项标签为选项对象的某个属性值
        label: "cat_name",
        // 指定选项的子选项为选项对象的某个属性值
        children: "children",
      },
      // 级联选择器双向绑定的 数组
      selectedKeys: [],
      //为table指定列的定义
      columns: [
        { label: "分类名称", prop: "cat_name" },
        {
          label: "是否有效",
          // 表示，将当前的列定义为模板列
          type: "template",
          // 表示当前列所要用到的模板的名称
          template: "isok",
        },
        {
          label: "排序",
          // 表示，将当前的列定义为模板列
          type: "template",
          // 表示当前列所要用到的模板的名称
          template: "order",
        },
        {
          label: "操作",
          // 表示，将当前的列定义为模板列
          type: "template",
          // 表示当前列所要用到的模板的名称
          template: "opt",
        },
      ],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 pagenum 改变
    handleCurrentChange(newNum) {
      this.querInfo.pagenum = newNum;
      this.getCateList();
    },
    // 分配权限对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$messgae.error(res.meta.msg);
      }
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发函数
    parentCateChanged() {
      // 如果 selectedKeys 数组中的 length 大于 0 , 证明选中父级分类;
      // 反之，就说明没有选中任何父级分类;
      if (this.selectedKeys.length !== 0) {
        // 父级分类的ID
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的ID
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        return this.$message.success(res.meta.msg);
      });
      this.addCateDialogVisible = false;
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 编辑分类对话框
    async changeCateDialog(data) {
      console.log(data);
      this.changeCateForm.cat_name = data.cat_name;
      this.changeCateForm.cat_id = data.cat_id;

      this.changeCateDialogVisible = true;
    },
    async changeCate() {
      const { data: res } = await this.$http.put(
        `categories/${this.changeCateForm.cat_id}`,
        {
          cat_name: this.changeCateForm.cat_name,
        }
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getCateList();
      this.changeCateForm.cat_name = "";
      this.changeCateForm.cat_id = 0;
      this.changeCateDialogVisible = false;
    },
    // 删除分类
    deleteCate(data) {
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${data.cat_id}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getCateList();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
  },
};
</script>

<style scope>
.tree-table {
  margin-top: 15px;
}
.iconBig {
  font-size: 16px;
}
.el-cascader {
  width: 100%;
}
</style>