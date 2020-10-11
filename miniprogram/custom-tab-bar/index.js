Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/shop/shop",
      iconPath: "/images/icon_shop.png",
      selectedIconPath: "/images/icon_shop_HL.png",
      text: "商品"
      }, {
        pagePath: "/pages/bill/bill",
        iconPath: "/images/icon_bill.png",
        selectedIconPath: "/images/icon_bill_HL.png",
        text: "账单"
      }, {
        pagePath: "/pages/tools/tools",
      iconPath: "/images/icon_tools.png",
      selectedIconPath: "/images/icon_tools_HL.png",
      text: "小工具"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url,success:function(e){
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return
          page.onLoad();
        }
      })
      this.setData({
        selected: data.index
      })
    }
  }
})