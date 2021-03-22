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
    console.log('url:',url);
    this.setData({
      webUrl:url
    })
    
  }
})
