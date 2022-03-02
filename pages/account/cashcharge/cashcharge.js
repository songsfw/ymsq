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
    this.setData({
      popShow:false
    })
  },
  closePhonePanel(){
    this.setData({
      popShow:false
    })
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
    let {result,pwd,use,type,cardPrice,orderType}=this.data
    
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
    if(use==1){
      let data = {
        card_no:result,
        card_pwd:pwd,
        type:type,
        order_type:orderType,
        pay_price:cardPrice || 0
      }
      api.useCard(data).then(res=>{
        //wx.hideLoading();
        this.setData({
          showLoading:false
        })
        console.log(res)
        if(!res){
          return
        }

        let usePrice = res.use_card
        if(type==1){
          app.globalData.cardNo = result
          app.globalData.cardPwd = pwd
        }else{
          app.globalData.thirdCardNo = result
          app.globalData.thirdCardPwd = pwd
        }

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
      api.chashCharge(data).then(res=>{
        //wx.hideLoading();
        this.setData({
          showLoading:false
        })
        console.log(res)
        if(!res){
          return
        }
        //res==1022
        if(res==app.globalData.bindPhoneStat){
          this.setData({
            popShow:true
          })
          return
        }
        // app.globalData.cardNo = result
        // app.globalData.cardPwd = pwd
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
    }

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
      result:'',
      pwd:"",
      isUse:false
    })
    if(type==1){
      app.globalData.cardNo = ''
      app.globalData.cardPwd = ''
    }else{
      app.globalData.thirdCardNo = ''
      app.globalData.thirdCardPwd = ''
    }
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
    let ordertype = options.ordertype
    //外部来源
    let source = options.source
    wx.reportAnalytics('charge_source', {
      source: source,
    });
    console.log(isUse);
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder==0?12:btmHolder

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
      btmHolder:btmHolder||0,
    })
    
    if(use==1){
      this.setData({
        orderType:ordertype,
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
  async onShow () {
     //登录逻辑
    let userInfo = wx.getStorageSync('userInfo')
    let loginInfo = null
    if(!userInfo){
      wx.showLoading({mask:true})
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
      wx.hideLoading()
      if(loginInfo.is_mobile==0){
        this.setData({
          popShow:true
        })
      }
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
  // onShareAppMessage: function () {

  // }
})