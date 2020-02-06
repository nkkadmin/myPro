Page({
  data:{
    showInput: "0",
    code: "", //暗号
  },
  bindInputCode:function(e){
    this.setData({
      code: e.detail.value
    })
  },
  toShop:function(){
    wx.switchTab({
      url: '../shop/shop'
    })
  },
  onLoad:function(){
    this.hasStrongCode();
  },
  /**
   * 获取缓存中的code
   */
  hasStrongCode:function(){
    var self = this;
    var res = wx.getStorageSync("code");
    this.setData({
      showInput: res != null > 0 ? "1" : "-1"
    });
  },
  checkCode: function (){
    var self = this;
    self.showLoading();
    if (self.data.showInput == "1"){
      self.toShop();
      self.hideLoading();
      return false;
    }
    if(self.data.code == null || self.data.code == ""){
      self.hideLoading();
      return false;
    }
    const db = wx.cloud.database()
    db.collection('passCode').where({
      anCode: self.data.code
    }).get({
        success: res => {
          self.hideLoading();
          console.log(res);
          if(res.data.length > 0){
            wx.setStorageSync("code", "123456");
            self.toShop();
          }else{
            self.showTip("暗号错误，请重新输入");
          }
        },
        fail: err => {
          self.hideLoading();
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
  },
  showTip: function (msg) {
    wx.showToast({
      icon: 'none',
      title: msg
    })
  },
  showLoading: function () {
    wx.showLoading({
      title: '数据加载中...',
    });
    var self = this;
    //防止长时间不出数据蒙版不关闭问题
    setTimeout(function () {
      self.hideLoading();
    }, 10000);
  },
  hideLoading: function () {
    wx.hideLoading();
  },
})