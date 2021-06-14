<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域  -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-button type="primary" @click="addRoles">添加角色</el-button>
      <!-- 表格区域 -->
      <el-table :data="rolesList" border style="width: 100%" stripe class="show_table">
        <!-- 展开列 -->
        <el-table-column type="expand" width="50px">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',i1 === 0 ? 'bdtop' :'','vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2 ,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 序号列 -->
        <el-table-column type="index" label="#" width="50px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column prop label="操作" width="310px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="changeUsers(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="deleteUsers(scope.row)"
            >删除</el-button>
            <el-button
              type="warning"
              size="small"
              icon="el-icon-setting"
              @click="showSetRightDialong(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限 -->
    <!-- 关闭对话框需要监听事件 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDiaVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        show-checkbox
        :props="treeProps"
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRightDiaVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="修改角色" :visible.sync="changeUsersDialogVisible" width="50%">
      <el-form
        :model="changeUsersForm"
        :rules="changeUsersFormRules"
        ref="changeUsersRef"
        label-width="100px"
      >
        <el-form-item label="角色id">
          <el-input v-model="changeUserId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="changeUsersForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="changeUsersForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeUsersDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeUsersdata">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" width="50%">
      <el-form :model="addRolesForm" :rules="addRolesRules" ref="addRolesRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的数据
      rolesList: [],
      // 控制分配权限对话框的显示和隐藏
      setRightDiaVisible: false,
      // 控制修改角色信息的对话框的显示和隐藏
      changeUsersDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName",
      },
      //默认选中的节点ID值数组;
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",
      // 当前要修改的角色的id
      changeUserId: 0,
      // 修改角色数据
      changeUsersForm: {
        roleName: "", // 角色名称
        roleDesc: "", // 角色描述
      },
      // 修改角色数据验证规则
      changeUsersFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          {
            required: true,
            message: "请输入角色描述",
            trigger: "blur",
          },
        ],
      },
      // 控制添加角色对话框的显示和隐藏
      addRolesDialogVisible: false,
      // 添加角色时要用的数据
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.rolesList = res.data;
    },
    //根据ID删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除!!!");
      }
      console.log(role);
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      console.log(res);
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg);
      } else {
        role.children = res.data;
        return this.$message.success(res.meta.msg);
      }
    },
    //展示分配权限的对话框
    async showSetRightDialong(role) {
      this.roleId = role.id;
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      } else {
        this.rightsList = res.data;
      }
      //递归获取三级节点id；
      this.getLeafKeys(role, this.defKeys);
      console.log(this.defKeys);
      this.setRightDiaVisible = true;
    },
    // 通过递归的形式，获取角色下的所有数据权限的id, 并保存到 defKeys 数组中
    //  node -> 用来判断是否为三级节点 , arr -> 保存数据的数组 ;
    getLeafKeys(node, arr) {
      //判断节点是否为三级节点 , 看是否含有三级节点 , 如果没有就push进arr ;
      if (!node.children) {
        return arr.push(node.id);
      }
      // 调用递归 , 将所有的节点id , 传入到该arr中;
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听关闭对话框事件
    setRightDialogClosed() {
      this.defKeys = [];
    },

    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // 转化为字符串的形式
      const idStr = keys.join(",");

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getRolesList();
      this.setRightDiaVisible = false;
    },
    // 删除角色
    deleteUsers(data) {
      this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${data.id}`);
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getRolesList();
        })
        .catch(() => {
          this.$message.Info("已取消删除!");
        });
    },
    // 修改权限对话框的弹出, 以及数据的渲染
    changeUsers(data) {
      console.log(data);
      // 获得数据，将数据保存到设置好的数组,便于一会双向绑定到输入框中
      this.changeUsersForm.roleName = data.roleName;
      this.changeUsersForm.roleDesc = data.roleDesc;
      this.changeUserId = data.id;
      this.changeUsersDialogVisible = true;
    },
    // 修改数据
    changeUsersdata() {
      // 发送请求前，必须先验证表单的数据是否可靠
      this.$refs.changeUsersRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `roles/${this.changeUserId}`,
          this.changeUsersForm
        );
        // 爷终于知道自己写后端的重要性,
        // 爷错了，爷错了 , 我是傻逼
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getRolesList();
        this.changeUsersDialogVisible = false;
      });
    },
    // 打开添加用户对话框
    addRoles() {
      this.addRolesDialogVisible = true;
    },
    // 点击确定添加用户
    addRolesData() {
      this.$refs.addRolesRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getRolesList();
        this.addRolesDialogVisible = false;
      });
    },
  },
  created() {
    this.getRolesList();
  },
};
</script>

<style scope>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>