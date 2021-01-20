Component({
  options:{
    styleIsolation:"apply-shared"
  },
  data: {
    selected: 0,
    color: "#333333",
    count:0,
    selectedColor: "#C1996B",
    list: [{
      "pagePath": "/pages/index/index",
      "icon":"/image/icon-home.png",
      "selectedIconPath": "/image/icon-home2.png", 
      "text": "首页"
    }, {
      "pagePath": "/pages/proList/proList",
      "icon":"/image/icon-type.png",
      "selectedIconPath": "/image/icon-type2.png", 
      "text": "分类"
    },{
      "pagePath": "/pages/chart/chart",
      "icon":"/image/icon-chart.png",
      "selectedIconPath": "/image/icon-chart2.png", 
      "text": "购物车"
    },{
      "pagePath": "/pages/user/user",
      "icon":"/image/icon-user.png",
      "selectedIconPath": "/image/icon-user2.png", 
      "text": "我的"
    }]
  },
  
  ready() {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        let safeArea = res.safeArea;
        if(res.screenHeight > safeArea.bottom){
          let btmHolder = res.screenHeight - safeArea.bottom
          that.setData({
            btmHolder:btmHolder
          })
        }
      }
    });
    
    // let userInfo,photo
    // if (wx.getStorageSync("userInfo")) {
    //   userInfo = JSON.parse(wx.getStorageSync("userInfo"))
    //   photo = userInfo.avatarUrl
    // }else{
    //   photo="../image/no-touxiang.png"
    // }
    // this.setData({
    //   photo:photo
    // })
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})