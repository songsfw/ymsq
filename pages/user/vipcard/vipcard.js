const api = require('../../../utils/api.js')
const wxbarcode = require('../../../utils/initBarCode.js')
const log = require('../../../utils/log.js')
var timer = null
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canInterval: true, //判断能不能轮询，切换到后台时不进行轮询
    card_no: '',
    show:true,
    balance:"--"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12

    let instructions = wx.getStorageSync('instructions')
    if(instructions){
      console.log(instructions);
      instructions = JSON.parse(instructions)
      let url =instructions['subscribe-article']
      this.setData({
        url
      })
    }else{
      api.getIntroduction().then(res=>{
        console.log(res);
        if(res){
          instructions = res.instructions
          let url =instructions['subscribe-article']
          this.setData({
            url
          })
          wx.setStorageSync("instructions", JSON.stringify(res.instructions))
          
        }
      })
    }

    this.setData({
      btmHolder:btmHolder,
      show:app.globalData.isShowScore
    })
    
  },
  toAccount(){
    wx.navigateTo({
      url:"/pages/account/account"
    })
  },
  toPro(e) {
    wx.navigateTo({
      url: `/pages/web/web?url=${this.data.url}`
    })
  },
  
  vipCard(){
    wx.showLoading()
    if(timer){
      clearTimeout(timer)
      timer = null
    }
    api.getVipCard().then(res=>{
      wx.hideLoading()
      console.log(res);
      const { pay_code, card_no ,balance,subscribe} = res;
      if(!pay_code){
        log.info("会员卡",res)
      }
      //const codeStr = `${code.slice(0, 4)}****${code.slice(20)}`;
      wxbarcode.barcode('barcode', pay_code, 588, 300);
      this.setData({
        pay_code,
        card_no,
        balance,
        subscribe
      })
      timer = setTimeout(()=>{
        this.vipCard()
      },30000)
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
  async onShow () {
    let userInfo = wx.getStorageSync('userInfo')
    let loginInfo = null
    if(!userInfo){
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
    }
    
    this.vipCard()
    this.setData({
      canInterval: true
    });
  },
  changeMoney(){
    let show = app.globalData.isShowScore
    show?show=false:show=true
    app.globalData.isShowScore = show
    this.setData({
      show:show
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if(timer){
      clearTimeout(timer)
      timer = null
    }
    this.setData({
      canInterval: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if(timer){
      clearTimeout(timer)
      timer=null
    }
    this.setData({
      canInterval: false
    })
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