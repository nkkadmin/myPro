var util = require("../../util/util.js")
Page({
  data:{
    listResult:[], //账单列表数据
    pageStart:0,
    pageSize:10,
    paySelectFlag: true,  //支付查询状态是否选中
    inComeSelectFlag: true,  //收入查询状态是否选中
    checkboxItems: [
      { name: '收入', value: '0', checked: true },
      { name: '支出', value: '1' }
    ],
    appendResult: false,
    loading: false,  //正在加载数据
  },
  onLoad: function () {
    this.getTabBar().setData({
      selected: 1,
      showFlag: ""
    })
    this.queryList();
  },
  startLoading:function(){
    this.setData({
      loading:true
    })
  },
  endLoading: function () {
    this.setData({
      loading: false
    })
  },
  queryList:function(){
    var self = this;
    self.startLoading();
    const db = wx.cloud.database()
    // 查询商品
    db.collection('bills')
      .orderBy("createTime", "desc")
      .skip(self.data.pageStart)
      .limit(self.data.pageSize)
      .get({
        success: res => {
          
          if (res.data.length > 0) {
            var oldItem = [];
            if (self.data.appendResult) {
              oldItem = self.data.listResult
            }
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].createTimeStr = util.dateFormat("YYYY-mm-dd HH:MM:SS", res.data[i].createTime);
              oldItem.push(res.data[i]);
            }
            self.setData({
              listResult: oldItem,
              appendResult: false
            })
          }
          
          self.endLoading();
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          this.showTip("查询记录失败");
          self.endLoading();
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
  },
  getStartPageNum: function () {
    var _pageStart = this.data.pageStart;
    this.setData({
      pageStart: this.data.pageSize + _pageStart
    })
  },
  queryParamChange:function(e){
    this.setData({
      pageStart: 0
    })
    var type = e.currentTarget.dataset.type;
    var queryType = "all";
    if(type == 'pay'){
       this.setData({
         paySelectFlag: !this.data.paySelectFlag
       })
    }else{
      this.setData({
        inComeSelectFlag: !this.data.inComeSelectFlag
      })
    }
    if (this.data.paySelectFlag && this.data.inComeSelectFlag){
      this.queryList();
      return false;
    } else if (this.data.paySelectFlag && !this.data.inComeSelectFlag){
      queryType = "subtract"
    } else if (!this.data.paySelectFlag && this.data.inComeSelectFlag){
      queryType = "add"
    } else{
      this.showTip("至少选中一个查询条件");
      return false;
    }
    const db = wx.cloud.database()
    // 查询商品
    db.collection('bills')
      .where({
        billType: queryType
      })
      .orderBy("createTime", "desc")
      .skip(this.data.pageStart)
      .limit(this.data.pageSize)
      .get({
        success: res => {
          if (res.data.length > 0) {
            var temp = [];
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].createTimeStr = util.dateFormat("YYYY-mm-dd HH:MM:SS", res.data[0].createTime);
              temp.push(res.data[i]);
            }
            this.setData({
              listResult: temp
            })
          }

          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          this.showTip("查询记录失败");
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
  },
  showTip: function (msg) {
    wx.showToast({
      icon: 'none',
      title: msg
    })
  },
  /**
     * 下拉事件
     */
  onPullDownRefresh() {
    this.setData({
      pageStart:0
    })
    // 上拉刷新
    this.queryList();
    // 处理完成后，终止下拉刷新
    wx.stopPullDownRefresh();
  },
  /**
     * 上拉加载更多
     */
  onReachBottom: function () {
    this.getStartPageNum();
    this.setData({
      appendResult: true
    })
    this.queryList();
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      checkboxItems: checkboxItems
    });
  },
  
});