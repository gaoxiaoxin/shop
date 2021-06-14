<template>
  <div class="Login_body">
    <div class="login_box">
      <!-- 登录头像 -->
      <div class="avatar_box">
        <img src="../assets/img/logo.png" alt />
      </div>
      <!-- 登录表单 -->
      <!-- 属性绑定   model  :  数据对象  ， rules : 表单验证对象 -->
      <!-- ref 对象整个的引用   LoginFormRef 表单的实例对象 -->
      <el-form ref="LoginFormRef" label-width="0px" class="login_form" :model="form" :rules="rules">
        <!-- 用户名 -->
        <!-- 使用prop来绑定验证规则 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="form.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
        <!-- 按钮区域 -->
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      // 登录表单的数据绑定
      form: {
        username: "",
        password: "",
      },
      // 表单的验证规则对象
      rules: {
        // 验证用户名是否合法
        username: [
          // required: 是否是必填项 ， message ： 错误信息 ，
          //trigger : 事件，什么时候开始验证；
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 7,
            message: "长度在 3 到 7 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在6 到 15 个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //点击重置表单
    resetLoginForm() {
      // this 对象上 的 $ref 对象里的  ref 引用  LoginFormRef 的 resetFields 方法；
      this.$refs.LoginFormRef.resetFields();
    },
    // 登录表单预验证
    login() {
      this.$refs.LoginFormRef.validate(async (valid) => {
        if (!valid) return;
        //解构赋值
        const { data: result } = await this.$http.post("login", this.form);
        if (result.meta.status !== 200) {
          // message 已经被挂载到vue的原型上了；
          return this.$message.error("登录失败");
        }
        this.$message.success("登录成功");
        //1.将登录成功之后的token, 保存到客户端的sessionStorage中
        // 1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        // 1.2 token 只应在当前网站打开期间有效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem("token", result.data.token);
        //2. 通过编程式导航跳转到后台主页，路由地址是 /home .
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style scoped>
@import url("../assets/css/Login.css");
</style>
