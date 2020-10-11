var util = require("../../util/util.js")
Page({
  data:{
    listResult:[], //账单列表数据
    pageStart:0,
    pageSize:10,
    paySelectFlag: false,  //支付查询状态是否选中
    queryAllFlag: true,   //塞选全部
    inComeSelectFlag: false,  //收入查询状态是否选中
    checkboxItems: [
      { name: '收入', value: '0', checked: true },
      { name: '支出', value: '1' }
    ],
    appendResult: false,
    loading: true,  //正在加载数据
  },
  onLoad: function () {
    this.getTabBar().setData({
      selected: 1,
      showFlag: ""
    })
    this.setData({
      listResult: []
    })
    this.query();
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
  
  getStartPageNum: function () {
    var _pageStart = this.data.pageStart;
    this.setData({
      pageStart: this.data.pageSize + _pageStart
    })
  },
  /**
   * 改变查询条件
   */
  queryChangeParam:function(e){
    this.setData({
      pageStart: 0,
      listResult: []
    })
    var type = e.currentTarget.dataset.type;
    
    if (type == 'pay') {
      this.setData({
        paySelectFlag: true,
        inComeSelectFlag: false,
        queryAllFlag: false
      })
    } else if (type == 'income') {
      this.setData({
        paySelectFlag: false,
        inComeSelectFlag: true,
        queryAllFlag: false
      })
    } else {
      this.setData({
        paySelectFlag: false,
        inComeSelectFlag: false,
        queryAllFlag: true
      })
    }
    this.query();
  },
  /**
   * 搜索 
   */
  query:function(){
    this.startLoading();
    var queryType = "all";
    if (this.data.paySelectFlag){ //查询支出
      queryType = "add"
    } else if (this.data.inComeSelectFlag){ //查询收入
      queryType = "subtract"
    } else {//查询全部
      this.queryAll();
      this.endLoading();
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
          this.endLoading();
          this.buildLoadResults(res);
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          this.endLoading();
          this.showTip("查询记录失败");
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
  },
  /**
   * 查询全部数据
   */
  queryAll: function () {
    var self = this;
    const db = wx.cloud.database()
    db.collection('bills')
      .orderBy("createTime", "desc")
      .skip(self.data.pageStart)
      .limit(self.data.pageSize)
      .get({
        success: res => {
          self.buildLoadResults(res);
          console.log('[数据库] [查询记录] 成功: ', res)
        },
        fail: err => {
          this.showTip("查询记录失败");
          self.endLoading();
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
  },
  /**
   * 将查询后的数据处理
   * res 查询结果
   */
  buildLoadResults:function(res){
    var _this = this;
    if (res.data.length > 0) {
      var oldItem = [];
      if (_this.data.appendResult) {
        oldItem = _this.data.listResult
      }
      for (var i = 0; i < res.data.length; i++) {
        res.data[i].createTimeStr = util.dateFormat("YYYY-mm-dd HH:MM:SS", res.data[i].createTime);
        oldItem.push(res.data[i]);
      }
      _this.setData({
        listResult: oldItem,
        appendResult: false
      })
    }
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
    this.query();
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
    this.query();
  },
  // checkboxChange: function (e) {
  //   console.log('checkbox发生change事件，携带value值为：', e.detail.value);

  //   var checkboxItems = this.data.checkboxItems, values = e.detail.value;
  //   for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
  //     checkboxItems[i].checked = false;

  //     for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
  //       if (checkboxItems[i].value == values[j]) {
  //         checkboxItems[i].checked = true;
  //         break;
  //       }
  //     }
  //   }
  //   this.setData({
  //     checkboxItems: checkboxItems
  //   });
  // },
  
});