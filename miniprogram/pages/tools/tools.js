Page({
  data: {
    grids: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },
  onLoad:function(){
    this.getTabBar().setData({
      selected: 2,
      showFlag: ""
    })
  }
});