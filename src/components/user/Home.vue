<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../../assets/img/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse? '64px' : '200px'">
        <div class="aside">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单 -->
          <el-menu
            background-color="#313743"
            text-color="#fff"
            active-text-color="#48a4ff"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="activePath"
          >
            <!--  -->
            <!-- :unique-opened="true" => 只允许打开一个子菜单 -->
            <!-- 一级菜单 -->
            <!-- index 只接受字符串，不接收数值 -->
            <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/'+subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
                @click="saveNavState('/'+subItem.path)"
              >
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
      </el-aside>
      <el-main class="main">
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单区域
      menuList: [],
      iconObj: {
        125: "el-icon-user-solid",
        103: "el-icon-place",
        101: "el-icon-shopping-bag-1",
        102: "el-icon-notebook-2",
        145: "el-icon-monitor",
      },
      isCollapse: false,
      // 被激化的链接地址
      activePath: "",
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    loginout() {
      window.sessionStorage.clear("token");
      this.$router.push("/login");
      this.$message.success("退出成功");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
    },
    // 点击按钮实现，菜单的切换的展开，和折叠；
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
};
</script> 

<style leng="scss">
@import url("../../assets/css/Home.css");
</style>
