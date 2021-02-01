const util = require('../../utils/util.js')
const api = require('../../utils/api.js')


const app = getApp()
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

    wx.getUserInfo({
      success:res=> {
        var userInfo = res.userInfo
        var avatarUrl = userInfo.avatarUrl
        this.setData({
          avatarUrl:avatarUrl
        })
      }
    })

    this.setData({
      orderCode: orderCode
    })
    
  },
  open(){
    let data ={
      order_code:this.data.orderCode
    }
    api.getHongbao(data).then(res=>{
      console.log(res);
      if(!res){
        wx.showToast({
          icon:"none",
          title:"领取失败"
        })
      }
      console.log(res);
      if(res.type=='reward'){
        step=2
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let step=0
    let pages = getCurrentPages();
    let currentPage = pages[pages.length-1];
    let orderCode = currentPage.options.orderCode
    let data ={
      order_code:orderCode
    }
    api.hongbao(data).then(res=>{
      console.log(res);
      if(res.is_received){
        step=1
      }else{
        step=3
      }
      if(res.is_reward){
        step=2
      }
      this.setData({
        users:res.userRewardDataReader,
        step:step,
        self_reward:res.self_reward,
        rule:res.rule,
        userInfo:res.user_info,
        setmeal_data:res.setmeal_data
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

