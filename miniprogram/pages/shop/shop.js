const app = getApp()
  Page({
    data: {
      shopId: "",  //条形码
      shopName: "",  //商品名称
      shopPrice: "",  //商品价格
      shopStock: "",  //商品库存
      shopDesc: "",   //商品备注
      shopStatus: "1", //商品状态 1 有效 ； 0 无效
      showShopList:true,
      addShopMsg:"",
      queryResult:[],
      sureDelete:false, //是否显示删除弹框
      operatorShopId: null, //要删除的商品条形码
      showStockDialog: false,  //是否显示商品库存数量变更
      stockChangeType: null,  //库存如何变更，增加或者减少
      changeStockNum:1,       //库存变更数量
      operatorShopCurrentStock: 0, //操作商品剩余库存
    },
    onLoad:function(){
      this.onAllQuery();
    },
    scanShop:function(){
      var self = this;
      //调用扫码插件
      // 只允许从相机扫码
      wx.scanCode({
        onlyFromCamera: true,
        success(res) {
          console.log(res)
          //商品条形码id
          self.setData({
            shopId : res.result
          })
          self.queryShopByShopId();
        }
      })
    },
    bindShopIdInput:function(e){
        this.setData({
          shopId: e.detail.value
        })
    },
    bindShopNameInput: function (e) {
      this.setData({
        shopName: e.detail.value
      })
    },
    bindShopPriceInput: function (e) {
      this.setData({
        shopPrice: e.detail.value
      })
    },
    bindShopStockInput: function (e) {
      this.setData({
        shopStock: e.detail.value
      })
    },
    bindShopDescInput: function (e) {
      this.setData({
        shopDesc: e.detail.value
      })
    },
    bindInputChangeStock:function(e){
      var stock = e.detail.value;
      if(parseInt(stock) < 1){
        this.setData({
          changeStockNum: 1
        })
      } else if (parseInt(stock) > parseInt(this.data.operatorShopCurrentStock)){
        this.setData({
          changeStockNum: parseInt(this.data.operatorShopCurrentStock)
        })
      }else{
        this.setData({
          changeStockNum: e.detail.value
        })
      }
    },
    /**
     * 新增商品到数据库
     */
    onAdd: function () {
      if(!this.checkAddInput()){
        return false;
      }
      //校验shopId是否已经存在
      if(this.checkShopIdExist()){
        return false;
      }
      const db = wx.cloud.database()
      const self = this;
      db.collection('shops').add({
        data: {
          shopId: self.data.shopId,
          shopName: self.data.shopName,
          shopPrice: self.data.shopPrice,
          shopDesc: self.data.shopDesc,
          shopStatus: 1,
          shopStock: self.data.shopStock,
          createTime: new Date(),
          updateTime: new Date()
        },
        success: res => {
          this.clearAddInput();
          this.shopTip("新增记录成功");
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          setTimeout(function(){
            this.onAllQuery();
          },500);
        },
        fail: err => {
          this.shopTip("商品新增失败");
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    },
    /**
     * 清空input值
     */
    clearAddInput:function(){
        this.setData({
          shopId: "",
          shopName: "",
          shopPrice: "",
          shopStock: "",
          shopDesc: ""
        })
    },
    /**
     * 校验新增参数
     */
    checkAddInput:function(){
      if (this.data.shopId == null || this.data.shopId == ""){
        this.shopTip("请扫描商品条形码");
        return false;
      }
      if (this.data.shopName == null || this.data.shopName == "") {
        this.shopTip("请输入商品名称");
        return false;
      }
      if (this.data.shopPrice == null || this.data.shopPrice == "") {
        this.shopTip("请输入商品价格");
        return false;
      } else if (!this.priceCheck(this.data.shopPrice)){
         this.shopTip("请输入正确的商品价格:整数或者保留两位小数");
         return false;
      }
      if (this.data.shopStock == null || this.data.shopStock == "") {
        this.shopTip("请输入库存");
        return false;
      } else if (!this.numberCheck(this.data.shopStock)){
        this.shopTip("请输入正确库存数量，只能是正整数");
        return false;
      }
      return true;
    },
    checkShopIdExist:function(){
      const db = wx.cloud.database()
      // 查询商品
      db.collection('shops').where({
        shopId: this.data.shopId
      }).get({
        success: res => {
          if (res.data.length > 0) {
            this.shopTip(this.data.shopId + '已经存在数据，不能再次添加')
            return true;
          }
          return false;
        },
        fail: err => {
          this.shopTip("数据查询失败");
          console.error('[数据库] [查询记录] 失败：', err)
          return false;
        }
      })
    },
    shopTip:function(msg){
      wx.showToast({
        icon: 'none',
        title: msg
      })
    },
    /**
     * 验证单价：包括两位小数
     */
    priceCheck:function(price){ 
      var priceReg = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/;
      if (!priceReg.test(price)) {
        return false;
      }
      return true;
    },
    numberCheck:function(number){
      if (!(/(^[1-9]\d*$)/.test(number))) { 
          return false;
      }
      return true;
    },
    queryShopByShopId:function(){
      const db = wx.cloud.database()
      const self = this;
      // 查询商品
      db.collection('shops').where({
        shopId: this.data.shopId,
        shopStatus: this.data.shopStatus
      }).orderBy("updateTime", "desc").get({
        success: res => {
          if (res.data.length > 0) {
            this.setData({
              showShopList: true,
              queryResult: res.data
            })
          } else {
            this.setData({
              showShopList: false,
            })
          }
          console.log('[数据库] [查询记录] 成功: ', self.data.queryResult)
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    },
    onAllQuery: function () {
      const db = wx.cloud.database()
      const self = this;
      // 查询商品
      db.collection('shops').where({shopStatus:1}).orderBy("updateTime","desc").get({
        success: res => {
          if(res.data.length > 0){
            this.setData({
              showShopList : true,
              queryResult: res.data
            })
          }
          console.log('[数据库] [查询记录] 成功: ', self.data.queryResult)
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    },
    /**
     * 确认是否删除
     */
    confirmDeletDialog:function(e){
        this.setData({
          sureDelete:true,
          operatorShopId: e.currentTarget.id
        })
    },
    closeDeleteDialog: function(){
      this.setData({
        sureDelete: false,
        operatorShopId: null
      })
    },
    /**
     * 删除商品,标记删除，shopStatus=0
     */
    deleteShop:function(){
      if (this.data.operatorShopId != null && this.data.operatorShopId != ""){
        const db = wx.cloud.database()
        db.collection('shops').where({
          shopId: this.data.operatorShopId
        }).update({
          data:{
            shopStatus: 0
          },
          success: res => {
            wx.showToast({
              title: '删除成功',
            })
            this.setData({
              operatorShopId: null,
              sureDelete: false
            });
            this.onAllQuery();
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '删除失败',
            })
            console.error('[数据库] [删除记录] 失败：', err)
          }
        })
      }
    },
    stockChangeDialog:function(e){
      this.setData({
        showStockDialog: true,
        operatorShopId: e.currentTarget.id,
        stockChangeType: e.currentTarget.dataset.changetype,
        operatorShopCurrentStock: e.currentTarget.dataset.stock
      })
    },
    closeStockChangeDialog:function(e){
      this.clearChangeStockParam();
    },
    clearChangeStockParam:function(){
      this.setData({
        showStockDialog: false,
        operatorShopId: null,
        stockChangeType: null,
        changeStockNum: 1,
        operatorShopCurrentStock: 0
      })
    },
    /**
     * 减库存
     */
    subtractStockNum:function(){
      if (parseInt(this.data.changeStockNum) > 1){
          this.setData({
            changeStockNum: parseInt(this.data.changeStockNum) - 1
          })
      }
    },
    /**
     * 新增库存
     */
    addStockNum: function () {
      if (parseInt(this.data.changeStockNum) < parseInt(this.data.operatorShopCurrentStock)){
        this.setData({
          changeStockNum: parseInt(this.data.changeStockNum) + 1
        })
      }
    },
    /**
     * 更新库存
     */
    updateStock:function(){
      var updateStockVal = 0;
      if(this.data.stockChangeType == "add"){
        updateStockVal = parseInt(this.data.operatorShopCurrentStock) + parseInt(this.data.changeStockNum);
      }else{
        updateStockVal = parseInt(this.data.operatorShopCurrentStock) - parseInt(this.data.changeStockNum);
      }
      if(updateStockVal < 0){
        this.shopTip("库存修改失败，输入值有误！");
        return false;
      }
      const db = wx.cloud.database()
      db.collection('shops').where({
        shopId: this.data.operatorShopId
      }).update({
        data: {
          shopStock: updateStockVal
        },
        success: res => {
          this.shopTip("库存修改成功");
          this.clearChangeStockParam();
          this.onAllQuery();
          console.error('[数据库] [修改记录] 成功：', res)
        },
        fail: err => {
          this.shopTip("库存修改失败");
          console.error('[数据库] [修改记录] 失败：', err)
        }
      })
    },
    onPullDownRefresh() {
      console.log("aaa");
      // 上拉刷新
      if (!this.loading) {
        this.fetchArticleList(1, true).then(() => {
          // 处理完成后，终止下拉刷新
          wx.stopPullDownRefresh()
        })
      }
    },

  })