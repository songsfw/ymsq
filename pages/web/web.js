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
    
  }
})
