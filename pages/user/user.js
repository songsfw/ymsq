// pages/user/user.js
const api = require('../../utils/api.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curTap:0,
    dingdanflag:false,
    seed:false,
    noquanzi:false,
    userInfo:null,
    orderlist:[],
    userLevel :{0:'普通会员',3:'试用会员',4:'金麦会员'},
    count:0,
    user:null
  },
  getTab:function(e){
    let index = e.currentTarget.dataset.tabid;
    if(index != this.data.curTap){
      this.setData({
        curTap:index
      })
    }
  },
  showService(){
    wx.showModal({
      title: '联系客服',
      content: '400-992-6632',
      showCancel:false,
      confirmText:"知道了",
      confirmColor:"#C1996B",
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },
  toOrder(e){
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url:"/pages/user/order/order?type="+type
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    // let safeArea = sysInfo.safeArea;
    // if(sysInfo.screenHeight > safeArea.bottom){
    //   let btmHolder = sysInfo.screenHeight - safeArea.bottom
    //   this.setData({
    //     btmHolder:btmHolder
    //   })
    // }
    this.setData({
      fixedTop
    })

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getUserCenter(){
    api.getUserCenter().then(res=>{
      console.log(res);
      this.setData({
        user:res.user
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //自定义tabbar选中
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    let userInfo = wx.getStorageSync("userInfo")
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      userInfo
    })
    this.getUserCenter();
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
    this.onShow()
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