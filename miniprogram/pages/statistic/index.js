var util = require("../../util/util.js")
Page({
  data: {
    todayResult: "",    //今日统计
    thisWeekResult: "", //本周
    thisMonthResult: "",  //本月
    currentDate: new Date(),  //当天时间
    thisMonthStartDate: "", //本月开始日期
    thisMonthEndDate: "",   //本月结束日期
    thisWeekStartDate: "",  //本周开始日期
    thisWeekEndDate: "",    //本周结束日期
    billInfos:[],             //账单详情
    showBillDialog: false,    //是否显示账单详情弹框
  },
  onLoad: function () {
    this.queryToday("today");
    this.queryThisWeek("week");
    this.queryThisMonth("month");
  },
  queryToday:function(type){
    //格式化当天日期 lg:2020-01-01
    var todayDate = util.dateFormat("YYYY-mm-dd", new Date());
    var todayStartTime = new Date(todayDate + " 00:00:00");
    var todayEndTime = new Date(todayDate + " 23:59:59");
    
    this.query(todayStartTime, todayEndTime, type)
  },
  queryThisWeek: function (type){
    var weekStartDateTime = new Date(util.weekStartDate() + " 00:00:00");
    var weekEndDateTime = new Date(util.weekEndDate() + " 23:59:59")
    this.query(weekStartDateTime, weekEndDateTime, type);
    this.setData({
      thisWeekStartDate: util.dateFormat("YYYY-mm-dd", weekStartDateTime),
      thisWeekEndDate: util.dateFormat("YYYY-mm-dd", weekEndDateTime),
    })
  },
  queryThisMonth:function(type){
    var monthStartDateTime = new Date(util.monthStartDate() + " 00:00:00");
    var monthEndDateTime = new Date(util.monthEndDate() + " 23:59:59");
    this.query(monthStartDateTime, monthEndDateTime, type);
    this.setData({
      thisMonthStartDate: util.dateFormat("YYYY-mm-dd", monthStartDateTime),
      thisMonthEndDate: util.dateFormat("YYYY-mm-dd", monthEndDateTime),
    })
  },
  showLoading:function(){
    wx.showLoading({
      title: '数据加载中...',
    });
    var self = this;
    //防止长时间不出数据蒙版不关闭问题
    setTimeout(function(){
      self.hideLoading();
    },10000);
  },
  hideLoading:function(){
    wx.hideLoading();
  },
  /**
   * 获取账单列表
   */
  moreBills:function(e){
    this.showLoading();
    var type = e.currentTarget.dataset.type;
    var start = null;
    var end = null;
    if (type == "todayBill"){
      var todayDate = util.dateFormat("YYYY-mm-dd", new Date());
      start = todayDate;
      end = todayDate;
    } else if (type == "weekBill"){
      start = this.data.thisWeekStartDate;
      end = this.data.thisWeekEndDate;
    } else {
      start = this.data.thisMonthStartDate;
      end = this.data.thisMonthEndDate;
    }
    this.query(new Date(start + " 00:00:00"),new Date(end + " 23:59:59"),"bill")
  },
  closeBillDialog:function(){
    this.setData({
      showBillDialog: false
    })
  },
  /**
   * 查询数据
   * @param startDate 开始时间
   * @param endDate    结束时间
   * @param type       查询今日/本周/当月
   */
  query: function (startDate, endDate, type){
    const self = this;
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('bills').where({
      createTime: _.and(_.gte(startDate), _.lte(endDate))
    }).orderBy("createTime","desc").get({
      success: res=>{
        self.doHandleResult(res.data, type)
        console.log("[数据查询] 成功",res)
      },
      fail: err=>{
        
        console.error("[数据库查询失败]", err)
      }
    })
  },
  /**
   * 查询结果处理
   */
  doHandleResult: function (arrayData, type){
    if(type == "bill"){
      var item = [];
      for (var i = 0; i < arrayData.length; i++) {
        arrayData[i].createTimeStr = util.dateFormat("YYYY-mm-dd HH:MM", arrayData[i].createTime);
        item.push(arrayData[i]);
      }
      this.setData({
        billInfos: item,
        showBillDialog: true
      });
      this.hideLoading();
    }else{
      var incomeNum = 0; //进货数量
      var outcomeNum = 0; //出货数量
      var incomePrice = 0.0; //收入
      var outcomePrice = 0.0; //支出
      for (var i = 0; i < arrayData.length; i++) {
        var item = arrayData[i];
        if (item.billType == "add") { //进货 支出
          incomeNum += parseInt(item.num)
          outcomePrice += parseFloat(item.price)
        } else {
          outcomeNum += parseInt(item.num)
          incomePrice += parseFloat(item.price)
        }
      }
      var info = {
        incomeNum: incomeNum,
        outcomeNum: outcomeNum,
        incomePrice: incomePrice,
        outcomePrice: outcomePrice,
        totalIncomePrice: incomePrice - outcomePrice
      }
      if (type == "today") {
        this.setData({
          todayResult: info
        })
      } else if (type == "week") {
        this.setData({
          thisWeekResult: info
        })
      } else if (type == "month") {
        this.setData({
          thisMonthResult: info
        })
      }
    }
  },
  toBuillInfo: function () {

  }
})