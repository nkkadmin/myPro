// pages/borrowEdit/borrowEdit.js
var util = require("../../util/util.js")
var base = require("../../util/base.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: "", //数据主键
    operator: "add", //页面操作，默认新增，select：查看，update：编辑
    /**
     * 关联商品
     */
    bindShopList: [],
    picImgPath: "", //借款人照片路径
    form: {
      shops: "", //关联商品，用string json存储
      name: "", //借款人姓名
      price: 0, //借款金额
      borrowDate: "", //借款日期 
      picImgId: "", //借款人照片id
      status: 1, //还款状态：1未还款，0 部分还款，-1： 已还清
    },
    showMaxImg: false, //显示图片大图
    isReturnMoney: false, //是否显示还款弹框
    returnMoneyRecoeds: [], //还款记录
    rePayMent: "", //仍需还款
    returnMoney: {
      borrowId: "", //借款数据id
      price: "", //还款金额
    },
    totalReturnMoney: 0, //总还款金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this;
    _this.clearParam();
    var _id = options.id; //"d9ea35c25e46522a0f96cc032f489bd7";//
    var _operator = options.operator;
    if (typeof(_operator) != "undefined") {
      _this.setData({
        operator: _operator
      })
    }
    if (_id != null && _id != "" && typeof(_id) != "undefined") {
      _this.setData({
        id: _id
      })
      //获取详情 
      _this.queryById(function(item) {
        if (item != null) {
          console.log("res", item);
          _this.initBorrowInfo(item);
          _this.queryImg(item);
          _this.loadReturnMoneyRecord();
        }
      });
    } else {
      this.setData({
        "form.borrowDate": util.dateFormat("YYYY-mm-dd", new Date())
      })
    }
  },
  /**
   * 加载还款记录
   */
  loadReturnMoneyRecord: function() {
    var _this = this;
    wx.cloud.database().collection("returnMoney")
      .where({
        borrowId: _this.data.id
      })
      .orderBy("createTime", "desc")
      .get({
        success: res => {
          if (res.data.length > 0) {
            var results = [];
            for (var i = 0; i < res.data.length; i++) {
              var item = res.data[i];
              item.createTimeStr = util.dateFormat("YYYY-mm-dd HH:MM:SS", item.createTime);
              results.push(item);
            }
            _this.setData({
              returnMoneyRecoeds: results,
            })
            _this.setData({
              totalReturnMoney: _this.getReturnMoneyTotal(),
              rePayMent: parseFloat(_this.data.form.price) - _this.getReturnMoneyTotal()
            })
          }
        },
        fail: err => {
          console.error("还款记录加载异常", err);
        }
      })
  },
  /**
   * 清空参数
   */
  clearParam: function() {
    this.setData({
      id: "",
      operator: "add",
      // bindShopList: [],
      picImgPath: "",
      showMaxImg: false,
      "form.shops": "",
      "form.name": "",
      "form.price": "",
      "form.borrowDate": "",
      "form.picImgId": "",
      "form.status": 1,
    })
  },
  /**
   * 初始化数据
   */
  initBorrowInfo: function(item) {
    this.setData({
      "form.shops": item.shops, //关联商品，用string json存储
      "form.name": item.name, //借款人姓名
      "form.price": item.price, //借款金额
      "form.borrowDate": item.borrowDate, //借款日期 
      "form.picImgId": item.picImgId, //借款人照片id
      "form.status": 1, //还款状态：1未还款，0 部分还款，-1： 已还清
      bindShopList: item.shops != "" ? JSON.parse(item.shops) : "",
      rePayMent: item.price
    })
    console.log(this.data.bindShopList)
  },
  openMaxImg: function() {
    this.setData({
      showMaxImg: true
    })
  },
  closeMaxImg: function() {
    this.setData({
      showMaxImg: false
    })
  },
  /**
   * 扫码商品
   */
  scanShop: function() {
    var self = this;
    //调用扫码插件
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.showLoading({
          title: '正在识别商品',
        })
        const shopId = res.result;
        //判断商品是否关联，防止重复关联
        if (self.checkShopUnion(shopId)) {
          //查询商品
          self.queryShopByShopId(shopId);
        }else{
          wx.hideLoading();
          wx.showModal({
            title: '该商品已经关联',
            content: shopId + '该商品已经关联，不需要再次关联？',
            confirmText: "是",
            cancelText: "否",
            success: function (res) {
            }
          });
        }
      }
    })
  },
  checkShopUnion: function(shopId) {
    let shops = this.data.bindShopList;
    if (shopId == null || shopId == "") {
      return false;
    }
    if (shops == null || shops.length == 0) {
      return true;
    }
    for (var i = 0; i < shops.length; i++) {
      if (shopId == shops[i].shopId) {
        return false;
      }
    }
    return true;
  },
  /**
   * 查询商品
   */
  queryShopByShopId: function(shopId) {
    let _this = this;
    const db = wx.cloud.database()
    db.collection('shops').where({
      shopId: shopId,
      shopStatus: 1
    }).field({
      shopId: true,
      shopName: true,
      shopPrice: true
    }).get({
      success: res => {
        wx.hideLoading();
        if (res.data.length > 0) {
          let tempShops = _this.data.bindShopList;
          res.data[0].count = 1;
          tempShops.push(res.data[0]);
          this.setData({
            bindShopList: tempShops
          })
          _this.celBorrwoPrice();
        } else {
          wx.showModal({
            title: '该商品不存在',
            content: shopId + '对应的商品不存在(或者识别条形码有误，请重新识别)，是否前往新增商品？',
            confirmText: "是",
            cancelText: "否",
            success: function(res) {
              console.log(res);
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/shop/shop'
                })
              } else {
                console.log('否')
              }
            }
          });
        }

        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.hideLoading();
        this.shopTip("查询记录失败");
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  /**
   * 获取关联商品的总金额
   */
  getBingShopTotalPrice:function(){
    let shops = this.data.bindShopList;
    if (shops == null || shops.length == 0) {
      return 0;
    }
    let totalPrice = 0;
    for (let i = 0; i < shops.length; i++) {
      // 商品价格
      let price = shops[i].shopPrice;
      // 商品数量
      let count = shops[i].count;
      // 计算价格
      totalPrice += price * count;
    }
    return totalPrice;
  },
  /**
   * 计算借款金额
   */
  celBorrwoPrice:function(){
    let _this = this;
    // 获取关联的商品
    this.setData({
      form: {
        price: this.getBingShopTotalPrice(),
        shops: _this.data.form.shops, //关联商品，用string json存储
        name: _this.data.form.name, //借款人姓名
        borrowDate: _this.data.form.borrowDate, //借款日期 
        picImgId: _this.data.form.picImgId, //借款人照片id
        status: 1, //还款状态：1未还款，0 部分还款，-1： 已还清
      }
    })
  },
  /**
   * 获取照片路径
   */
  queryImg: function(item) {
    var _this = this;
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: item.picImgId,
        maxAge: 60 * 60
      }]
    }).then(res => {
      if (res.fileList.length == 0) {
        return false;
      }
      _this.setData({
        picImgPath: res.fileList[0].tempFileURL
      })
    }).catch(error => {
      // handle error
    })
  },
  /**
   * 重云数据库删除图片
   */
  deleteImg: function() {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定删除此图片吗？',
      success(res) {
        if (res.confirm) {
          _this.doDelImg();
        } else if (res.cancel) {
          return false;
        }
      }
    })
  },
  doDelImg: function() {
    var _this = this;
    if (_this.data.form.picImgId == null || _this.data.form.picImgId == "") {
      base.showTip("删除失败，图片不存在");
      return false;
    }
    wx.cloud.deleteFile({
      fileList: [_this.data.form.picImgId],
      success: res => {
        // handle success
        if (res.errMsg == "cloud.deleteFile:ok") {
          base.showTip("图片删除成功");
          //更新数据
          _this.setData({
            "form.picImgId": ""
          })
          _this.doUpdate();
        }
      },
      fail: err => {
        // handle error
      },
      complete: res => {
        // ...
      }
    })
  },
  reduceShopNumber: function(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.bindShopList[index].count > 1) {
      this.data.bindShopList[index].count--;
      this.setData({
        bindShopList: this.data.bindShopList
      })
      this.celBorrwoPrice();
    }
  },
  addShopNumber: function(e) {
    const index = e.currentTarget.dataset.index;
    this.data.bindShopList[index].count++;
    this.setData({
      bindShopList: this.data.bindShopList
    })
    this.celBorrwoPrice();
  },
  /**
   * 删除关联的商品
   */
  deleteInnerShop: function(e) {
    const delIndex = e.currentTarget.dataset.index;
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '确定删除【' + _this.data.bindShopList[delIndex].shopName + '】商品吗？',
      success(res) {
        if (res.confirm) {
          let oldShopList = _this.data.bindShopList;
          //删除下标为delIndex的对象
          /**
           * splice : 第一个参数，删除或添加元素下标
           *          第二个参数，1表示删除几个元素
           */
          oldShopList.splice(delIndex, 1);
          _this.setData({
            bindShopList: oldShopList
          })
          _this.celBorrwoPrice();
        } else if (res.cancel) {
          console.log('用户点击取消')
          return false;
        }
      }
    })

  },
  /**
   * 根据id查询记录
   */
  queryById: function(_callBack) {
    let _this = this;
    const db = wx.cloud.database()
    db.collection("borrow").where({
      _id: _this.data.id
    }).get({
      success: res => {
        return _callBack(res.data[0]);
      },
      fail: err => {
        console.error("查询异常")
        return _callBack(null);
      }
    })
  },
  /**
   * 显示修改样式
   */
  updateUI: function() {
    this.setData({
      operator: "update",
    })
  },
  doUpdate: function() {
    let _this = this;
    if (_this.data.id == null || _this.data.id == "") {
      wx.hideLoading();
      base.showTip("修改失败，主健ID不能为空");
      return false;
    }
    let params = _this.data.form;
    const db = wx.cloud.database()
    db.collection("borrow").where({
      _id: _this.data.id
    }).update({
      data: {
        shops: params.shops, //关联商品，用string json存储
        name: params.name, //借款人姓名
        price: params.price, //借款金额
        borrowDate: params.borrowDate, //借款日期 
        picImgId: params.picImgId, //借款人照片id
        updateTime: new Date()
      },
      success: res => {
        wx.hideLoading();
        base.showTip("修改成功");
        wx.redirectTo({
          url: '/pages/borrow/borrow'
        })
      },
      fail: err => {
        wx.hideLoading();
        base.showTip("借款信息修改失败，请重试");
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  save: function() {
    let _this = this;
    wx.showLoading({
      title: '正在保存',
    })
    if (!_this.checkSaveParam()) {
      wx.hideLoading();
      return false;
    }

    // 校验借款金额与关联商品的总金额是否相等
    let shops = this.data.bindShopList;
    if (shops != null && shops.length > 0) {
      let shopTotalPrice = this.getBingShopTotalPrice();
      if (shopTotalPrice != _this.data.form.price) {
        // 价格不一致，提示是否继续
        wx.showModal({
          title: '提示',
          content: '关联商品价格总金额与输入的借款金额不一致，是否继续保存?',
          confirmText: "是",
          cancelText: "否",
          success: function (res) {
            console.log(res);
            if (res.confirm) {
              _this.doSaveOrUpdateBefore();
            } else {
              base.showTip("已取消保存");
            }
          }
        });
      } else {
        _this.doSaveOrUpdateBefore();
      }
    }else{
      _this.doSaveOrUpdateBefore();
    }
  },
  /**
   * 新增或者更新前数据封装
   */
  doSaveOrUpdateBefore:function(){
    //组装参数
    this.buildParam();
    if (this.data.operator == "add") {
      this.doSave();
    } else if (this.data.operator == "update") {
      this.doUpdate();
    } else {
      wx.hideLoading();
    }
  },
  /**
   * 保存
   */
  doSave: function() {
    let _this = this;
    let params = _this.data.form;
    const db = wx.cloud.database()
    db.collection("borrow").add({
      data: {
        shops: params.shops, //关联商品，用string json存储
        name: params.name, //借款人姓名
        price: params.price, //借款金额
        borrowDate: params.borrowDate, //借款日期 
        picImgId: params.picImgId, //借款人照片id
        status: 1, //还款状态：1未还款，0 部分还款，-1： 已还清
        createTime: new Date(),
        updateTime: new Date()
      },
      success: res => {
        wx.hideLoading();
        base.showTip("新增成功");
        var start = new Date().getTime();
        while (true) {
          if (new Date().getTime() - start > 1000) {
            break;
          }
        }
        wx.redirectTo({
          url: '/pages/borrow/borrow'
        })
      },
      fail: err => {
        wx.hideLoading();
        base.showTip("借款信息新增失败，请重试");
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  /**
   * 构建form参数
   */
  buildParam: function() {
    if (this.data.bindShopList != null && this.data.bindShopList.length > 0) {
      this.setData({
        "form.shops": JSON.stringify(this.data.bindShopList)
      })
    }
  },
  /**
   * 参数校验
   *    必填：借款人，借款金额，借款日期
   * 
   */
  checkSaveParam: function() {
    let formInfo = this.data.form;
    if (formInfo.name == null || formInfo.name == "") {
      base.showTip("请输入借款人");
      return false;
    }
    if (formInfo.price == null || formInfo.price == "") {
      base.showTip("请输入借款金额")
      return false;
    }
    if (formInfo.borrowDate == null || formInfo.borrowDate == "") {
      base.showTip("请选择借款日期");
      return false;
    }
    
    return true;
  },
  bindNameInput: function(e) {
    this.setData({
      "form.name": e.detail.value
    })
  },
  bindPriceInput: function(e) {
    this.setData({
      "form.price": e.detail.value
    })
  },
  bindReturnPriceInput: function(e) {
    this.setData({
      "returnMoney.price": e.detail.value
    })
  },
  /**
   * 选择借款日期
   */
  bindDateChange: function(e) {
    this.setData({
      "form.borrowDate": e.detail.value
    })
  },
  uploadBorrowImg: function() {
    var _this = this;
    if (_this.data.operator == "select") {
      return false;
    }
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        })
        let filePath = res.tempFilePaths[0]
        let tempPath = filePath.substring("http://tmp/".length, filePath.length)
        // 上传图片
        const cloudPath = 'my-image-' + tempPath
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            _this.setData({
              "form.picImgId": res.fileID,
              picImgPath: filePath
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  /**
   * 获取上传图片的真实路径
   */
  getUploadImgPath: function(fileId, _callBack) {
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: fileId,
        maxAge: 60 * 60, // one hour
      }]
    }).then(res => {
      return _callBack(res)
    }).catch(error => {
      // handle error
    })
  },
  /**
   * 还款Diloag
   */
  returnMoneyUI: function() {
    var _this = this;
    _this.setData({
      isReturnMoney: true,
      "returnMoney.borrowId": _this.data.id
    })
  },
  closeReturnMoney: function() {
    this.setData({
      isReturnMoney: false
    })
  },
  /**
   * 获取已经还款总金额
   */
  getReturnMoneyTotal: function() {
    if (this.data.returnMoneyRecoeds.length == 0) {
      return 0;
    }
    var total = 0;
    for (var i = 0; i < this.data.returnMoneyRecoeds.length; i++) {
      total += parseFloat(this.data.returnMoneyRecoeds[i].price);
    }
    return total;
  },
  returnAllMoney: function() {
    this.setData({
      "returnMoney.price": this.data.rePayMent
    })
  },
  /**
   * 还钱
   */
  returnMoney: function() {
    var _this = this;
    if (_this.data.returnMoney.price == null || _this.data.returnMoney.price == "") {
      base.showTip("请输入还款金额");
      return false;
    }
    if (parseFloat(_this.data.returnMoney.price) > parseFloat(_this.data.rePayMent)) {
      base.showTip("还款金额过多，请重新输入");
      return false;
    }
    if (_this.data.id == "") {
      base.showTip("修改失败，借款id为空");
      return false;
    }
    _this.doReturnMoney();
    _this.setData({
      "returnMoney.price": ""
    })
    _this.loadReturnMoneyRecord();
  },
  doReturnMoney: function() {
    let _this = this;
    let params = _this.data.returnMoney;
    wx.cloud.database().collection("returnMoney").add({
      data: {
        borrowId: params.borrowId,
        price: params.price,
        createTime: new Date(),
        updateTime: new Date()
      },
      success: res => {
        base.showTip("还款成功");
        _this.closeReturnMoney();
      },
      fail: err => {
        base.showTip("还款异常，请重试");
        console.error("还款异常", err);
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})