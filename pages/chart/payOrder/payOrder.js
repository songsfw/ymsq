const {
  getUserLocation
} = require('../../../utils/api.js')
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
    selectDate: 0,
    selectTime: -1,
    checkDate: null,
    checkTime: null,
    checkChange: true,
    tempTime: -1,
    tempDate:-1,
    payQueue: [10, 0, 0, 0, 0],
    useCoupon: false,
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

    isSet: null
  },

  closeCoupon() {
    this.setData({
      useCoupon: false,
      pop: 0
    })
  },
  //优惠券抵扣
  confirmCoupon() {
    let {
      curId,
      couponPrice
    } = this.data
    if (!curId) {
      this.setData({
        useCoupon: false,
      })
    } else {
      console.log(couponPrice[curId].promotion_price)
      this.setData({
        useCoupon: true,
        usedCouponPrice: couponPrice[curId].promotion_price
      })
    }
    this.initOrderPrice()
    this.close()
  },
  selectCoupon(e) {
    let id = e.currentTarget.dataset.id
    let curId
    console.log(id)
    let {
      couponList
    } = this.data

    if (this.data.curtabid == 1) {
      if (couponList[id].selected) {
        couponList[id].selected = false
      } else {
        for (let key in couponList) {
          couponList[key].selected = false
        }
        couponList[id].selected = true
        curId = id
      }

      this.setData({
        curId,
        couponList
      })
    }
  },
  showTips(e) {
    let idx = e.currentTarget.dataset.idx
    console.log(idx)
    let {
      couponList,
      unableCouponList
    } = this.data

    if (this.data.curtabid == 1) {
      if (couponList[idx].showTip) {
        couponList[idx].showTip = false
      } else {
        couponList[idx].showTip = true
      }

      this.setData({
        couponList
      })
    } else {
      if (unableCouponList[idx].showTip) {
        unableCouponList[idx].showTip = false
      } else {
        unableCouponList[idx].showTip = true
      }

      this.setData({
        unableCouponList
      })
    }
  },
  showAllPro() {
    this.setData({
      showAll: true
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
    let delivertTip = ziti == '1' ? '自提无配送费' : '满减免邮费不能与优惠券同时使用'
    this.setData({
      ziti: ziti,
      delivertTip: delivertTip
    })
    this.initOrderPrice()
  },
  showPop(e) {

    let pop = e.currentTarget.dataset.pop
    this.setData({
      pop: pop
    })
  },
  //麦点抵扣
  selectMai() {
    if (this.data.hasMai) {
      this.setData({
        hasMai: false
      })
    } else {
      this.setData({
        hasMai: true
      })
    }
    this.initOrderPrice()
  },
  confirmSore() {
    this.close()
  },

  close() {
    this.setData({
      pop: 0
    })
  },
  selectDate(e) {
    let selectDate = e.currentTarget.dataset.idx
    console.log(selectDate)

    let cdate = this.data.checkDate === null ? selectDate : this.data.checkDate;
    console.log(cdate);
    this.setData({
      selectDate: selectDate,
      // selectDate:cdate,
      selectTime: -1
    })
  },
  confirmDate() {
    console.log(this.data);
    let {
      delivery,
      selectDate,
      selectTime
    } = this.data
    if (selectTime == -1) {
      wx.showToast({
        icon: "none",
        title: "请选择时间段"
      })
      return
    }
    console.log(selectDate);
    console.log(selectTime);

    let selectDateTxt = util.formatDate(delivery.delivery_times[selectDate].date)
    let selectTimeTxt = delivery.delivery_times[selectDate].time_range[selectTime].range
    let stock_type = delivery.delivery_times[selectDate].time_range[selectTime].stock_type

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
      checkDate: selectDate,
      checkTime: selectTime,
      checkChange: true,
      selectDateTxt: delivery.delivery_times[selectDate].date,
      selectTimeTxt: selectTimeTxt,
      stock_type: stock_type
    })
    this.close()
  },
  selectTime(e) {
    let selectTime = e.currentTarget.dataset.idx
    this.setData({
      selectTime: selectTime,
      checkChange: false,
      tempTime:selectTime,
      tempDate:this.data.selectDate,
    })
  },

  inputRemark: util.debounce(function (e) {
    this.setData({
      error: false,
      remark: e.detail.value
    })
  }, 500),
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
      title: '加载中'
    })
    let {
      type,
      useBalance,
      verifyed,
      city_id,
      is_ziti,
      address_id
    } = this.data

    let data = {
      city_id: city_id,
      is_ziti: is_ziti,
      address_id: address_id
    }
    if (type == "1") {
      //面包
      api.getOrderBread(data).then(res => {
        console.log(res);
        if (!res) {
          // wx.showModal({
          //   title: '',
          //   content: '当前地址不在配送范围，选择其他地址',
          //   showCancel:false,
          //   confirmText: "确定",
          //   success(res) {

          //     wx.navigateTo({
          //       url:'/pages/user/address/address?source=1&cartType='+this.data.type
          //     })

          //   }
          // })
          return
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
          number: cart_data.number,
          price: cart_data.price,
          total_price: cart_data.total_price
        }

        let hasMai = res.jinmai.can
        // let balanceInfo = res.balance_config
        // let {free_secret} = balanceInfo

        // if(useBalance){
        //   if(free_secret=="0"){
        //     verifyed = false
        //   }else{
        //     verifyed = true
        //   }
        // }

        this.setData({
          hasMai: hasMai,
          address: res.address,
          balance: res.balance,
          balanceInfo: res.balance_config,
          pay_style: res.pay_style,
          jinmai: res.jinmai,
          delivery: res.delivery,
          cart_data: newcart_data,
          proList: cart_data.detail,
          couponList: cart_data.promotion_info,
          unableCouponList: cart_data.promotion_info_unable,
          couponPrice: cart_data.promotion_price
        })
        this.initOrderPrice()
      })

    } else {
      txtCard = {}
      //蛋糕
      api.getOrderCake(data).then(res => {
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
          number: cart_data.number,
          price: cart_data.price,
          total_price: cart_data.total_price
        }

        let hasMai = res.jinmai.can
        // let balanceInfo = res.balance_config
        // let {free_secret} = balanceInfo
        let detail = cart_data.detail

        detail.find(item => {
          if (item.is_fittings == 0 && item.is_mcake_message == 1) {
            txtCard[item.cart_id] = item.default_mcake_message
          }
        })
        console.log(txtCard);
        // if(useBalance){
        //   if(free_secret=="0"){
        //     verifyed = false
        //   }else{
        //     verifyed = true
        //   }
        // }

        this.setData({
          hasMai: hasMai,
          fittings_desc: res.fittings_desc,
          address: res.address,
          balance: res.balance,
          balanceInfo: res.balance_config,
          pay_style: res.pay_style,
          jinmai: res.jinmai,
          delivery: res.delivery,
          cart_data: newcart_data,
          proList: cart_data.detail,
          couponList: cart_data.promotion_info,
          unableCouponList: cart_data.promotion_info_unable,
          couponPrice: cart_data.promotion_price
        })
        this.initOrderPrice()
      })
    }
  },
  //初始化订单金额 扣除麦点 运费 余额
  //hasDelivery false 免邮-减邮费 10
  //hasDelivery true 需邮费-不减邮费 0
  initOrderPrice() {
    let {
      cart_data,
      jinmai,
      hasDelivery,
      hasMai,
      useCoupon,
      payQueue,
      is_ziti,
      ziti
    } = this.data
    let newPayQueue = payQueue.slice(0)

    //有麦点减去麦点抵扣
    if (hasMai) {
      mai = jinmai.now_price
    } else {
      mai = 0
    }
    newPayQueue[1] = mai

    if (is_ziti == 1 && ziti == '1') {
      hasDelivery = false

      if (useCoupon) {
        coupon = this.data.usedCouponPrice
      } else {
        coupon = 0
      }
    } else {
      if (useCoupon) {
        if (cart_data.free_type == 1) {
          hasDelivery = false
        } else {
          hasDelivery = true
        }
        coupon = this.data.usedCouponPrice
      } else {
        if (cart_data.free_type == 1 || cart_data.free_type == 2) {
          hasDelivery = false
        } else {
          hasDelivery = true
        }
        coupon = 0
      }
    }

    //无运费减去运费
    if (!hasDelivery) { //免邮-需要减去邮费
      //1 单品免邮，可与优惠券同用  2 满减免邮  0 
      delivery = parseInt(cart_data.default_delivery)
    } else { //要邮费-不用减邮费
      delivery = 0
    }

    newPayQueue[0] = delivery
    newPayQueue[2] = coupon

    console.log(newPayQueue)

    // newPayQueue[3]=0
    // newPayQueue[4]=0

    this.setData({
      hasDelivery: hasDelivery,
      payQueue: newPayQueue
    })

    wx.hideLoading();
  },
  setPayPrice(payQueue) {
    let payPrice = this.data.cart_data.total_price
    //总价依次减去支付队列中的抵扣额
    payPrice = payQueue.reduce((pre, cur) => {
      return util.floatObj().subtract(pre, cur)
    }, payPrice)
    console.log(payPrice)

    let {
      free_amount,
      free_secret
    } = this.data.balanceInfo, {
      useBalance,
      verifyed
    } = this.data
    free_amount = parseFloat(free_amount)
    payPrice = parseFloat(payPrice)
    if (useBalance) {
      if (free_secret == 1 && free_amount > payPrice) {
        verifyed = true
      } else {
        verifyed = false
      }
    }

    this.setData({
      verifyed: verifyed,
      preUseBalancePrice: payPrice,
      payPrice: payPrice
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
      useBalance = this.data.useBalance
    //扣除原麦余额
    if (useBalance) {
      if (balanceNum >= payPrice) {
        payPrice = 0
      } else {
        payPrice = util.floatObj().subtract(payPrice, balanceNum)
      }
      this.setData({
        payPrice: payPrice,
      })
    } else {
      this.setData({
        payPrice: this.data.preUseBalancePrice
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
  inputZitiName: util.debounce(function (e) {
    let val = e.detail.value
    this.setData({
      zitiName: val
    })
  }, 300),
  submmitOrder: util.debounce(function () {

    let {
      cart_data,
      address,
      addressInfo,
      address_id,
      selectDateTxt,
      selectTimeTxt,
      type,
      remark,
      stock_type,
      delivery,
      ziti,
      payQueue,
      preUseBalancePrice,
      hasPolicy,
      curId,
      useCoupon,
      hasCard,
      hasThirdCard,
      useBalance,
      verifyed,
      zitiName,
      balanceInfo
    } = this.data
    let balance_price = useBalance == "1" ? preUseBalancePrice : 0
    if (!address.address_allow_delivery) {
      wx.showToast({
        icon: "none",
        title: "请选择可配送地址"
      })
      return
    }
    if (!selectDateTxt || !selectTimeTxt) {
      this.setData({
        pop: 'showTime'
      })
      wx.showToast({
        icon: "none",
        title: "请选择配送时间"
      })
      return
    }

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


    console.log(payQueue)
    console.log(balance_price)
    if (!hasPolicy) {
      wx.showToast({
        icon: "none",
        title: "请先确定购买须知"
      })
      return
    }

    console.log(addressInfo)
    let deliveryPrice = payQueue[0] == 0 ? cart_data.default_delivery : 0
    let data = {
      address_id: address_id,
      delivery_date: selectDateTxt,
      delivery_time: selectTimeTxt,
      cart_type: type,
      remark: remark || '',
      stock_type: stock_type,
      delivery_type: delivery.delivery_type,
      delivery_price: deliveryPrice,
      balance_price: balance_price,
      point_price: payQueue[1],
    }
    if (ziti != "0") {
      if (zitiName == '') {
        wx.showToast({
          icon: "none",
          title: "请填写提货人姓名"
        })
        return
      }
      data.ziti = '1'
      data.name = zitiName
    }
    if (useCoupon) {
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
    wx.showLoading({
      title: '加载中'
    })
    api.submmitOrder(data).then(res => {
      wx.hideLoading();
      console.log(res)
      if (!res) {
        wx.showToast({
          icon: "error",
          title: "提交订单失败，刷新页面"
        })
        return
      }
      let order_code = res.orderCode
      if (res.callPay) {
        let jsApiParameters = res.jsApiParameters
        let {
          timeStamp,
          nonceStr,
          signType,
          paySign
        } = jsApiParameters
        // wx.showToast({
        //   icon:"loading",
        //   title:"提交订单成功，发起支付"
        // })

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
                    url: '/pages/chart/paySuccess/paySuccess?orderCode=' + order_code,
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
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/chart/paySuccess/paySuccess?orderCode=' + order_code,
          })
        }, 2000)
      }
    })
  }),
  inputCard: util.debounce(function (e) {
    console.log("1111");
    let temp = e.detail.value
    let defTxt = e.currentTarget.dataset.default
    if (util.charLen(temp) > 18) {
      wx.showToast({
        icon: "none",
        title: "请输入9个汉字或18个数字字母"
      })
      return
    }
    txt = temp == "" ? defTxt : temp,
      cartid = e.currentTarget.dataset.cartid
  }, 200),
  setTxt() {
    if (cartid) {
      txtCard[cartid] = txt

      this.setData({
        txtCardObj: txtCard
      })
      console.log(txtCard)
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
  oldPwdInput: util.debounce(function (e) {
    let val = e.detail.value
    let newPwd = this.data.newPwd || ''
    this.setData({
      oldPwd: val
    })
    if (val.length == 6 && newPwd.length == 6) {
      this.setData({
        unuse: false
      })
    }
    if (val.length != 6 || newPwd.length != 6) {
      this.setData({
        unuse: true
      })
    }
  }, 500),
  newPwdInput: util.debounce(function (e) {
    let val = e.detail.value
    let oldPwd = this.data.oldPwd || ''
    this.setData({
      newPwd: val
    })
    if (val.length == 6 && oldPwd.length == 6) {
      this.setData({
        unuse: false
      })
    }
    if (val.length != 6 || oldPwd.length != 6) {
      this.setData({
        unuse: true
      })
    }
  }, 500),

  initPwdInput: util.debounce(function (e) {
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
  }, 500),
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
  }, 500),
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
          this.setBalancePrice()
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
      if (confirmPwd.length < 6 || initPwd.length < 6) {
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
        this.closePanel()
        this.setBalancePrice()
        this.submmitOrder()

      })
    }
    if (step == 3) {
      let verify = this.data.verify,
        phone = this.data.userInfo.phone

      if (verify.length < 6) {
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
      confirmText: "下一步",
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  // async getUserLocation(){
  //   let local,addressInfo
  //   try {
  //     local = await util.getLocation()
  //   } catch (error) {
  //     local = error
  //   }
  //   let data = {
  //     lng:local.longitude,
  //     lat:local.latitude
  //   }
  //   //当前定位地址
  //   addressInfo = await api.getUserLocation(data)
  //   //addressInfo = addressInfo.address_info
  //   console.log(addressInfo)
  //   this.setData({
  //     is_ziti:addressInfo.address_info.is_ziti
  //   })
  //   console.log(addressInfo)
  // },
  onLoad: function (options) {

    //this.getUserLocation()
    let userInfo = wx.getStorageSync('userInfo')
    let btmHolder = wx.getStorageSync('btmHolder')

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
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let type = currentPage.options.type
    console.log(type);
    //用户地址列表
    let addressInfo = wx.getStorageSync("addressInfo")
    addressInfo = addressInfo && JSON.parse(addressInfo)
    if (addressInfo) {
      this.setData({
        type: type,
        is_ziti: addressInfo.is_ziti,
        city_id: addressInfo.city_id,
        address_id: addressInfo.id,
        addressInfo: addressInfo,
        'address.is_address': true
      })

    }
    this.initOrderData();
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