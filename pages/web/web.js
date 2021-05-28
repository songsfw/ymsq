//index.js

const app = getApp()

Page({
  data: {
    webUrl:'',
  },
  
  onShow: function () {
    
  },

  async onLoad (options) {
    let userInfo = wx.getStorageSync('userInfo')
    let addressInfo = wx.getStorageSync("addressInfo")
    let loginInfo = null
    if(!userInfo || !addressInfo){
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
    }

    let url = options.url || '';
    let toFollow = options.toFollow
    if(toFollow&&toFollow==1){
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      prevPage.setData({
        changeFollow: true
      })
    }
    console.log('url:',url);
    this.setData({
      webUrl:url
    })
    
  },
  onUnload: function (e) {
    console.log('unload');
    let pages = getCurrentPages(); // 子页面
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      if(prePage.route=="pages/proList/proList"){
        prePage.setDetailBack && prePage.setDetailBack(1);
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '原麦山丘',
      path: '/page/index/index',
      imageUrl:"../../image/share.jpg"
    }
  }
})
