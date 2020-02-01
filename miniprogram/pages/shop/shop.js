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
      updateShopInfoFlag: false, //更新数据标记
      updateShopItem: null,   //更新商品信息
      operatorShopInfoLoading: false,
      loading: false,    //下拉刷新
      scanLoading:false,
      scanTitle: "扫条形码识别商品",
      pageStart: 0, //当前页
      pageSize: 10, //页加载数据数量
      appendResult: false, //是否拼接数据，只有上拉分页才会拼接
    },
    onLoad:function(){
      this.getTabBar().setData({
        selected: 0,
        showFlag: ""
      })
      this.onAllQuery();
    },
    scanShop:function(){
      var self = this;
      //调用扫码插件
      // 只允许从相机扫码
      wx.scanCode({
        onlyFromCamera: true,
        success(res) {
          //商品条形码id
          self.setData({
            shopId : res.result,
            scanLoading: true,
            scanTitle: "正在识别"
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
      var self = this;
      self.setData({
        operatorShopInfoLoading:true
      })
      if(!this.checkAddInput()){
        self.setData({
          operatorShopInfoLoading: false
        })
        return false;
      }
      //校验shopId是否已经存在
      this.checkShopIdExist(function(res){
        if(res){
          self.setData({
            operatorShopInfoLoading: false
          })
          return false;
        }
        console.log("shopId未新增");
        const db = wx.cloud.database()
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
            self.setData({
              operatorShopInfoLoading: false
            });
            self.setData({
              updateShopItem:{
                shopId: self.data.shopId,
                shopName: self.data.shopName,
                shopPrice: self.data.shopPrice
              },
              changeStockNum: self.data.shopStock,
              stockChangeType: "add"
            })
            //创建账单
            self.createBill();
            self.clearAddInput();
            self.shopTip("新增记录成功");
            setTimeout(function () {
              self.onAllQuery();
            }, 500);
            console.log('[数据库] [新增记录] 成功，记录: ', res)
            
          },
          fail: err => {
            self.shopTip("商品新增失败");
            console.error('[数据库] [新增记录] 失败：', err)
            self.setData({
              operatorShopInfoLoading: false
            })
          }
        })
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
    checkShopIdExist:function(_callBack){
      const db = wx.cloud.database()
      // 查询商品
      db.collection('shops').where({
        shopId: this.data.shopId,
        shopStatus: 1
      }).get({
        success: res => {
          if (res.data.length > 0) {
            this.shopTip(this.data.shopId + '已经存在数据，不能再次添加')
            return _callBack(true);
          }
          return _callBack(false);
        },
        fail: err => {
          this.shopTip("数据查询失败");
          console.error('[数据库] [查询记录] 失败：', err)
          return _callBack(false);
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
      // 查询商品
      db.collection('shops').where({
        shopId: this.data.shopId,
        shopStatus: 1
      }).get({
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
          this.setData({
            scanLoading: false,
            scanTitle: "扫条形码识别商品"
          })
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          this.shopTip("查询记录失败");
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    },
    getStartPageNum:function(){
       var _pageStart = this.data.pageStart;
       this.setData({
         pageStart: this.data.pageSize + _pageStart
       })
    },
    onAllQuery: function () {
      var self = this;
      self.setData({
        loading:true
      })
      const db = wx.cloud.database()
      // 查询商品
      db.collection('shops')
            .where({shopStatus:1})
            .orderBy("updateTime","desc")
            .skip(self.data.pageStart)
            .limit(self.data.pageSize)
            .get({
        success: res => {
          if(res.data.length > 0){
            this.setData({
              showShopList : true
            })
            if(this.data.appendResult){
              var tempResult = res.data
              tempResult: res.data
              var oldResult = self.data.queryResult.concat();
              for (var i = 0; i < tempResult.length; i++) {
                oldResult.push(tempResult[i]);
              }
              self.setData({
                queryResult: oldResult,
                appendResult: false,
                loading: false
              })
            }else{
              self.setData({
                queryResult: res.data,
                loading: false
              })
            }
            
          }
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          this.shopTip("查询记录失败");
          self.setData({
            loading: false
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
            this.shopTip("删除成功");
            this.setData({
              operatorShopId: null,
              sureDelete: false
            });
            this.onAllQuery();
          },
          fail: err => {
            this.shopTip("删除失败");
            console.error('[数据库] [删除记录] 失败：', err)
          }
        })
      }
    },
    stockChangeDialog:function(e){
      this.clearChangeStockParam();
      var item = e.currentTarget.dataset.item
      this.setData({
        showStockDialog: true,
        operatorShopId: item.shopId,
        stockChangeType: e.currentTarget.dataset.changetype,
        operatorShopCurrentStock: item.shopStock,
        updateShopItem: item
      })
    },
    closeStockChangeDialog:function(e){
      this.setData({
        showStockDialog: false
      })
      this.clearChangeStockParam();
    },
    clearChangeStockParam:function(){
      this.setData({
        operatorShopId: null,
        stockChangeType: null,
        changeStockNum: 1,
        operatorShopCurrentStock: 0,
        updateShopItem: null
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
          this.setData({
            showStockDialog: false
          })
          this.shopTip("库存修改成功");
          //创建账单数据
          this.createBill();
          this.onAllQuery();
          console.log('[数据库] [修改记录] 成功：', res)
        },
        fail: err => {
          this.shopTip("库存修改失败");
          console.error('[数据库] [修改记录] 失败：', err)
        }
      })
    },
    /**
     * 创建账单
     */
    createBill:function(){
      const db = wx.cloud.database()
      db.collection('bills').add({
        data:{
          shopId: this.data.updateShopItem.shopId,
          shopName: this.data.updateShopItem.shopName,
          num: this.data.changeStockNum,
          price: this.data.changeStockNum * this.data.updateShopItem.shopPrice,
          billType: this.data.stockChangeType,
          createTime: new Date()
        },
        success: res=>{
          console.error('[数据库] [创建账单] 成功：', res)
        },
        fail: err=>{
          console.error('[数据库] [创建账单] 失败：', err)
        }
      })
    },
    /**
     * 更新商品信息
     */
    updateShopInfo: function () {
      this.setData({
        operatorShopInfoLoading: true
      })
      if(!this.checkAddInput()){
        this.setData({
          operatorShopInfoLoading: false
        })
        return false;
      }
      
      const db = wx.cloud.database()
      db.collection('shops').where({
        shopId: this.data.shopId
      }).update({
        data: {
          shopId: this.data.shopId,
          shopName: this.data.shopName,
          shopPrice: this.data.shopPrice,
          shopDesc: this.data.shopDesc,
          shopStock: this.data.shopStock,
          updateTime: new Date()
        },
        success: res => {
          this.setData({
            operatorShopInfoLoading: false
          })
          this.shopTip("商品修改成功");
          this.clearAddInput();
          this.onAllQuery();
          this.setData({
            updateShopInfoFlag: false
          })
          console.error('[数据库] [修改记录] 成功：', res)
        },
        fail: err => {
          this.setData({
            operatorShopInfoLoading: false
          })
          this.shopTip("商品修改失败");
          console.error('[数据库] [修改记录] 失败：', err)
        }
      })
    },
    showUpdateShopInfo:function(e){
      var item = e.currentTarget.dataset.item;
        this.setData({
          shopId: item.shopId,
          shopName: item.shopName,
          shopStock: item.shopStock,
          shopPrice: item.shopPrice,
          shopDesc: item.shopDesc,
          showShopList: false,
          updateShopInfoFlag: true
        })
    },
    /**
     * 下拉事件
     */
    onPullDownRefresh() {
      // 上拉刷新
      if (this.data.showShopList) {
        this.setData({
          pageStart: 0
        })
        this.onAllQuery();
        // 处理完成后，终止下拉刷新
        wx.stopPullDownRefresh();
      }
    },
    /**
     * 上拉加载更多
     */
    onReachBottom: function () {
      this.getStartPageNum();
      this.setData({
        appendResult:true
      })
      this.onAllQuery();
      
    }
  })