const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
let app = getApp()
let timer =null,isPaying=false
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
    reasonTxt: "",
    reason: [
      "我不想买了",
      "信息填写错误",
      "其他原因"
    ],
    useCoupon: false,
    curtabid: 1,
    pop: 0,

    ziti:"0",

    poptitle:"请输入设置的余额密码",

  },
  
  close(){
    this.setData({
      pop: 0
    })
  },
  toComment(){
    wx.navigateTo({
      url:"/pages/commit/commit?orderCode="+this.data.orderCode
    })
  },
  showTips(){
    let showTip = this.data.showTip
    if(showTip){
      this.setData({
        showTip:false
      })
    }else{
      this.setData({
        showTip:true
      })
    }
  },
  showPop(e) {
    
    let pop = e.currentTarget.dataset.pop
    let action = this.data.shareInfo.action,
    order_code = this.data.orderCode
    let data = {
      order_code:order_code
    }
    if(action=="share"){
      wx.showLoading({title:"加载中..."})
      api.createPoster(data).then(res=>{
        console.log(res);
        if(!res){
          return
        }
        let poster = res.file
        this.setData({
          poster:poster,
          pop: 'showPoster'
        })
        wx.hideLoading()
      })
    }else{
      this.setData({
        pop: pop
      })
    }
    
  },
  previewImage(e){
		var cur=e.target.dataset.src;//获取本地一张图片链接
		wx.previewImage({
			current: cur, //字符串，默认显示urls的第一张
  			urls: [cur] // 数组，需要预览的图片链接列表
		})
	},
  confirmCoupon(){
    wx.showLoading({title:"加载中..."})
    let order_code = this.data.orderCode
    let data = {
      order_code:order_code
    }
    api.createPoster(data).then(res=>{
      console.log(res);
      wx.hideLoading()
      if(!res){
        return
      }
      let poster = res.file
      this.setData({
        poster:poster,
        pop: 'showPoster'
      })
      api.shareOrder(data).then(res=>{
        console.log(res);
        if(!res){
          return
        }
        this.setData({
          'shareInfo.action':"share"
        })
      })
    })
  },

  showAllPro() {
    let showAll = this.data.showAll ? false : true
    this.setData({
      showAll: showAll
    })
  },
  selectType(e) {
    let stype = e.currentTarget.dataset.stype
    this.setData({
      stype: stype
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

  payOrder:util.debounce(function (e) {
    wx.showLoading({mask:true,title:'正在支付'})
    let { orderCode } = this.data
    let data = {
      order_code:orderCode
    }
    api.payOrder(data).then(res=>{
      wx.hideLoading()
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
                  url: '/pages/cart/paySuccess/paySuccess?orderCode=' + orderCode,
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
  },500),
  bindcancel(e) {
    // if(this.data.orderData.order_type==2){
    //   wx.showModal({
    //     content: '请联系客服取消订单，400-992-6632',
    //     confirmText:"拨打",
    //     cancelText:"再想想",
    //     confirmColor:"#C1996B",
    //     success (res) {
    //       if (res.confirm) {
    //         wx.makePhoneCall({
    //           phoneNumber: '400-992-6632'
    //         })
    //         console.log('用户点击确定')
    //       }
    //     }
    //   })
    //   return
    // }
    this.setData({
      pop: "cancel"
    })
  },
  bindSelect(e) {
    let idx = e.currentTarget.dataset.idx
    this.setData({
      curRes: idx
    })
  },
  inputReason: util.debounce(function (e) {
    let val = e.detail.value
    console.log(val);
    if (val) {
      this.setData({
        reasonTxt: val,
      })
    }
  }, 500),
  cancelOrder(){
    let code = this.data.orderCode
    let {
      reason,
      curRes,
      reasonTxt
    } = this.data
    let data = {
      order_code: code,
      reason: reasonTxt == '' ? reason[curRes] : reasonTxt
    }
    if (curRes == 2 && reasonTxt == '') {
      wx.showToast({
        icon: "none",
        title: "请填写理由"
      })
      return
    }
    console.log(reason);
    api.cancleOrder(data).then(res => {
      console.log(res);
      if (res) {
        wx.showToast({
          icon: "none",
          title: "订单取消成功"
        })
        this.setData({
          pop: 0,
          stat:4
        })
        this.initOrderData()
      } else {
        this.setData({
          pop: 0
        })
      }
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
  showDelivery(){
    console.log("123");
    wx.navigateTo({
      url:'/pages/user/delivery/delivery?orderCode='+this.data.orderCode
    })
    // this.setData({
    //   pop:"delivery"
    // })
  },
  timing: function (remainTime) {
    if(remainTime==0){
      clearTimeout(timer)
      this.setData({
        stat:4,
        timingTxt: null
      })
      this.initOrderData();
      return
    }
    remainTime--
    // 获取分秒
    let m = parseInt(remainTime / 60)
    let s = remainTime - m * 60

    let str = util.formatNumber(m) + '分' + util.formatNumber(s) + "秒"
    this.setData({
      timingTxt: str
    })

    timer = setTimeout(() => {
      this.timing(remainTime)
    }, 1000);
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
        pay_price:orderData.pay_price,
        comment_status:orderData.comment_status,
        old_status:orderData.old_status,
        count:orderData.count,
        id:orderData.id,
        address:orderData.address,
        address_detail: orderData.address_detail,
        city_name: orderData.city_name,
        area_name: orderData.area_name,
        mobile: orderData.mobile,
        remark: orderData.remark,
        username:orderData.username,
        dispatch_company:orderData.dispatch_company,
        dispatch_date:orderData.dispatch_date,
        dispatch_time: orderData.dispatch_time,
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
        order_status:orderData.order_status,
        order_type:orderData.order_type
      }
      let second=res.status.seconds
      if(timer){
        clearTimeout(timer)
      }
      if(second&&second>0){
        this.timing(second)
      }

      this.setData({
        delivery:orderData.delivery,
        cart_data: orderData.detail,
        status:res.status,
        is_ziti:res.is_ziti,
        orderData:newOrderData,
        steps:res.steps
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderCode = options.code,stat = options.stat
    console.log(stat);
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:10
    this.setData({
      stat:stat,
      btmHolder:btmHolder||0,
      fixedTop,
      orderCode: orderCode
    })

    // let data = {
    //   order_code:orderCode
    // }

    // api.preShareOrder(data).then(res=>{
    //   console.log(res);
    //   if(!res){
    //     return
    //   }
    //   this.setData({
    //     shareInfo:res
    //   })
    // })

    // this.initOrderData();
  },
  share(){
    wx.showShareImageMenu({
      path:this.data.poster,
      success(res){
        console.log(res)
      }
    })
  },
  //20200224
 saveImg() {
  var page = this;
  if (!wx.saveImageToPhotosAlbum) {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
      showCancel: false,
    });
    return;
  }

  wx.showLoading({
    title: "正在保存图片",
    mask: false,
  });

  wx.downloadFile({
    url: page.data.poster,
    success: function (e) {
      wx.showLoading({
        title: "正在保存图片",
        mask: false,
      });
      wx.saveImageToPhotosAlbum({
        filePath: e.tempFilePath,
        success: function () {
          wx.showToast({
            icon:'none',
            title: '保存成功，分享后在优惠券页查看优惠券',
          });
        },
        fail: function (e) {
          if (e.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
            //用户取消 重新调起
            wx.showModal({
              title: '提示',
              content: '需要开启图片保存权限，点击确定去设置',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success(res) {

                    },
                    fail(res) {

                    }
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })

          }
        },
        complete: function (e) {
          
        }
      });
    },
    fail: function (e) {
      wx.showModal({
        title: '图片下载失败',
        content: e.errMsg + ";" + page.data.goods_qrcode,
        showCancel: false,
      });
    },
    complete: function (e) {
      console.log(e);
      wx.hideLoading();
    }
  });
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
    let pages = getCurrentPages();
    let currentPage = pages[pages.length-1];
    console.log(currentPage.options)
    let order_code = currentPage.options.code
    if(order_code){
      let data = {
        order_code:order_code
      }
      wx.showLoading({mask:true})
      api.preShareOrder(data).then(res=>{
        wx.hideLoading()
        console.log(res);
        if(!res){
          return
        }
        this.setData({
          shareInfo:res
        })
      })
  
      this.initOrderData();
    }else{
      wx.showModal({
        title: '提示',
        content: '订单详情获取失败，返回重试',
        showCancel:false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateBack({
              delta: 1
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
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