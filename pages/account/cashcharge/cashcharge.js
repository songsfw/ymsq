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
    pop:0,
    isCharging:0
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
  inputPwd:util.debounce(function(e){
    this.setData({
      pwd: e.detail.value
    })
  },300),
  inputRes:util.debounce(function(e){
    this.setData({
      result: e.detail.value
    })
  },300),
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
  chashCharge(){
    let {result,pwd,use,type}=this.data
    
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
    
    if(use==1){
      let data = {
        card_no:result,
        card_pwd:pwd,
        type:type,
        pay_price:this.data.cardPrice
      }
      console.log(data)
      api.useCard(data).then(res=>{
        console.log(res)
        if(!res){
          return
        }
        // if(res==app.globalData.bindPhoneStat){
        //   this.setData({
        //     popShow:true
        //   })
        //   return
        // }

        let usePrice = res.use_card
        if(type==1){
          app.globalData.cardNo = result
          app.globalData.cardPwd = pwd
        }else{
          app.globalData.thirdCardNo = result
          app.globalData.thirdCardPwd = pwd
        }
        // wx.showToast({
        //   title: `成功抵扣${usePrice}元`,
        //   icon: 'none',
        //   duration: 2000
        // })
        this.setData({
          showPriceInfo:true,
          pay_price:res.pay_price,
          card_balance:res.card_balance,
          usePrice:usePrice
        })
        // setTimeout(() => {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }, 1000);
      })
    }else{
      let data = {
        card:result,
        pwd:pwd
      }
      if(this.data.isCharging==1){
        return
      }
      this.setData({
        isCharging:1
      })
      wx.showLoading({
        title: '加载中',
      })
      api.chashCharge(data).then(res=>{
        wx.hideLoading()
        console.log(res)
        if(!res){
          return
        }
        // if(res==app.globalData.bindPhoneStat){
        //   this.setData({
        //     popShow:true
        //   })
        //   return
        // }
        // app.globalData.cardNo = result
        // app.globalData.cardPwd = pwd
        wx.showToast({
          title: '充值成功',
          icon: 'none',
          duration: 4000
        })
        this.setData({
          result:'',
          pwd:"",
          isCharging:0
        })
      })
    }

  },
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
    let use = options.use,type=options.type||1,cardPrice=options.cardPrice,isUse = options.isUse
    console.log(isUse);
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder==0?12:btmHolder
    this.setData({
      btmHolder:btmHolder||0,
    })
    
    if(use==1){
      api.getIntroduction().then(res=>{
        console.log(res);
        if(res){
          let txt = type==1?res.instructions['cash-card']:res.instructions.duomeiwei
          this.setData({
            instructions:txt
          })
        }
      })
      this.setData({
        isUse:isUse,
        use:use,
        type:type,
        cardPrice:cardPrice
      })
    }

    if(type==2){
      if(app.globalData.thirdCardNo){
        this.setData({
          result:app.globalData.thirdCardNo,
          pwd:app.globalData.thirdCardPwd
        })
      }
      wx.setNavigationBarTitle({
        title: '多美味卡'
      })
    }else{
      if(app.globalData.cardNo){
        this.setData({
          result:app.globalData.cardNo,
          pwd:app.globalData.cardPwd
        })
      } 
      wx.setNavigationBarTitle({
        title: '现金卡'
      })
    }
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
    console.log('is_mobile',app.globalData.is_mobile);
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