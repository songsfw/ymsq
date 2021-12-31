const api = require("../../../utils/api")
const util = require('../../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    result:'',
    pwd:'',
    type:1,
    pop:0
  },
  changeShow(){
    let show = this.data.show
    show?show=false:show=true
    this.setData({
      show:show
    })
  },
  scan(){
    wx.scanCode({
      scanType:["barCode"],
      success:(res) => {
        console.log(res)
        let result = res.result
        this.setData({
          result
        })
      },
      fail:(res)=>{
        console.log(res)
        wx.showToast({
          title: '识别失败，请重新扫码',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  inputPwd(e){
    if(this.data.showPriceInfo){
      this.setData({
        showPriceInfo:false
      })
    }
    this.setData({
      pwd: e.detail.value
    })
  },
  inputRes(e){
    if(this.data.showPriceInfo){
      this.setData({
        showPriceInfo:false
      })
    }
    this.setData({
      result: e.detail.value
    })
  },
  bindPhoneSucess(){
    this.chashCharge()
  },
  showRule(){
    this.setData({
      pop:"rules"
    })
  },
  close(){
    this.setData({
      pop:0
    })
  },
  chashCharge:util.debounce(function(){
    let {result,pwd}=this.data
    
    if(result==""){
      wx.showToast({
        title: '请输入卡号',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if(pwd==""){
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    this.setData({
      showLoading:true
    })
    
    let data = {
      card:result,
      pwd:pwd,
      company:1
    }
    api.companyCharge(data).then(res=>{
      this.setData({
        showLoading:false
      })
      console.log(res)
      if(!res){
        return
      }
      if(res.status=='-1'){
        wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 3000
        })
        return
      }
      if(res.status=='-2'){
        wx.showModal({
          content: res.message,
          cancelText: "去充值",
          confirmText: "知道了",
          success: res => {
            if (res.cancel) {
              wx.redirectTo({
                url: '/pages/account/cashcharge/cashcharge',
              })
            } else if (res.cancel) {
              
            }
          }
        })
        return
      }
      
        wx.showToast({
          title: '充值成功',
          icon: 'none',
          duration: 3000
        })
        this.setData({
          result:'',
          pwd:""
        })
      
    })
    

  },300,false),
  useChashCharge(){
    let {result,pwd,type,usePrice}=this.data
    var pages = getCurrentPages();
    if(pages.length > 1){
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      //关键在这里
      prePage.setCardPrice(usePrice,type,result,pwd)
    }
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 300);
         
  },
  cancelChashCharge(){
    let {type}=this.data
    var pages = getCurrentPages();
    this.setData({
      isUse:false
    })
    if(pages.length > 1){
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      //关键在这里
      prePage.setCardPrice(0,type)
    }
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 300);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder==0?12:btmHolder
    let txt = [
      '1、 此卡（券）充值成功后额度将会转移到会员的余额账户，本卡（券）失去价值 ',
'2、余额支持原麦山丘微信商城、线下门店消费时使用；',
'3、卡（券）充值前已经开具发票，在微信商城和门店使用将不再开具；',
'4、余额不兑换现金、不参与积分、不与其他优惠活动同享；',
'5、蛋糕产品六环内请至少提前5小时订购；其他订单请至少提前24小时订购；',
'6、如有订单变更需进行退款的，余额支付部分将退回原账户；',
'7、余额使用不限次数、暂不设置有效期。'
    ]
    // api.getIntroduction().then(res=>{
    //   console.log(res);
    //   if(res){
    //     let txt = res.instructions['cash-card']
        this.setData({
          instructions:txt
        })
    //   }
    // })
    
    this.setData({
      btmHolder:btmHolder||0,
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