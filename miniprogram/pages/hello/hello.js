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
    if(res != null && res != ""){
      self.checkCodeHasDb(res,function(isTure){
        if(!isTure){
          console.log("校验code是否无效");
          self.setData({
            showInput: "-1"
          });
          return false;
        }
      })
    }
    self.setData({
      showInput: (res != null && res != "") ? "1" : "-1"
    });
  },
  /**
   * 判断code在数据库是否还存在
   *  return true code 有效
   *          false  code 无效
   */
  checkCodeHasDb:function(res,_callBack){
    var currentTime = new Date().getTime();
    var cacheTime = new Date(res.createTime).getTime();
    var diffTime = currentTime - cacheTime;
    //ms 转成 s
    var disss = diffTime / 1000;
    //如果超过12小时，需要校验一次数据库这个code是否还存在
    //12小时转成秒s
    var maxTimes = 60 * 60 * 12;
    if (disss < maxTimes){
        return _callBack(true);
    }
    this.doCheckCode(res.code,function(response){
      if (response != null && response.data.length > 0){
        res.createTime = new Date();
        wx.setStorageSync("code", res);
        return _callBack(true);
      }else{
        wx.removeStorageSync("code");
        return _callBack(false);
      }
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
    self.doCheckCode(self.data.code,function(res){
      self.hideLoading();
      if (res != null && res.data.length > 0) {
        var cachObj = {
          code: res.data[0].anCode,
          createTime: new Date()
        }
        wx.setStorageSync("code", cachObj);
        self.toShop();
      } else {
        self.showTip("暗号错误，请重新输入");
      }
    });
  },
  doCheckCode:function(code,_callBack){
    const db = wx.cloud.database()
    db.collection('passCode').where({
      anCode: code
    }).get({
      success: res => {
        return _callBack(res);
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err)
        return _callBack(null);
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