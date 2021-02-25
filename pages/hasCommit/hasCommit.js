const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
let initScore = [0,0,0,0,0]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score:[0,0,0,0,0],
    star:0,
    pop: 0,
  },
  close(){
    this.setData({
      pop: 0
    })
  },

  addComment(){
    this.setData({
      pop: 'hongbao'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderCode = options.orderCode

    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    let data = {
      order_code:orderCode
    }
    api.getComment(data).then(res=>{
      console.log(res);
      let detail=res.orderReader.detail
      let score = this.data.score,star = parseInt(res.defaultStar)-1
      let commentDetail = res.commentDetailReader
      score.forEach((item,index)=>{
        if(star<index){
          initScore[index]=0
        }else{
          initScore[index]=1
        }
      })

      this.setData({
        commentDetail:commentDetail,
        commentContent:res.commentContent,
        curTags:res.commentTags,
        proList:detail,
        score:initScore,
        reward_price:res.reward_price
      })
    })

    this.setData({
      orderCode,
      btmHolder:btmHolder||0
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
    if(this.data.isShare){
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 500);
    }
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
  onShareAppMessage: function(res) {
    if(res.from==='button'){
      this.setData({
        isShare:true
      })
      return {
        title:'恭喜您获得红包',
        path:"/pages/share/share?orderCode="+this.data.orderCode
      }
    }
    if(res.from==='menu'){
      wx.showToast({
        icon:"none",
        title:"点击按钮分享"
      })
      return
    }
    
  }
})