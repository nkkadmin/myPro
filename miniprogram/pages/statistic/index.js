Page({
  data: {
    content:"页面正在构建中，请耐心等待..."
  },
  onLoad: function () {
    this.getTabBar().setData({
      selected: 2,
      showFlag: ""
    })
  }
})