const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    orderList:null,
    page:1,
    limit:20,
    noMoreData:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type
    this.setData({
      currentTab:type
    })
   
  },
  switchTab: function (e) {
    var that = this;
    var currentId = e.currentTarget.dataset.tabid
    if (this.data.currentTab == currentId) {
      return false;
    } else {
      that.setData({
        noMoreData: false,
        orderList: null,
        currentTab: currentId,
        page: 1,
      })
      this.getOrder()
    }
  },
  timing: function (remainTime) {
    remainTime--
    // 获取分秒
    let m = parseInt(remainTime / 60)
    let s = remainTime - m * 60

    let str = util.formatNumber(m) + '分' + util.formatNumber(s) + "秒"
    this.setData({
      remainTime: remainTime,
      timingTxt: str
    })

    timer = setTimeout(() => {
      this.timing(remainTime)
    }, 1000);
  },
  cancelOrder(e){
    let code = e.currentTarget.dataset.code
    let data = {
      order_code:code
    }
    api.cancleOrder(data).then(res=>{
      console.log(res);
    })
  },
  payOrder(e){
    let code = e.currentTarget.dataset.code
    let data = {
      order_code:code
    }
    api.payOrder(data).then(res=>{
      console.log(res);
    })
  },
  getOrder(){
    let {page,currentTab}=this.data
    let data = {
      page:page,
      type:currentTab,
      limit:20
    }
    api.orderList(data).then(res=>{
      console.log(res);
      if(!res.order){
        this.setData({
          noMoreData: true
        })
        return false
      }
      let list = res.order,count=parseInt(res.total_num)
      let noMoreData = count-page*20 <= 0
      this.setData({
        noMoreData: noMoreData,
        count:count,
        ['orderList['+(data.page-1)+']']:list,
      })
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  getMoreData() {
    let page = this.data.page + 1
    this.setData({
      page: page
    })
    this.getOrder()
  },
  onPullDownRefresh() {   //下拉刷新

    this.getOrder()
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
    this.getOrder()
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom(){
    if(this.data.noMoreData){
      return false
    }
    this.getMoreData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})