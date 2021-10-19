const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

let app = getApp()
let timer =null,isPaying=false,timer2=null
let userIcon = "https://api.withwheat.com/img/marker1.png",sendicon="https://api.withwheat.com/img/marker2.png"
let iconW = 55,iconH=67
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
          stat:4,
          timingTxt: null
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
    wx.navigateTo({
      url:'/pages/user/delivery/delivery?orderCode='+this.data.orderCode
    })
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
  showService(e){
    let serviceMobile = e.currentTarget.dataset.mobile

    wx.showModal({
      title: '联系电话',
      content: serviceMobile,
      confirmText:"拨打",
      cancelText:"取消",
      confirmColor:"#C1996B",
      success (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: serviceMobile
          })
        }
      }
    })
  },
  initOrderData() {
    let { orderCode } = this.data
    wx.showLoading()
    let data = {
      order_code: orderCode
    }
    api.getOrderInfo(data).then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
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
      if(orderData.old_status=='UNPAID' && second>0){
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

      if(orderData.old_status=='DISPATCHING'){
        this.getLocation()
      }else{
        this.setData({
          showMap:false
        })
      }
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
  getDistance(start,dest){
    let _this = this
    qqmapsdk.calculateDistance({
      from: start || '', //若起点有数据则采用起点坐标，若为空默认当前地址
      to: dest, //终点坐标
      success: function(res) {
        console.log(res);
        var res = res.result.elements;
        let dist = res[0].distance
        dist = dist<1000?dist+'米':util.toFixed(dist/1000,2)+'公里'
        _this.setData({
          'marker[1].callout.content':`距离您${dist}`
        });
      },
      fail: function(error) {
        console.error(error);
      }
    });
  },
  getLocation(){
    let {orderCode,userInfo,orderData} = this.data
    let _this = this
    if(!this.mapCtx){
      this.mapCtx = wx.createMapContext('myMap')
    }
    if(!this.data.showMap){
      wx.showLoading()
    }
    let data = {
      order_code:orderCode
    }
    let marker = null
    api.getDeliveryLocal(data).then(res=>{
      wx.hideLoading()
      let orderInfo = res
      if(orderData.old_status=="PAID"){
        this.setData({
          showMap:false
        })
        return
      }
      if(orderInfo.old_status=="RECEIVED" || orderInfo.old_status=="COMPLETE"){
        wx.showModal({
          title: '订单配送完成',
          confirmText:"确定",
          confirmColor:"#C1996B",
          success (res) {
            clearTimeout(timer2)
            if (res.confirm) {
              _this.setData({
                showMap:false
              })
              _this.initOrderData()
            }
          }
        })
        return
      }

      if(!orderInfo || !orderInfo.order || orderInfo.old_status===null){
        this.setData({
          showMap:false
        })
        return
      }

      
      
      console.log(orderInfo);
      let start = `${orderInfo.order.lat},${orderInfo.order.lng}`
      let dest = `${orderInfo.dispatcher.lat},${orderInfo.dispatcher.lng}`

      if(!this.data.marker){
        this.mapCtx.includePoints({
          padding: [100],
          points: [{
            latitude: orderInfo.order.lat,
            longitude: orderInfo.order.lng
          }, {
            latitude: orderInfo.dispatcher.lat,
            longitude: orderInfo.dispatcher.lng
          }]
        })
        var ctx = wx.createCanvasContext('photo',this);
        let promise1 = new Promise(function(resolve, reject) {
          wx.downloadFile({
            url: userInfo.head_url,
            success: function(pic) {
              console.log("promise1", pic)
              resolve(pic.tempFilePath);
            },
            fail:function(err){
              resolve('../../../image/no-photo.png')
              console.log(err);
            }
          })
        });
        let promise2 = new Promise(function(resolve, reject) {
          wx.downloadFile({
            url: userIcon,
            success: function(pic) {
              console.log("promise2", pic)
              resolve(pic.tempFilePath);
            },
            fail:function(err){
              resolve("../../../image/marker1.png")
              console.log(err);
            }
          })
        });
        Promise.all([
          promise1, promise2
        ]).then(pics => {
          console.log("生成临时图片")
          ctx.drawImage(pics[1], 0, 0, iconW, iconH)
          ctx.save();
          
          ctx.beginPath(); //开始绘制
          ctx.arc(28, 27, 22, 0, Math.PI * 2, false);

          ctx.clip();//画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
          
          ctx.drawImage(pics[0], 6, 5, 44, 44)
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下文即状态 还可以继续绘制
          
          //ctx.stroke()
          ctx.draw(false, function(){
            console.log('开始画图');
              wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: iconW,
                height: iconH,
                destWidth: iconW*3,
                destHeight: iconW*3,
                canvasId: 'photo',
                success: function(tempFile) {
                  console.log(tempFile);
                  marker = [{id:1,width:iconW,height:iconH, latitude:orderInfo.order.lat,longitude:orderInfo.order.lng,iconPath:tempFile.tempFilePath},{id:2,width:iconW,height:iconH,latitude:orderInfo.dispatcher.lat,longitude:orderInfo.dispatcher.lng,iconPath:sendicon,callout:{padding:5,content:"距离您-米",display:"ALWAYS"}}]
                  _this.setData({
                    marker:marker,
                  })
                  _this.getDistance(start,dest)
                  wx.hideLoading()
                },
                fail: function(res) {
                  wx.hideLoading()
                }
              },_this)
              
          });
        })
        this.setData({
          orderlocal:res.order,
          showMap:true
        })
      }else{
        this.setData({
          'marker[1].latitude':orderInfo.dispatcher.lat,
          'marker[1].longitude':orderInfo.dispatcher.lng,
        })
        this.getDistance(start,dest)
      }
      

      timer2 = setTimeout(() => {
        this.getLocation()
      }, 30000);
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    qqmapsdk = new QQMapWX({
      key: 'PFTBZ-RUYWU-I64VW-2A3XS-AVAS7-4YBUB'
    });
    let orderCode = options.code,stat = options.stat
    console.log(stat);
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    let btmHolder = wx.getStorageSync('btmHolder'),
        userInfo = wx.getStorageSync('userInfo')
    btmHolder = btmHolder>0?btmHolder:10
    userInfo = JSON.parse(userInfo)
    this.setData({
      stat:stat,
      userInfo,
      btmHolder:btmHolder||0,
      fixedTop,
      orderCode: orderCode
    })
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
    this.mapCtx = wx.createMapContext('myMap')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length-1];
    let options = currentPage.options
    let order_code = options.code
    let stat = options.stat
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
    clearTimeout(timer2)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    clearTimeout(timer2)
    this.initOrderData();
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