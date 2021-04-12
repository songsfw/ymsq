const api = require('../../../utils/api.js')
const wxbarcode = require('../../../utils/initBarCode.js')
var timer = null
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canInterval: true, //判断能不能轮询，切换到后台时不进行轮询
    pay_code: '1234567890123456789',
    card_no: '',
    show:true,
    balance:"0"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
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
  vipCard(){
    if(timer){
      clearTimeout(timer)
    }
    api.getVipCard().then(res=>{
      console.log(res);
      const { pay_code, card_no ,balance} = res;
      //const codeStr = `${code.slice(0, 4)}****${code.slice(20)}`;
      wxbarcode.barcode('barcode', pay_code, 588, 300);
      this.setData({
        pay_code,
        card_no,
        balance
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
  onShow: function () {
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