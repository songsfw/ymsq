const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    noMoreData:false
  },

  onPageScroll: util.throttle(function (e) {
    //debounce()
    var scrollTop = e.scrollTop

    if (scrollTop > 0) {
      this.setData({
        isFold: true
      })
    } else {
      this.setData({
        isFold: false
      })
    }
  },100),
  getGiftList(){
    wx.showLoading({mask:true,title:"加载中..."})
    let noMoreData = false
    let {page,lottery_id}=this.data
    let data = {
      lottery_id:lottery_id,
      page:page
    }
    api.getGiftList(data).then(res=>{
      console.log(res);
      wx.hideLoading()
      let total_page = res.total_page
      if(page==total_page+1){
        noMoreData=true
      }
      this.setData({
        ['list[' + (page - 1) + ']']: res.detail,
        noMoreData
      })
      
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    
    let lottery_id = options.lotteryid || 4;
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    
    this.setData({
      lottery_id:lottery_id,
      btmHolder:btmHolder||0
    })
    this.getGiftList()
  },
  getMoreData() {
    let page = this.data.page + 1
    this.setData({
      page: page
    })
    this.getGiftList()
  },
  nextPage(){
    if (this.data.noMoreData) {
      return false
    }
    this.getMoreData()
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
    this.getGiftList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.noMoreData) {
      return false
    }
    this.getMoreData()
  },
})