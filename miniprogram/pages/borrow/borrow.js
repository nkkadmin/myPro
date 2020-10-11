var util = require("../../util/util.js")
var base = require("../../util/base.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    results:[], //列表数据
    showMaxImgDiloag: false, //显示大图
    maxImgPath: "",  //大图url
    maxImgInName: "",  //大图对应的借款人
    queryKeyWord: "",  //查询关键词
  },
  toBorrowEditUI:function(){
    wx.redirectTo({
      url: '/pages/borrowEdit/borrowEdit'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    _this.queryList();
  },
  bindInputValue:function(e){
    this.setData({
      queryKeyWord: e.detail.value
    })
  },
  //打开图片大图
  openMaxImg:function(e){
    let path = e.currentTarget.dataset.item.imgPath;
    if(path == ""){
      path = "/images/no-pic.png";
    }
    this.setData({
      showMaxImgDiloag: true,
      maxImgPath: path,
      maxImgInName: e.currentTarget.dataset.item.name
    })
  },
  closeMaxImg:function(){
    this.setData({
      showMaxImgDiloag: false,
      maxImgPath: ""
    })
  },
  buildImgParam:function(){
    var resultParam = [];
    for(var i = 0;i<this.data.results.length;i++){
      let item = this.data.results[i];
      if (item.picImgId == null || item.picImgId == ""){
        continue;
      }
      let obj = new Object();
      obj.index = i;
      obj.fileID = item.picImgId;
      obj.maxAge = 60 * 60;
      resultParam.push(obj);
    }
    return resultParam;
  },
  /**
   * 获取照片路径
   */
  queryImg:function(){
    var _this = this;
    const resultParam = _this.buildImgParam();
    console.log("获取图片url参数：",resultParam);
    wx.cloud.getTempFileURL({
      fileList: resultParam
    }).then(res => {
      if(res.fileList.length == 0){
        return false;
      }
      let tempResults = _this.data.results;
      for (var i = 0; i < res.fileList.length; i++){
        var resultItem = res.fileList[i];
        var fileIndex = -1;
        for (var j = 0; j < resultParam.length; j++) {
          var paramItem = resultParam[j];
          if (resultItem.fileID == paramItem.fileID){
            fileIndex = paramItem.index;
            break;
          }
        }
        if(fileIndex > -1){
          tempResults[fileIndex].imgPath = resultItem.tempFileURL;
        }
      }
      _this.setData({
        results: tempResults
      })
      console.log(_this.data.results)
    }).catch(error => {
      // handle error
    })
  },
  /**
   * 查询数据
   */
  queryList:function(){
    base.showLoading("正在获取数据");
    const db = wx.cloud.database()
    db.collection("borrow")
      .field({
        name: true,
        price: true,
        picImgId: true,
        shops:true,
        _id: true,
        borrowDate: true,
        status: true
      })
      .orderBy("updateTime","desc")
      .get({
        success:res=>{
          base.hideLoading();
          this.buildLoadResult(res);
          this.loadReturnMoneyRecord();
          this.queryImg();
          console.log("数据查询成功:", this.data.results);
        },
        fail:err=>{
          base.hideLoading();
          console.error("数据查询失败：",err)
        }
      });
  },
  /**
   * 根据借款人姓名查询
   */
  queryByName: function () {
    if (this.data.queryKeyWord == ""){
      this.queryList();
      return false;
    }
    base.showLoading("正在查询");
    const db = wx.cloud.database()
    db.collection("borrow")
      .where({
        name: this.data.queryKeyWord
      })
      .field({
        name: true,
        price: true,
        picImgId: true,
        shops: true,
        _id: true,
        borrowDate: true,
        status: true
      })
      .orderBy("updateTime", "desc")
      .get({
        success: res => {
          base.hideLoading();
          this.buildLoadResult(res);
          this.loadReturnMoneyRecord();
          this.queryImg();
          console.log("数据查询成功:", this.data.results);
        },
        fail: err => {
          base.hideLoading();
          console.error("数据查询失败：", err)
        }
      });
  },
  /**
   * 处理查询结果
   * res 查询结果
   */
  buildLoadResult:function(res){
    let temp = [];
    for (var i = 0; i < res.data.length; i++) {
      let item = res.data[i];
      if (item.shops != null && item.shops != "") {
        item.shops = JSON.parse(item.shops);
      }
      item.statusDesc = this.getStatusDesc(item.status);
      item.imgPath = "";
      temp.push(item);
    }
    this.setData({
      results: temp
    });
  },
  /**
   * status 解析
   */
  getStatusDesc:function(status){
    if(status == "1"){
      return "未还款";
    }
    if(status == "0"){
      return "部分还款";
    }
    if(status == "-1"){
      return "已还清";
    }
  },
  /**
   * 跳转详情页
   */
  infoUI:function(e){
    var _id = e.currentTarget.id;
    wx.redirectTo({
      url: '/pages/borrowEdit/borrowEdit?id='+_id+"&operator=select"
    })
  },
  buildLoadReturnMoneyParam: function () {
    var resultParam = [];
    for (var i = 0; i < this.data.results.length; i++) {
      let item = this.data.results[i];
      resultParam.push(item._id);
    }
    return resultParam;
  },
  /**
   * 加载还款记录
   */
  loadReturnMoneyRecord: function () {
    var _this = this;
    //借款id数组
    var borrowIds = _this.buildLoadReturnMoneyParam();
    if (borrowIds.length == 0){
      return false;
    }
    const db = wx.cloud.database();
    const _ = db.command
    db.collection("returnMoney")
      .where({borrowId: _.in(borrowIds)})
      .field({borrowId:true,price:true})
      .get({
        success: res => {
          if (res.data.length > 0) {
            let map = new Map();
            //处理数据，相同borrowId的price求和
            for (var i = 0; i < res.data.length; i++) {
              var borrowId = res.data[i].borrowId;
              var price = parseFloat(res.data[i].price);
              if(map.has(borrowId)){
                map.set(borrowId,map.get(borrowId) + price);
              }else{
                map.set(borrowId,price);
              }
            }
            //赋值给借款数据
            for (let item of map.keys()) {
              let price = map.get(item);
              for (var x = 0; x < _this.data.results.length;x++){
                var rs = _this.data.results[x];
                if (typeof (rs.returnMoney) != "undefined"){
                  continue;
                }
                if(rs._id == item){
                  rs.returnMoney = price;
                  rs.status = parseFloat(rs.price) <= price ? "-1" : "0";
                  rs.statusDesc = _this.getStatusDesc(rs.status);
                }
              }
            }
          }
        },
        fail: err => {
          console.error("还款记录加载异常", err);
        }
      })
  },
})