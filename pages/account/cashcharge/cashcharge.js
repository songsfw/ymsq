const api = require("../../../utils/api")
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    result:'',
    pwd:'',
    type:1
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
  chashCharge(){
    let {result,pwd,use}=this.data
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
        type:this.data.type,
        pay_price:this.data.cardPrice
      }
      console.log(data)
      api.useCard(data).then(res=>{
        console.log(res)
        let msg = res.message
        if(res.status==-1){
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
          
        }else{
          
          let usePrice = res.use_card

          var pages = getCurrentPages();
          if(pages.length > 1){
            //上一个页面实例对象
            var prePage = pages[pages.length - 2];
            //关键在这里
            prePage.setCardPrice(usePrice,this.data.type,result,pwd)
          }
          wx.showToast({
            title: `成功抵扣${usePrice}元`,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000);

        }
        
      })
    }else{
      let data = {
        card:result,
        pwd:pwd
      }
  
      api.chashCharge(data).then(res=>{
        console.log(res)
        
        if(res){
          wx.showToast({
            title: '充值成功',
            icon: 'none',
            duration: 2000
          })
        }
        
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let use = options.use,type=options.type,cardPrice=options.cardPrice
    if(use==1){
      this.setData({
        use:use,
        type:type,
        cardPrice:cardPrice
      })
    }
    if(type==1){
      wx.setNavigationBarTitle({
        title: '现金卡'
      })
    }
    if(type==2){
      wx.setNavigationBarTitle({
        title: '多美味卡'
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