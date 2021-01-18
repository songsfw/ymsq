const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    mallLi:null,
    shopLi:null,
    usedLi:null,
    expiredLi:null,
    pageNum:1,
    noMoreData:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let end = new Date().getFullYear()
    let userInfo = wx.getStorageSync('userInfo')
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      user_id:userInfo.user_id
    })
  },
  switchTab: function (e) {
    var that = this;
    var currentId = e.currentTarget.dataset.tabid
    if (this.data.currentTab === currentId) {
      return false;
    } else {
      switch (currentId) {
        case "0":
          that.setData({
            noMoreData: false,
            //mallLi: null,
            currentTab: currentId,
            pageNum: 1,
          })
          //this.getCoupon()
          break;
        case "1":
          that.setData({
            noMoreData: false,
            //shopLi: null,
            currentTab: currentId,
            pageNum: 1,
          })
          //this.getHotMovie()
          break;
        case "2":
          that.setData({
            noMoreData: false,
            //usedLi: null,
            currentTab: currentId,
            pageNum: 1,
          })
          //this.getWaitFilm()
          break;
        case "3":
          that.setData({
            noMoreData: false,
            //expiredLi: null,
            currentTab: currentId,
            pageNum: 1,
          })
          //this.getWaitFilm()
          break;
        default:
          break;
      }

    }
  },
  
  getCoupon(){
    api.getCoupon().then(res=>{
      console.log(res);
      if(!res) return
      this.setData({
        mallLi:res.mall,
        shopLi:res.shop,
        usedLi:res.used,
        expiredLi:res.expired,
      })
      console.log(this.data.expiredLi)
    })
  },
  showTips(){
    this.setData({
      tips:true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCoupon()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})