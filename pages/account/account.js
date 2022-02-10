// pages/user/user.js
const api = require('../../utils/api.js')
const log = require('../../utils/log.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    count:0,
    money:'---'
  },
  changeMoney(){
    let show = app.globalData.isShowBalance
    show?show=false:show=true
    app.globalData.isShowBalance = show
    this.setData({
      show:show
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;

    let userInfo = wx.getStorageSync('userInfo')
    let addressInfo = wx.getStorageSync("addressInfo")
    let loginInfo = null
    if(!userInfo || !addressInfo){
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
    }

    this.setData({
      show:app.globalData.isShowBalance,
      fixedTop
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
    //自定义tabbar选中
    api.getAccount().then(res=>{
      console.log(res);
      if(!res.balance){
        log.info('account',res)
      }
      this.setData({
        money:res.balance
      })
    })
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
  // onShareAppMessage: function () {

  // }
})