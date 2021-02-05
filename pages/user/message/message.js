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
  },500),
  submit(){
    let data = {
      content:this.data.txt
    }
    api.feedBack(data).then(res=>{
      console.log(res);
      if(res){
        wx.showToast({
          icon:"none",
          title:"提交成功"
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