const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex: [
      {value: '1', name: '男'},
      {value: '2', name: '女'},
    ],
  },
  radioChange(e) {
    let val = e.currentTarget.dataset.value;
    this.setData({
      'userInfo.real_gender':val
    })
  },
  bindDateChange: function(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    })
  },
  saveInfo(){
    let {userInfo} = this.data

    if(!userInfo.phone){
      wx.showToast({
        title: '请绑定手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(userInfo.birthday=='0000-00-00'){
      wx.showToast({
        title: '请选择生日',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let data = {
      real_gender:userInfo.real_gender,
      birthday:userInfo.birthday
    }
    api.changeUserInfo(data).then((res) => {
      if(res){
        wx.showToast({
          icon:"none",
          title:"保存成功"
        })
        wx.setStorageSync("userInfo", JSON.stringify(userInfo))
        wx.switchTab({
          url:"/pages/user/user"
        })
      }
    })
  },
  bindPhone(){
    this.setData({
      showPhonePanel: true
    })
  },
  bindPhoneSucess(e){
    console.log(e);
    this.setData({
      'userInfo.phone':e.detail
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let end = new Date().getFullYear()
    let userInfo = wx.getStorageSync('userInfo')
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      userInfo,
      start:end-100,
      end
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