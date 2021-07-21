const api = require("../../../utils/api")
const util = require('../../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    unuse:false,
    result:""
  },
  inputRes(e){
    if( e.detail.value.length>0 ){
      this.setData({
        unuse:true
      })
    }else{
      this.setData({
        tips:"",
        unuse:false
      })
    }
    this.setData({
      result: e.detail.value
    })
  },
  exChange:util.debounce(function(){
    let {result}=this.data
    let pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    
    console.log(pages);
    if(result==""){
      wx.showToast({
        title: '请输入兑换码',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    this.setData({
      showLoading:true
    })

    let data = {
      code:result,
    }
    api.exChangeCoupon(data).then(res=>{
      this.setData({
        showLoading:false
      })
      console.log(res)
      if(res.status&&res.status!="200"){
        this.setData({
          tips:res.message
        })
        return
      }
      let content =  `您成功兑换一张${res.name},可在【我的-优惠券】查看`
      wx.showModal({
        title: '兑换成功',
        content: content,
        confirmText:"去使用",
        cancelText:"查看",
        success (res) {
          if (res.confirm) {
            wx.switchTab({
              url:"/pages/proList/proList"
            })
          } else if (res.cancel) {
            if(prePage.route=="pages/user/user"){
              wx.redirectTo({
                url: '/pages/user/coupon/coupon'
              })
            }else{
              wx.navigateBack({
                delta: 1
              })
            }

          }
        }
      })

    })
    

  },300,false),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    
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
  // onShareAppMessage: function () {

  // }
})