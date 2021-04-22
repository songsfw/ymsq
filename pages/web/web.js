//index.js

const app = getApp()

Page({
  data: {
    webUrl:'',
  },
  
  onShow: function () {
    
  },

  onLoad: function (options) {
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

  }
})
