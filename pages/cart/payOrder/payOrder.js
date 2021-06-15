const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
let delivery = 10,
  mai = 0,
  coupon = 0
  
let txtCard = null,
  cartid = null,
  txt = ''
let app = getApp()
// let payQueue = [10,0,0,0,0]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_ziti: "0",
    proNum: 2,
    showAll: false,

    //样式选中变量
    selectDate: 0,
    selectTime: -1,

    //确定选中变量
    checkDate: 0,
    checkTime: -1,

    //开始选择
    startCheck : false,

    // checkChange: true,
    // checkDateChange: true,

    //配送end
    payQueue: [10, 0, 0, 0, 0],
    useCoupon: false,
    couponCheck: -1,
    curId: -1,
    curtabid: 1,
    pop: 0,
    hasDelivery: true,
    hasMai: true,
    hasCard: false,
    hasThirdCard: false,
    hasCoupon: false,
    useBalance: true,
    hasPolicy: true,

    ziti: "0",
    delivertTip: "满减免邮费不能与优惠券同时使用",

    poptitle: "请输入设置的余额密码",
    status: 0,
    tips: "获取验证码",
    selected: 0,
    step: 1,
    list: [],
    confirmText: "确定",
    unuse: true,
    verifyed: false,
    zitiName: '',
    zitiPhone: '',
    isSet: null,
    useShowStatus: {},
    unUsedShowStatus: {}
  },
  closeCoupon() {
    let {
      couponCheck
    } = this.data
    if (couponCheck != -1) {
      this.setData({
        useCoupon: true,
        curId: couponCheck,
        pop: 0
      })
    } else {
      this.setData({
        useCoupon: false,
        curId: -1,
        couponCheck: -1,
        pop: 0
      })
    }
  },
  //优惠券抵扣
  confirmCoupon() {
    let {
      curId,
      couponPrice,
      payQueue,
      defaultCoupon,
      cart_data
    } = this.data
    let newPayQueue = payQueue.slice(0)
    let useCoupon, couponCheck, useDiscount
    if (curId == -1) {
      coupon = 0
      useCoupon = false,
        couponCheck = -1
      useDiscount = false //是否使用推荐优惠
    } else {
      console.log(curId);
      if (defaultCoupon == curId) {
        useDiscount = true
      } else {
        useDiscount = false
      }
      coupon = curId == 1 ? cart_data.default_delivery : couponPrice[curId].promotion_price
      useCoupon = true,
        couponCheck = curId
    }
    newPayQueue[2] = util.formatePrice(coupon)
    this.setData({
      useDiscount: useDiscount,
      useCoupon: useCoupon,
      couponCheck: couponCheck,
      payQueue: newPayQueue
    })
    //this.initOrderPrice()
    this.close()
  },
  selectCoupon(e) {
    let id = e.currentTarget.dataset.id
    let {
      curId
    } = this.data
    console.log(id)
    let {
      couponList
    } = this.data

    if (this.data.curtabid == 1) {
      if (curId == id) {
        curId = -1
      } else {
        curId = id
      }
      this.setData({
        curId: curId,
        couponList
      })
    }
  },

  showTips(e) {
    let id = e.currentTarget.dataset.id,
      type = e.currentTarget.dataset.type

    switch (type) {
      case 'canuse':
        this.data.useShowStatus[id] = this.data.useShowStatus[id] == true ? false : true;
        this.setData({
          useShowStatus: this.data.useShowStatus,
          rotateRight: 'rotateRight',
        })
        break;
      case 'uncanuse':
        this.data.unUsedShowStatus[id] = this.data.unUsedShowStatus[id] == true ? false : true;
        this.setData({
          unUsedShowStatus: this.data.unUsedShowStatus,
          rotateRight: 'rotateRight',
        })
        break;

    }
    return false;
    // let {
    //   couponList,
    //   unableCouponList
    // } = this.data

    // if (this.data.curtabid == 1) {
    //   if (couponList[idx].showTip) {
    //     couponList[idx].showTip = false
    //   } else {
    //     couponList[idx].showTip = true
    //   }

    //   this.setData({
    //     couponList
    //   })
    // } else {
    //   if (unableCouponList[idx].showTip) {
    //     unableCouponList[idx].showTip = false
    //   } else {
    //     unableCouponList[idx].showTip = true
    //   }

    //   this.setData({
    //     unableCouponList
    //   })
    // }
  },
  showAllPro() {
    let showAll = this.data.showAll ? false : true
    this.setData({
      showAll: showAll
    })
  },
  tabCoupon(e) {
    let tabid = e.currentTarget.dataset.tabid
    this.setData({
      curtabid: tabid
    })
  },
  selectType(e) {
    let ziti = e.currentTarget.dataset.stype
    this.setData({
      ziti: ziti,
    })
    this.initOrderData()
    //this.initOrderPrice()
  },
  showPop(e) {
    let pop = e.currentTarget.dataset.pop
    let delivery = this.data.delivery,
        delivery_times = delivery.delivery_times || []
    if (pop == "showTime" && delivery_times.length == 0) {
      wx.showToast({
        icon: "none",
        title: "不可配送，更换地址或删除不可配送商品"
      })
      return
    }

    this.setData({
      pop: pop
    })

  },
  //麦点抵扣
  selectMai() {
    let {
      jinmai,
      payQueue,
      hasMai
    } = this.data
    let newPayQueue = payQueue.slice(0)

    if (hasMai) {
      mai = 0
      hasMai = false
    } else {
      mai = jinmai.now_price
      hasMai = true
    }
    this.setData({
      hasMai: hasMai
    })
    let oldMaiPrice = jinmai.now_price;
    newPayQueue[1] = mai
    this.setData({
      payQueue: newPayQueue,
      oldMaiPrice:oldMaiPrice,
    })
    //this.initOrderPrice()
  },
  confirmSore() {
    this.close()
  },
  close() {
    this.setData({
      startCheck:false,
      selectDate:this.data.checkDate,
      pop: 0
    })
  },
  selectDate(e) {
    let selectDate = e.currentTarget.dataset.idx
    this.setData({
      startCheck:true,
      selectDate: selectDate,
    })
  },
  confirmDate() {
    let {
      delivery,
      checkDate,
      checkTime,
    } = this.data

    let selectDateTxt = util.formatDate(delivery.delivery_times[checkDate].date)
    let selectTimeTxt = delivery.delivery_times[checkDate].time_range[checkTime].range
    let stock_type = delivery.delivery_times[checkDate].time_range[checkTime].stock_type

    let dateStr = ''
    let d1 = new Date(util.formatTime(new Date())).getTime()
    let d2 = new Date(selectDateTxt).getTime()
    let day = parseInt((d2 - d1) / 1000 / 3600 / 24)
    if (day == 1) {
      dateStr = "明天"
    } else if (day == 0) {
      dateStr = "今天"
    } else if (day == 2) {
      dateStr = "后天"
    }

    dateStr += util.getDate(selectDateTxt)

    this.setData({
      dateStr: dateStr,
      selectDateTxt: delivery.delivery_times[checkDate].date,
      selectTimeTxt: selectTimeTxt,
      stock_type: stock_type
    })
    this.close()
  },
  selectTime(e) {
    console.log(e);
    
    let selectTime = e.currentTarget.dataset.idx
    this.setData({
      startCheck:true,
      selectTime: selectTime,
      // selectDate:this.data.selectDate,
      checkDate:this.data.selectDate,
      checkTime:selectTime,
    })
    this.confirmDate();
    // this.close();
  },
  selectTimeOld(e) {
    let selectTime = e.currentTarget.dataset.idx
    this.setData({
      selectTime: selectTime,
      checkChange: false,
      tempDate: this.data.selectDate,
    })
  },
  selectAdd(e) {
    if (this.data.ziti == '1') {
      wx.showToast({
        icon: "none",
        title: "暂不能选择自提点"
      })
      return
    }
    let source = e.currentTarget.dataset.source
    wx.navigateTo({
      url: '/pages/user/address/address?source=' + source + '&cartType=' + this.data.type
    })
  },
  initOrderData() {
    wx.showLoading({
      mask:true,
      title: '加载中...'
    })
    let {
      type,
      useBalance,
      verifyed,
      city_id,
      is_ziti,
      ziti,
      address_id
    } = this.data

    let data = {
      city_id: city_id,
      is_ziti: is_ziti,
      choose_ziti: ziti,
      address_id: address_id
    }
    if (type == "1") {
      txtCard = null
      //面包
      api.getOrderBread(data).then(res => {
        console.log(res);
        wx.hideLoading();
        if (!res) {
          return
        }

        if(res.address && res.address.is_address && !res.address.address_allow_delivery){
          wx.showToast({
            icon: "none",
            title: "当前选中地址无法配送，请选择可用地址",
            duration: 3000
          })
        }

        let cart_data = res.cart_data
        let newcart_data = {
          can_promotion_count: cart_data.can_promotion_count,
          can_use_promotion: cart_data.can_use_promotion,
          change_delivery_price: cart_data.change_delivery_price,
          default_delivery: cart_data.default_delivery,
          delivery_price: cart_data.delivery_price,
          free_msg: cart_data.free_msg,
          free_type: cart_data.free_type,
          number: cart_data.total_number,
          price: cart_data.select_price,
          total_price: cart_data.total_price
        }

        let hasMai = res.jinmai.can
        //整理点击
        var useShowStatus = {};
        var unUsedShowStatus = {};
        for (let index in cart_data.promotion_info) {
          useShowStatus[index] = false;
        }
        for (let index in cart_data.promotion_info_unable) {
          unUsedShowStatus[index] = false;
        }

        let deliveryData = {};
        for(let deliveryDateIndex in res.delivery.delivery_times){
          for(let deliveryTimeIndex in res.delivery.delivery_times[deliveryDateIndex]['time_range']){
            deliveryData[deliveryDateIndex+"_"+deliveryTimeIndex] = res.delivery.delivery_times[deliveryDateIndex]['date']+'_'+res.delivery.delivery_times[deliveryDateIndex]['time_range'][deliveryTimeIndex]['range'];
          }
        }
        this.data.deliveryData = deliveryData;
        console.log(deliveryData)
        console.log('---------------')
        console.log(res.delivery);
        this.setData({
          biggest_discount: res.biggest_discount,
          hasMai: hasMai,
          address: res.address,
          balance: res.balance,
          balanceInfo: res.balance_config,
          useBalance:res.pay_style.balance==1?true:false,
          pay_style: res.pay_style,
          jinmai: res.jinmai,
          delivery: res.delivery,
          cart_data: newcart_data,
          proList: cart_data.detail,
          couponList: cart_data.promotion_info,
          unableCouponList: cart_data.promotion_info_unable,
          couponPrice: cart_data.promotion_price,
          useShowStatus,
          unUsedShowStatus
        })
        this.initOrderPrice()
        wx.reportAnalytics('payorder', {
          type: "面包",
          total_price: cart_data.total_price,
        });
      })

    } else {
      txtCard = {}
      //蛋糕
      api.getOrderCake(data).then(res => {
        wx.hideLoading();
        console.log(res);
        let cart_data = res.cart_data
        let newcart_data = {
          can_promotion_count: cart_data.can_promotion_count,
          can_use_promotion: cart_data.can_use_promotion,
          change_delivery_price: cart_data.change_delivery_price,
          default_delivery: cart_data.default_delivery,
          delivery_price: cart_data.delivery_price,
          free_msg: cart_data.free_msg,
          free_type: cart_data.free_type,
          number: cart_data.total_number,
          price: cart_data.select_price,
          total_price: cart_data.total_price
        }

        let hasMai = res.jinmai.can
        let detail = cart_data.detail

        detail.find(item => {
          if (item.is_fittings == 0 && item.is_mcake_message == 1) {
            txtCard[item.cart_id] = item.default_mcake_message
          }
        })


        this.setData({
          biggest_discount: res.biggest_discount,
          hasMai: hasMai,
          fittings_desc: res.fittings_desc,
          address: res.address,
          balance: res.balance,
          balanceInfo: res.balance_config,
          useBalance:res.pay_style.balance==1?true:false,
          pay_style: res.pay_style,
          jinmai: res.jinmai,
          delivery: res.delivery,
          cart_data: newcart_data,
          proList: cart_data.detail,
          couponList: cart_data.promotion_info,
          unableCouponList: cart_data.promotion_info_unable,
          couponPrice: cart_data.promotion_price,
          txtCardObj: txtCard,
        })
        this.initOrderPrice()
        wx.reportAnalytics('payorder', {
          type: "蛋糕",
          total_price: cart_data.total_price,
        });
      })
    }
  },
  //初始化订单金额 扣除麦点 余额
  //hasDelivery false 免邮 10
  //hasDelivery true 需邮费 0
  initOrderPrice() {
    let useCoupon, hasDelivery
    let {
      cart_data,
      jinmai,
      hasMai,
      payQueue,
      ziti,
      biggest_discount
    } = this.data
    let newPayQueue = payQueue.slice(0)

    //初始运费
    if (ziti == "1") {
      hasDelivery = false
    } else {
      if (cart_data.free_type == 1) {
        hasDelivery = false
      } else {
        hasDelivery = true
      }
    }

    //初始金额(price)不含邮费
    if (!hasDelivery) { //免邮
      //2 单品+x 可免邮  1 满减免邮  可与优惠券同用    0 
      delivery = 0
    } else { //加邮费
      delivery = -parseInt(cart_data.default_delivery)
    }

    //初始优惠券
    if (!biggest_discount.type) {
      useCoupon = false
      coupon = 0
      this.setData({
        useDiscount: false,
        couponCheck: -1,
        curId: -1
      })
    }
    if (biggest_discount.type == 'promotion') {
      let promotion = biggest_discount.promotion_info
      useCoupon = true
      coupon = promotion.promotion_price
      this.setData({
        useDiscount: true,
        defaultCoupon: promotion.promotion_id,
        couponCheck: promotion.promotion_id,
        curId: promotion.promotion_id
      })
    }
    if (biggest_discount.type == 'free_delivery') {
      useCoupon = true
      coupon = cart_data.default_delivery
      this.setData({
        useDiscount: true,
        defaultCoupon: 1,
        couponCheck: 1,
        curId: 1
      })
    }

    //初始麦点抵扣
    if (hasMai) {
      mai = jinmai.now_price
    } else {
      mai = 0
    }

    //填入待减值
    newPayQueue[1] = util.formatePrice(mai)
    newPayQueue[0] = delivery
    newPayQueue[2] = util.formatePrice(coupon)

    console.log(newPayQueue)

    this.setData({
      useCoupon,
      hasDelivery,
      payQueue: newPayQueue,
      oldMaiPrice:jinmai.now_price || 0,
    })

    
  },
  setPayPrice(payQueue) {
    let payPrice = this.data.cart_data.price
    //初始总价依次减去支付队列中的抵扣额
    payPrice = payQueue.reduce((pre, cur) => {
      return util.floatObj().subtract(pre, cur)
    }, payPrice)
    if(payPrice<0){
      payPrice=0
    }
    console.log(payPrice)
    //payPrice = parseFloat(payPrice)
    
    this.setData({
      preUseBalancePrice: payPrice, //存一个初始可使用余额
      payPrice: util.formatePrice(payPrice)
    })
    this.setBalancePrice()
  },
  switch (e) {
    let useBalance = this.data.useBalance
    if (useBalance) {
      this.setData({
        useBalance: false,
        verifyed: true
      })
    } else {
      this.setData({
        useBalance: true,
        verifyed: false
      })
    }
    this.setBalancePrice()
  },
  //抵余额扣与否  
  setBalancePrice() {
    let balanceNum = parseFloat(this.data.balance),
      payPrice = parseFloat(this.data.payPrice),
      balanceTxt = ''

    let {
      free_amount,
      free_secret,
      pwd_set
    } = this.data.balanceInfo, {
      useBalance,
      verifyed
    } = this.data
    free_amount = parseFloat(free_amount)

    if(this.data.pay_style.balance==10){
      if (balanceNum >= payPrice) {
        balanceTxt = this.data.payPrice
      } else {
        balanceTxt = balanceNum
      }
      this.setData({
        balanceTxt:util.formatePrice(balanceTxt),
      })
      return
    }

    //扣除原麦余额
    if (useBalance) {
      if (balanceNum >= payPrice) {
        payPrice = 0
        balanceTxt = this.data.preUseBalancePrice
      } else {
        payPrice = util.floatObj().subtract(payPrice, balanceNum)
        balanceTxt = balanceNum
      }
      //使用余额是否需要验证
      if (pwd_set == 0) {
        verifyed = false
      } else {
        if (free_secret == 1 && free_amount > balanceTxt) {
          verifyed = true
        } else {
          verifyed = false
        }
      }
      this.setData({
        verifyed: verifyed,
        balanceTxt:util.formatePrice(balanceTxt),  //可用原麦余额
        payPrice: util.formatePrice(payPrice)      //合计需要支付
      })
    } else {
      this.setData({
        payPrice: util.formatePrice(this.data.preUseBalancePrice)
      })
    }
  },
  selectPolicy() {
    let hasPolicy = this.data.hasPolicy
    if (hasPolicy) {
      this.setData({
        hasPolicy: false
      })
    } else {
      this.setData({
        hasPolicy: true
      })
    }

  },
  useCard(e) {
    let isUse = 0
    let type = e.currentTarget.dataset.type
    if (type == 1) {
      if (this.data.hasCard) {
        isUse = 1
      }
    } else {
      if (this.data.hasThirdCard) {
        isUse = 1
      }
    }
    let preUseBalancePrice = this.data.preUseBalancePrice
    wx.navigateTo({
      url: '/pages/account/cashcharge/cashcharge?use=1&type=' + type + '&cardPrice=' + preUseBalancePrice + '&isUse=' + isUse
    })
  },
  setCardPrice(price, type, card_no, card_pwd) {
    let payQueue = this.data.payQueue
    let newPayQueue = payQueue.slice(0)
    if (type == 1) {
      newPayQueue[3] = price
      if (!card_no) {
        this.setData({
          hasCard: false
        })
      } else {
        this.setData({
          cash_card_no: card_no,
          cash_card_pwd: card_pwd,
          hasCard: true
        })
      }

    }
    if (type == 2) {
      newPayQueue[4] = price
      if (!card_no) {
        this.setData({
          hasThirdCard: false
        })
      } else {
        this.setData({
          third_cash_card_no: card_no,
          third_cash_card_pwd: card_pwd,
          hasThirdCard: true
        })
      }
    }
    this.setData({
      payQueue: newPayQueue
    })
  },
  inputZitiName: function (e) {
    let val = e.detail.value
    this.setData({
      zitiName: val
    })
  },
  inputZitiPhone:function (e) {
    let val = e.detail.value
    this.setData({
      zitiPhone: val
    })
  },
  bindPhoneSucess(e) {
    this.setData({
      'userInfo.phone':e.detail
    })
    this.submmitOrder()
  },
  submmitOrder: util.debounce(function () {
    
    let that = this
    let {
      cart_data,
      address,
      addressInfo,
      address_id,
      selectDateTxt,
      selectTimeTxt,
      type,
      stock_type,
      delivery,
      ziti,
      payQueue,
      balanceTxt,
      hasPolicy,
      curId,
      useCoupon,
      hasCard,
      hasThirdCard,
      useBalance,
      verifyed,
      zitiName,
      zitiPhone,
      balanceInfo,
      pay_style
    } = this.data
    let balance_price = useBalance == "1" ? balanceTxt : 0
    if (!address.address_allow_delivery) {
      wx.showToast({
        icon: "none",
        title: "请选择可配送地址"
      })
      return
    }

    if (ziti != "0" && zitiName == '') {
      wx.showToast({
        icon: "none",
        title: "请填写提货人姓名"
      })
      return
    }

    if (ziti != "0" && zitiPhone == '') {
      wx.showToast({
        icon: "none",
        title: "请填写提货人手机号"
      })
      return
    }
    if (ziti != "0" && !util.isMobile(zitiPhone)) {
      wx.showToast({
        icon: "none",
        title: "请填写正确的手机号"
      })
      return
    }

    if (!selectDateTxt || !selectTimeTxt) {
      this.setData({
        pop: 'showTime'
      })
      return
    }

    if (!hasPolicy) {
      wx.showToast({
        icon: "none",
        title: "请先确定购买须知"
      })
      return
    }

    if (pay_style.balance == 1) {
      if (!verifyed && balanceInfo.pwd_set == 0) {
        this.setData({
          popShow: true,
          poptitle: "请设置余额密码",
          step: 2
        })
        return
      }
      if (!verifyed && balanceInfo.pwd_set == 1) {
        this.setData({
          popShow: true,
          poptitle: "请输入设置的余额密码",
          step: 1
        })
        return
      }
    }

    console.log(payQueue)
    console.log(balance_price)

    console.log(addressInfo)
    let deliveryPrice = Math.abs(payQueue[0])
    let data = {
      address_id: address_id,
      delivery_date: selectDateTxt,
      delivery_time: selectTimeTxt,
      cart_type: type,
      stock_type: stock_type,
      delivery_type: delivery.delivery_type,
      delivery_price: deliveryPrice,
      balance_price: balance_price,
      point_price: payQueue[1],
    }
    if (ziti != "0") {
      data.ziti = '1'
      data.name = zitiName
      data.mobile = zitiPhone
    }
    //活动免邮
    if (curId == 1) {
      data.delivery_price = 0
    }
    if (useCoupon && curId != 1) {
      data.promotion_price = payQueue[2]
      data.promotion_id = curId
    }
    if (hasCard) {
      data.cash_price = payQueue[3]
      data.cash_card_no = this.data.cash_card_no
      data.cash_card_pwd = this.data.cash_card_pwd
    }
    if (hasThirdCard) {
      data.third_cash_price = payQueue[4]
      data.third_cash_card_no = this.data.third_cash_card_no
      data.third_cash_card_pwd = this.data.third_cash_card_pwd
    }
    if (txtCard) {
      console.log(txtCard)
      data.message = JSON.stringify(txtCard)
    }
    console.log('---支付参数---')
    console.log(data)
    console.log('------')
    wx.showLoading({mask:true,title:'正在支付'})

    api.submmitOrder(data).then(res => {
      wx.hideLoading();
      console.log(res)
      if (!res) {
        return
      }
      
      if (res == app.globalData.bindPhoneStat) {
        this.setData({
          phoneStat: 1,
          showPhonePanel: true
        })
        return
      }
      let order_code = res.orderCode
      //清除已记住的卡号密码
      app.globalData.cardNo = ''
      app.globalData.cardPwd = ''
      if (res.callPay) {
        let jsApiParameters = res.jsApiParameters
        let {
          timeStamp,
          nonceStr,
          signType,
          paySign
        } = jsApiParameters
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
                wx.redirectTo({
                  url: '/pages/cart/paySuccess/paySuccess?orderCode=' + order_code,
                })
                
                wx.reportAnalytics('payinfo', {
                  paytype: "微信支付",
                  cart_type:data.cart_type==1?"面包":"蛋糕",
                  balance_price:data.balance_price,
                  promotion_price:data.promotion_price,
                  delivery_price:data.delivery_price,
                  point_price:data.point_price,
                  wx_price:res["to_pay_price "],
                  total_price:cart_data.total_price,
                  user_id:that.data.userInfo.user_id
                });
              }
            })

          },
          fail(err) {
            console.log(err)
            wx.showToast({
              title: "支付失败",
              icon: 'none',
              duration: 2000
            })
            wx.hideLoading()
            wx.redirectTo({
              url: '/pages/user/order/order?type=1'
            })
          }
        })
      } else {
        wx.showToast({
          icon: "success",
          title: "支付成功"
        })
        wx.redirectTo({
          url: '/pages/cart/paySuccess/paySuccess?orderCode=' + order_code,
        })
        wx.reportAnalytics('payinfo', {
          paytype: "余额支付",
          cart_type:data.cart_type==1?"面包":"蛋糕",
          balance_price:data.balance_price,
          delivery_price:data.delivery_price,
          point_price:data.point_price,
          promotion_price:data.promotion_price,
          total_price:cart_data.total_price,
          wx_price:'0',
          user_id:that.data.userInfo.user_id
        });
      }
    })
  },500,true),
  inputCard: util.debounce(function (e) {
    console.log('inputCard')
    let temp = e.detail.value
    let defTxt = e.currentTarget.dataset.default
    if (temp.replace(/[^\x00-\xff]/g, "aa").length > 18) {
      let tlength = 0;
      let subLen = 0;
      for (let i = 0; i < temp.length; i++) {
        if (tlength >= 18) {
          break;
        }
        tlength += 1;
        if (temp.charCodeAt(i) > 128) {
          if (tlength >= 18) {
            tlength -= 1;
            break;
          }
          tlength += 1;
        }
        subLen += 1;
      }
      temp = temp.substring(0, subLen);
      this.setData({
        ['txtCardObj[' + e.target.dataset.cartid + ']']: temp,
      })
      wx.showToast({
        icon: "none",
        title: "请输入9个汉字或18个数字字母"
      })
      return
    }
    txt = temp == "" ? defTxt : temp,
      cartid = e.currentTarget.dataset.cartid
  }),
  setTxt(e) {
    console.log('setTxt')
    if (cartid) {
      txtCard[cartid] = txt
      this.setData({
        txtCardObj: txtCard
      })
    } else {
      let defMsg = e.currentTarget.dataset.defaultmakemsg;
      if (e.detail.value == "") {
        this.data.txtCardObj[e.target.dataset.cartid ] = defMsg
        this.setData({
          txtCardObj: this.data.txtCardObj,
        })
      }
    }
  },
  clearTxt(e) {
    let defMsg = e.currentTarget.dataset.defaultmakemsg;
    let val = e.currentTarget.dataset.value;
    if (val == defMsg) {
      this.data.txtCardObj[e.target.dataset.cartid] = '';
      this.setData({
        txtCardObj:this.data.txtCardObj,
      })
    }
  },
  pwdInput(e) {
    var val = e.detail.value
    if (val.length == 6) {
      this.setData({
        pwdVal: val,
        unuse: false
      })
    } else {
      this.setData({
        pwdVal: val,
        unuse: true
      })
    }
  },
  initPwdInput:function (e) {
    let val = e.detail.value
    let confirmPwd = this.data.confirmPwd || ''
    this.setData({
      initPwd: val
    })
    if (val.length == 6 && confirmPwd.length == 6) {
      this.setData({
        unuse: false
      })
    }
    if (val.length != 6 || confirmPwd.length != 6) {
      this.setData({
        unuse: true
      })
    }
  },
  confirmInput: util.debounce(function (e) {
    let val = e.detail.value
    let initPwd = this.data.initPwd || ''
    this.setData({
      confirmPwd: val
    })
    if (val.length == 6 && initPwd.length == 6) {
      this.setData({
        unuse: false
      })
    }
    if (val.length != 6 || initPwd.length != 6) {
      this.setData({
        unuse: true
      })
    }
  }, 200),
  verifyPwd(val) {
    let data = {
      password: val
    }
    api.verifyPwd(data).then(res => {
      console.log(res);
      if (res) {
        this.setData({
          poptitle: "输入密码",
          step: 2
        })
      }
    })
  },
  verifyInput(e) {
    var val = e.detail.value
    if (val.length == 6) {
      this.setData({
        verify: val,
        unuse: false
      })
    } else {
      this.setData({
        verify: val,
        unuse: true
      })
    }
  },

  forgetPwd() {
    this.setData({
      poptitle: "输入验证码",
      step: 3,
      confirmText: "下一步"
    })
  },
  secondDown(num) {
    if (num == 0) {
      clearTimeout(timer)
      this.setData({
        isSend: false,
        tips: "重新获取验证码"
      })
      return
    } else {
      num--
    }
    this.setData({
      second: num
    })
    let timer = setTimeout(() => {
      this.secondDown(num)
    }, 1000);
  },
  getCode() {
    let mobile = this.data.userInfo.phone
    let data = {
      mobile: mobile,
      send_type: "password"
    }
    api.getCode(data).then(res => {
      this.secondDown("20")
      this.setData({
        isSend: true
      })
      console.log(res)
      if (!res) {
        wx.showToast({
          title: "验证码发送失败",
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: '验证码发送成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  confirm(e) {
    let step = this.data.step
    if (step == 1) {
      let val = this.data.pwdVal
      if (!val || val.length < 6) {
        wx.showToast({
          title: '请输入6位数字密码',
          icon: 'none',
          duration: 2000
        })
        return
      }
      let data = {
        password: val
      }
      api.verifyPwd(data).then(res => {
        console.log(res);
        if (res) {
          this.setData({
            popShow: false,
            useBalance: true,
            verifyed: true
          })
          if (this.data.balanceInfo.pwd_set == 0) {
            //this.setBalancePrice()
            this.setData({
              'balanceInfo.pwd_set': 1
            })
          }
          this.submmitOrder()
        }
      })
    }
    if (step == 2) {
      let {
        confirmPwd,
        initPwd,
        balanceInfo
      } = this.data
      if (!confirmPwd || confirmPwd.length < 6 || !initPwd || initPwd.length < 6) {
        wx.showToast({
          title: '请输入6位数字密码',
          icon: 'none',
          duration: 2000
        })
        return
      }
      let data = {
        password: initPwd,
        re_password: confirmPwd
      }
      api.setPwd(data).then(res => {
        console.log(res)

        wx.showToast({
          title: '密码设置成功',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          popShow: false,
          useBalance: true,
          verifyed: true,
          unuse: true
        })
        if (this.data.balanceInfo.pwd_set == 0) {
          //this.setBalancePrice()
          this.setData({
            'balanceInfo.pwd_set': 1
          })
        }
        this.submmitOrder()

      })
    }
    if (step == 3) {
      let verify = this.data.verify,
        phone = this.data.userInfo.phone

      if (!verify || verify.length < 6) {
        wx.showToast({
          title: '请输入6位验证码',
          icon: 'none',
          duration: 2000
        })
        return
      } else {
        let data = {
          code: verify,
          mobile: phone,
          send_type: "password"
        }
        api.verifyCode(data).then(res => {
          console.log(res)
          this.setData({
            poptitle: "输入密码",
            step: 2
          })
        })
      }
    }

  },
  closePanel(e) {
    this.setData({
      unuse: true
    })
  },
  changePwd(e) {
    console.log(e)
    this.setData({
      popShow: true,
      poptitle: "设置余额密码",
      step: 2,
      confirmText: "确定",
    })
  },
  getWxUrl(){
    let instructions = wx.getStorageSync('instructions')

    if(instructions){
      instructions = JSON.parse(instructions)
      let url =instructions['subscribe-article']
         
      this.setData({
        wxUrl:url
      })
    }else{
      api.getIntroduction().then(res=>{
        console.log(res);
        if(res){
          instructions = res.instructions
          let txt =instructions['cart-top'],
          tipsBread = instructions['cart-bread-tips'],
          tipsCake = instructions['cart-cake-tips']
          this.setData({
            tipsBread,
            tipsCake,
            instructions:txt
          })
          wx.setStorageSync("instructions", JSON.stringify(res.instructions))
          
        }
      })
    }
  },
  hasChangeFollow(){
    let {
      type,
      useBalance,
      verifyed,
      city_id,
      is_ziti,
      ziti,
      address_id
    } = this.data

    let data = {
      city_id: city_id,
      is_ziti: is_ziti,
      choose_ziti:ziti,
      address_id: address_id
    }

    if (type == "1") {
      //面包
      api.getOrderBread(data).then(res => {
        console.log(res);
        if (!res) {
          return
        }
        this.setData({
          pay_style: res.pay_style,
          useBalance:res.pay_style.balance==1?true:false,
        })
        this.initOrderPrice()
      })

    } else {
      //蛋糕
      api.getOrderCake(data).then(res => {
        console.log(res);
        this.setData({
          pay_style: res.pay_style,
          useBalance:res.pay_style.balance==1?true:false,
        })
        this.initOrderPrice()
      })
    }
  },
  hasChangeAddress(){
    let addressInfo = wx.getStorageSync("addressInfo")
    addressInfo = addressInfo && JSON.parse(addressInfo)
    if (addressInfo) {
      this.setData({
        is_ziti: addressInfo.is_ziti,
        city_id: addressInfo.city_id,
        address_id: addressInfo.id || 0,
        addressInfo: addressInfo,
        zitiName: addressInfo.name,
        zitiPhone: addressInfo.mobile,
        'address.is_address': true
      })
    }
    this.initOrderData();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.getUserLocation()
    let userInfo = wx.getStorageSync('userInfo')
    let btmHolder = wx.getStorageSync('btmHolder')
    let type = options.type
    console.log(type);
    //用户地址列表
    let addressInfo = wx.getStorageSync("addressInfo")
    addressInfo = addressInfo && JSON.parse(addressInfo)
    if (addressInfo) {
      this.setData({
        type: type,
        changedId: addressInfo.id,
        is_ziti: addressInfo.is_ziti,
        city_id: addressInfo.city_id,
        address_id: addressInfo.id || 0,
        zitiName: addressInfo.name,
        zitiPhone: addressInfo.mobile,
        addressInfo: addressInfo,
        'address.is_address': true
      })
    }
    this.initOrderData();
    this.getWxUrl()
    util.setWatcher(this);

    this.setData({
      btmHolder: btmHolder || 0,
      userInfo: JSON.parse(userInfo),
    })
    
  },
  watch: {
    'payQueue': function (value, oldValue) {
      console.log("watch");
      console.log(value);
      if (value == oldValue) {
        return
      }

      this.setPayPrice(value)
    },
    'changedId': function (value, oldValue) {
      console.log("watch");
      console.log(value);
      if (value == oldValue) {
        return
      }
      let addressInfo = wx.getStorageSync("addressInfo")
      addressInfo = addressInfo && JSON.parse(addressInfo)
      if (addressInfo) {
        this.setData({
          is_ziti: addressInfo.is_ziti,
          city_id: addressInfo.city_id,
          address_id: addressInfo.id || 0,
          addressInfo: addressInfo,
          zitiName: addressInfo.name,
          zitiPhone: addressInfo.mobile,
          'address.is_address': true
        })
      }
      this.initOrderData();
      //this.setPayPrice(value)
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
    // let pages = getCurrentPages();
    // let currentPage = pages[pages.length - 1];
    // let type = currentPage.options.type
    // console.log(type);
    // //用户地址列表
    // let addressInfo = wx.getStorageSync("addressInfo")
    // addressInfo = addressInfo && JSON.parse(addressInfo)
    // if (addressInfo) {
    //   this.setData({
    //     type: type,
    //     is_ziti: addressInfo.is_ziti,
    //     city_id: addressInfo.city_id,
    //     address_id: addressInfo.id,
    //     addressInfo: addressInfo,
    //     'address.is_address': true
    //   })

    // }
    //关注公众号
    if(this.data.changeFollow){
      this.hasChangeFollow()
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
})