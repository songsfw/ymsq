// pages/user/user.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
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
    user:null,
    order_unpaid:0,
    order_dispatching:0
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
      content: '客服工作时间:9:00-21:00\n400-992-6632',
      confirmText:"拨打",
      cancelText:"取消",
      confirmColor:"#C1996B",
      success (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-992-6632'
          })
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
  getCartInfo(){
    let total_num = wx.getStorageSync("total_num")
    util.setTabBarBadge(total_num)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    let btmHolder = wx.getStorageSync('btmHolder')
    let instructions = wx.getStorageSync('instructions')

    if(instructions){
      instructions = JSON.parse(instructions)
      let group_chat =instructions['group-chat'],
      subscribeUrl =instructions['subscribe-article']
      this.setData({
        subscribeUrl,
        group_chat
      })
    }else{
      api.getIntroduction().then(res=>{
        console.log(res);
        if(res){
          instructions = res.instructions
          let group_chat =instructions['group-chat'],
              subscribeUrl =instructions['subscribe-article']
          this.setData({
            subscribeUrl,
            group_chat
          })
          wx.setStorageSync("instructions", JSON.stringify(res.instructions))
          
        }
      })
    }
    this.getMemoDay()
    this.setData({
      btmHolder:btmHolder||0,
      fixedTop
    })

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  toPro(e) {
    let urlType = e.currentTarget.dataset.type.toString();
    let url = e.currentTarget.dataset.url;
    console.log(urlType, url);
    switch (urlType) {
      case "1":
        wx.navigateTo({
          url: "/pages/web/web?url=" + url
        })
        break;
      case "5":
        wx.navigateTo({
          url: url
        })
        break;
      default:
        break;
    }
  },
  showRule(){
    this.setData({
      popShow:true
    })
  },
  getMemoDay(){
    api.getMemoDay().then(res=>{
      console.log(res);
      if(!res) return
      const {doc} = res;
      this.setData({
        doc
      })
    })
  },
  toMemo(){
    if(!this.data.user.subscribe){
      this.showRule()
      return
    }
    wx.navigateTo({
      url: '/pages/user/memoDay/memoDay'
    })
  },
  getUserCenter(){
    wx.showLoading({mask:true})
    api.getUserCenter().then(res=>{
      wx.hideLoading()
      console.log(res);
      if(res.user.subscribe){
        this.setData({
          popShow:false
        })
      }
      this.setData({
        user:res.user,
        order_unpaid:parseInt(res.user.order_unpaid),
        order_dispatching:parseInt(res.user.order_dispatching)
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //自定义tabbar选中
    // if (typeof this.getTabBar === 'function' &&
    //   this.getTabBar()) {
    //   this.getTabBar().setData({
    //     count:"",
    //     selected: 3
    //   })
    // }
    let userInfo = wx.getStorageSync("userInfo")
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      userInfo
    })
    this.getUserCenter();
    this.getCartInfo()
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
  // onShareAppMessage: function () {

  // }
})