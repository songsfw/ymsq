const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')
let app = getApp()
let loginInfo = null
// pages/share/share
Page({

  /**
   * 页面的初始数据
   */
  data: {
    step:0
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderCode = options.orderCode

    this.setData({
      orderCode: orderCode
    })
    
  },
  async open(){
    console.log(this.data.userInfo);
    try {
      await auth.checkSession()
      if(this.data.userInfo.is_authed==0){
        if (wx.getUserProfile) {
          auth.getUserProfile(this.data.userInfo).then(res=>{
            console.log(res);
            this.getHongbao()
          }).catch(err=>{
            console.log(err);
            wx.showToast({
              icon:"none",
              title:"授权失败，稍后重试"
            })
          })
        }else{
          this.getHongbao()
        }
      }else{
        this.getHongbao()
      }
    } catch (error) {
      if(this.data.userInfo.is_authed==0){
        loginInfo = await auth.getLoginInfo()
        if (wx.getUserProfile) {
          auth.getUserProfile(this.data.userInfo).then(res=>{
            console.log(res);
            this.getHongbao()
          }).catch(err=>{
            console.log(err);
            wx.showToast({
              icon:"none",
              title:"授权失败，稍后重试"
            })
          })
        }else{
          this.getHongbao()
        }
      }else{
        this.getHongbao()
      }
    }
    
    
  },
  getHongbao(){
    let step
    let data ={
      order_code:this.data.orderCode
    }
    this.setData({
      showLoading:true
    })
    api.getHongbao(data).then(res=>{
      this.setData({
        showLoading:false
      })
      console.log(res);
      if(!res){
        wx.showToast({
          icon:"none",
          title:"手慢了，红包已抢完了呀"
        })
        this.setData({
          step:3
        })
        return
      }
      if(res.type=='reward'){
        step=2
        this.setData({
          self_reward:res.price,
          users:res.userRewardDataReader
        })
      }else if(res.type == 'show'){
        step=2
        wx.showToast({
          icon:"none",
          title:"您已领取过"
        })
      }
      this.setData({
        step:2
      })
    })
  },
  toPro(e) {
    let url = e.currentTarget.dataset.url,type = e.currentTarget.dataset.type;
    if(type==1){
      wx.navigateTo({
        url: "/pages/proInfo/proInfo?proId=" + url
      })
    }else{
      wx.navigateTo({
        url: "/pages/cakeInfo/cakeInfo?proId=" + url
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    let userInfo = wx.getStorageSync('userInfo')
    
    if(!userInfo){
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
    }
    userInfo = JSON.parse(wx.getStorageSync('userInfo'))

    this.setData({
      userInfo:userInfo,
      showLoading:true
    })
    let step=0
    let pages = getCurrentPages();
    let currentPage = pages[pages.length-1];
    let orderCode = currentPage.options.orderCode
    let data ={
      order_code:orderCode
    }
    api.hongbao(data).then(res=>{
      console.log(res);
      if(res){
        let best_reward = res.best_reward,
            users = res.userRewardDataReader
        if(res.is_received){
          step=1
        }else{
          step=3
        }
        if(res.is_reward){
          step=2
        }
        
        if(best_reward!=0){
          users.find(item=>{
            if(item.id==best_reward){
              item.best=true
            }
          })
        }
        console.log(users);
        this.setData({
          users:users,
          step:step,
          self_reward:res.self_reward,
          rule:res.rule,
          mainUser:res.user_info,
          setmeal_data:res.setmeal_data
        })
      }
      this.setData({
        showLoading:false
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

