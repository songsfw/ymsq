const api = require('../utils/api.js')
var app = getApp()
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
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      console.log(this.data.count)
      // let addressInfo = wx.getStorageSync("addressInfo")
      // let city_id = addressInfo&&JSON.parse(addressInfo).city_id
      // let data = {
      //   city_id:city_id
      // }
      // api.getChartData(data).then(res => {
      //   console.log(res);
      //   this.setData({
      //     count:res.total_num
      //   })
      // })
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  ready() {
    //let that = this
    // wx.getSystemInfo({
    //   success: function (res) {
    //     let safeArea = res.safeArea;
    //     if(res.screenHeight > safeArea.bottom){
    //       let btmHolder = res.screenHeight - safeArea.bottom
    //       that.setData({
    //         btmHolder:btmHolder
    //       })
    //     }
    //   }
    // });
    let btmHolder = wx.getStorageSync('btmHolder')
    if(btmHolder && btmHolder>0){
      this.setData({
        btmHolder:btmHolder
      })
    }else{
      app.getBtmHolder().then(res=>{
        this.setData({
          btmHolder:res
        })
      })
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      // this.setData({
      //   selected: data.index
      // })
    }
  }
})