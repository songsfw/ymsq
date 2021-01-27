const api = require('../../../utils/api.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pointList:[],
    page:1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  getPoint(){
    let data={
      limit:50,
      page:this.data.page
    }
    api.maidian(data).then(res=>{
      console.log(res);
      if(!res){
        this.setData({
          noMoreData: true,
          pointList:[]
        })
        return false
      }
      if(res){
        this.setData({
          point:res.point,
          pointList:res.list
        })
      }
      
    })
  },
  getMoreData() {
    let page = this.data.page + 1
    this.setData({
      page: page
    })
    this.getPoint()
  },
  onReachBottom: function () {
    if(this.data.noMoreData){
      return false
    }
    this.getMoreData()
  },
  onLoad: function (options) {
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    this.setData({
      fixedTop
    })
    this.getPoint()
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