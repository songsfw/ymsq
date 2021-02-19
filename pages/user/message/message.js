const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    txt:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    //选择地址
    //source 1 下单页
    this.setData({
      btmHolder:btmHolder||0
    })
  },
  inputTxt:util.debounce(function(e){
    this.setData({
      txt:e.detail.value
    })
  },300),
  submit(){
    let data = {
      content:this.data.txt
    }
    api.feedBack(data).then(res=>{
      console.log(res);
      if(res){
        wx.showModal({
          content: '感谢您的反馈',
          confirmText:"知道了",
          showCancel:false,
          confirmColor:"#C1996B",
          success (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      
      }
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

})