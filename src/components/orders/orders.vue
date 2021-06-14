<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 面包屑导航结束 -->
    <!-- 卡片区域开始 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="因后台原因，搜索不可用"
            v-model="querInfo.query"
            clearable
            @clear="getOrdersLists()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrdersLists()"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="OrdersLists" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay == 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改地址" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="getOrderDataById(scope.row.order_id)"
              ></el-button>
            </el-tooltip>
            <!-- 显示物理信息按钮 -->
            <el-tooltip effect="dark" content="物流信息" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showProgressBox(scope.row.order_id)"
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
    <!-- 修改地址 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="clear">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressForm" label-width="100px">
        <el-form-item>
          <span class="switch">是否发货</span>
          <el-switch v-model="addressForm.is_send" active-color="#13ce66"></el-switch>
        </el-form-item>
        <br />
        <el-form-item>
          <span class="switch">支付方式</span>
          <el-select v-model="addressForm.order_pay" placeholder="请选择">
            <el-option
              v-for="item in orderPayData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单价格" prop="order_price">
          <el-input v-model="addressForm.order_price"></el-input>
        </el-form-item>
        <el-form-item label="订单编号" prop="order_number">
          <el-input v-model="addressForm.order_number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="showEditDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 获取物流信息 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in processInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
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
      OrdersLists: [],
      // 添加商品的表格数据存储
      addGoodsForm: {},
      addressVisible: false,

      addressForm: {
        is_send: true,
        order_pay: 0,
        order_number: "", // 订单编号
        order_price: 100,
      },

      addressFormRules: {
        order_price: [
          { required: true, message: "请填写订单价格", trigger: "blur" },
        ],
        order_number: [
          { required: true, message: "请填写订单编号", trigger: "blur" },
        ],
      },
      progressVisible: false,
      // 物流信息
      processInfo: [],
      // 修改订单信息的订单id
      id: "",
      // 支付方式
      orderPayData: [
        {
          label: "未支付",
          value: 0,
        },
        {
          label: "支付宝",
          value: 1,
        },
        {
          label: "微信",
          value: 2,
        },
        {
          label: "银行卡",
          value: 3,
        },
      ],
    };
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getOrdersLists() {
      const { data: res } = await this.$http.get("orders", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.OrdersLists = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newVal) {
      this.querInfo.pagesize = newVal;
      this.getOrdersLists();
    },
    handleCurrentChange(newVal) {
      this.querInfo.pagenum = newVal;
      this.getOrdersLists();
    },
    // 根据id查询订单信息
    async getOrderDataById(id) {
      this.addressVisible = true;
      this.id = id;
      const { data: res } = await this.$http.get(`orders/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      console.log(res);
      this.addressForm.is_send = res.data.is_send == "否" ? false : true;
      this.addressForm.order_pay = res.data.order_pay;
      this.addressForm.order_number = res.data.order_number;
      this.addressForm.order_price = res.data.order_price;
      console.log(this.addressForm);
    },
    // 修改订单信息
    showEditDialog(id) {
      this.$refs.addressForm.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请添加必须的表单项!");
        }
        // 执行添加的业务逻辑代码
        const { data: res } = await this.$http.put(
          `orders/${this.id}`,
          this.addressForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.addressVisible = false;
        this.getOrdersLists();
      });
    },
    // 在对话框关闭的时候移除表单校验
    clear() {
      this.$refs.addressForm.clearValidate();
    },
    // 获取物流信息
    async showProgressBox(id) {
      this.progressVisible = true;
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.processInfo = res.data;
    },
  },
  created() {
    this.getOrdersLists();
  },
};
</script>

<style scope>
/* .switch {
  margin: 0px 10px 0px 32px;
} */
</style>