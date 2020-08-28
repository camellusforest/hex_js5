//本作業有參考範例程式碼
import zh from "./zh_TW.js";

//自定義設定檔案，錯誤的className
VeeValidate.configure({
  classes: {
    valid: "is-valid",
    invalid: "is-invalid",
  },
});

//載入自訂規則包
VeeValidate.localize("tw", zh);

//載入VeeValidate input驗證工具，全域註冊
Vue.component("ValidationProvider", VeeValidate.ValidationProvider);
//載入VeeValidate完整表單的驗證工具，全域註冊
Vue.component("ValidationObserver", VeeValidate.ValidationObserver);
//載入Vue-Loading套件
Vue.use(VueLoading);
//全域註冊VueLoading，並設定標籤為loading
Vue.component("loading", VueLoading);

new Vue({
  //綁定
  el: "#app",
  //資料
  data: {
    products: [],
    tempProduct: {
      num: 0,
    },
    status: {
      loadingItem: "",
    },
    form: {
      name: "",
      email: "",
      tel: "",
      address: "",
      payment: "",
      message: "",
    },
    cart: {},
    cartTotal: 0,
    isLoading: false,
    UUID: "74a69e4c-7e9a-4208-b54e-6c6fc9bfbdd2",
    apiPath: "https://course-ec-api.hexschool.io",
  },
  //生命週期
  created() {
    this.getProducts();
    this.getCart();
  },
  methods: {
    //取得產品列表
    getProducts(page = 1) {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.UUID}/ec/products?page=${page}`;
      axios.get(url).then((response) => {
        this.products = response.data.data;
        this.isLoading = false;
      });
    },
    getDetailed(id) {
      this.status.loadingItem = id;
      const url = `${this.apiPath}/api/${this.UUID}/ec/product/${id}`;
      axios.get(url).then((response) => {
        this.tempProduct = response.data.data;
        //因為tempProduct的num沒有預設數字，因此options無法選擇預設欄位，下方是解決該問題的方法。另外，直接使用物件新增屬性會讓雙向綁定失效，所以要用$set
        this.$set(this.tempProduct, "num", 0);
        $("#productModal").modal("show");
        this.status.loadingItem = "";
      });
    },
    addToCart(item, quantity = 1) {
      this.status.loadingItem = item.id;
      const url = `${this.apiPath}/api/${this.UUID}/ec/shopping`;
      const cart = {
        product: item.id,
        quantity,
      };

      axios
        .post(url, cart)
        .then(() => {
          this.status.loadingItem = "";
          $("#productModal").modal("hide");
          this.getCart();
        })
        //錯誤訊息
        .catch((error) => {
          this.status.loadingItem = "";
          console.log(error.response.data.errors);
          $("#productModal").modal("hide");
        });
    },
    //取得購物車資料
    getCart() {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.UUID}/ec/shopping`;

      axios.get(url).then((response) => {
        this.cart = response.data.data;
        //累加總金額
        this.cart.forEach((item) => {
          this.cartTotal += item.product.price;
        });
        this.isLoading = false;
      });
    },
    quantityUpdata(id, num) {
      //不讓商品數量低於0個（為負）
      if (num <= 0) return;

      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.UUID}/ec/shopping`;

      const data = {
        product: id,
        quantity: num,
      };

      axios.patch(url, data).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    //清除購物車全部資料
    removeAllCartItem() {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.UUID}/ec/shopping/all/product`;
      axios.delete(url).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    //移除購物車單項商品
    removeCartItem(id) {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.UUID}/ec/shopping/${id}`;
      axios.delete(url).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    createOrder() {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.UUID}/ec/orders`;

      axios
        .post(url, this.form)
        .then((response) => {
          if (response.data.data.id) {
            this.isLoading = false;
            //跳出提示訊息
            $("#orderModal").modal("show");
            //重新渲染購物車
            this.getCart();
          }
        })
        .catch((error) => {
          this.isLoading = false;
          console.log(error.response.data.errors);
        });
    },
  },
});
