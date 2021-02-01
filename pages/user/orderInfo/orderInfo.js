const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
let delivery=10,mai=0,coupon=0,card=0,thirdCard=0
// let payQueue = [10,0,0,0,0]
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stype: "0",
    proNum: 2,
    showAll: false,
    address: {
      name: null,
      mobile: null,
      address: null,
      address_detail: null,
      is_default: 0
    },
    selectDate: 0,
    selectTime: -1,
    payQueue : [10,0,0,0,0],
    useCoupon: false,
    curtabid: 1,
    pop: 0,

    hasDelivery:true,
    hasMai:true,
    hasCard:false,
    hasThirdCard:false,
    hasCoupon:false,
    useBalance: true,
    hasPolicy:true,

    ziti:"0",


    poptitle:"请输入设置的余额密码",
    status:0,
    tips:"获取验证码",
    selected:0,
    step:1,
    list: [],
    confirmText:"开启",
    unuse:true,
  },
  
  closeCoupon(){
    this.setData({
      useCoupon:false,
      pop: 0
    })
  },

  showAllPro() {
    this.setData({
      showAll: true
    })
  },

  selectType(e) {
    let stype = e.currentTarget.dataset.stype
    this.setData({
      stype: stype
    })
  },
  showPop(e) {
    
    let pop = e.currentTarget.dataset.pop
    this.setData({
      pop: pop
    })
  },

  close() {
    this.setData({
      pop: 0
    })
  },
  selectTime(e) {
    let selectTime = e.currentTarget.dataset.idx
    this.setData({
      selectTime: selectTime,
    })
  },
  selectAdd() {
    let { address, type } = this.data
    console.log(address)
    //未提交情况下保存未填完信息
    wx.setStorageSync('address', JSON.stringify(address))
    wx.redirectTo({
      url: "/pages/user/selectAdd/selectAdd?type=" + type
    })
  },
  inputRemark: util.debounce(function (e) {
    this.setData({
      error:false,
      remark: e.detail.value
    })
  }, 500),
  showAllPro() {
    this.setData({
      showAll: true
    })
  },
  payOrder(e){
    let { orderCode } = this.data
    let data = {
      order_code:orderCode
    }
    api.payOrder(data).then(res=>{
      console.log(res);
      let jsApiParameters = res.jsApiParameters
      let {timeStamp, nonceStr, signType, paySign} = jsApiParameters
      wx.requestPayment({
        timeStamp: timeStamp,
        nonceStr: nonceStr,
        package: jsApiParameters.package,
        signType: signType,
        paySign: paySign,
        success(payres) {
          console.log(payres);
          wx.showToast({
            title: '支付成功',
            icon: 'none',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/chart/paySuccess/paySuccess?orderCode=' + orderCode,
                })
              }, 1000)
            }
          })

        },
        fail(res) {
          console.log(res)
          wx.showToast({
            title: "支付失败",
            icon: 'none',
            duration: 2000
          })
        }
      })
    })
  },
  cancelOrder(){
    let { orderCode } = this.data
    let data = {
      order_code:orderCode
    }
    api.cancleOrder(data).then(res=>{
      console.log(res);
      wx.showToast({
        icon:"none",
        title:"订单取消成功"
      })
      wx.navigateBack({
        delta: 1
      })
    })
  },
  copy(e){
    let id = e.currentTarget.dataset.id
    wx.setClipboardData({
      data: id,
      success (res) {
        wx.showToast({
          icon:"none",
          title:"复制成功"
        })
        // wx.getClipboardData({
        //   success (res) {
        //     console.log(res.data) // data
        //   }
        // })
      }
    })
  },
  changeAdd(){
    if(this.data.orderData.order_status=='0'){
      wx.navigateTo({
        url:"/pages/user/address/address?type=1"
      })
    }
  },
  initOrderData() {
    let { orderCode } = this.data
    
    let data = {
      order_code: orderCode
    }
    api.getOrderInfo(data).then(res => {
      console.log(res);
      let orderData = res.order
      let newOrderData = {
        count:orderData.count,
        id:orderData.id,
        address:orderData.address,
        address_detail: orderData.address_detail,
        city_name: orderData.city_name,
        area_name: orderData.area_name,
        mobile: orderData.mobile,
        remark: orderData.remark,
        username:orderData.username,
        product_price:orderData.product_price,
        balance_price:orderData.balance_price,
        weixin_price:orderData.weixin_price,
        promotion_price:orderData.promotion_price,
        point_price:orderData.point_price,
        cash_price:orderData.cash_price,
        third_cash_price:orderData.third_cash_price,
        delivery_price:orderData.delivery_price,
        pay_mode_string:orderData.pay_mode_string,
        create_time:orderData.create_time,
        order_status:orderData.order_status
      }
      this.setData({
        delivery:orderData.delivery,
        cart_data: orderData.detail,
        status:res.status,
        is_ziti:res.is_ziti,
        orderData:newOrderData
      })

    })
  },
  onPageScroll: util.throttle(function (e) {
    //debounce()
    var scrollTop = e.scrollTop

    if (scrollTop > 0) {
      this.setData({
        isFold: true
      })
    } else {
      this.setData({
        isFold: false
      })
    }
  },100),
  switch(e) {
    let free_secret = this.data.balanceInfo.free_secret
    let useBalance = this.data.useBalance
    if(free_secret=="1"){
      if(useBalance){
        this.setData({
          useBalance: false
        })
      }else{
        this.setData({
          useBalance: true
        })
      }
      this.setBalancePrice()
    }
    if(free_secret=="0"){
      if(useBalance){
        this.setData({
          useBalance: false
        })
        this.setBalancePrice()
      }else{
        this.setData({
          popShow:true,
          poptitle:"请输入设置的余额密码",
          step:1
        })
        
      }
    }
    
    
    //this.setBalancePrice()
  },

  closePanel(e){
    let step = this.data.step
    this.setData({ 
      unuse:true
    })
    switch (step) {
      case 1:
        this.setData({
          useBalance:false
        })
        
        break;
    
      default:
        break;
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderCode = options.code

    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    let btmHolder = wx.getStorageSync('btmHolder')


    this.setData({
      btmHolder:btmHolder||0,
      fixedTop,
      orderCode: orderCode
    })
    this.initOrderData();
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