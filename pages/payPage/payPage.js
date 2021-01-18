//index.js
const util = require('../../utils/util.js')

const api = require('../../utils/api.js')
const app = getApp()
let timer = null
Page({
  data: {

    navHeight: 0,
    noMoreData: false,

    popup: false,
    pageNum: 1

  },

  payOrder: util.debounce(function () {
    let orderId = this.data.orderId
    let data = {
      orderId: orderId
    }
    api.payOrder(data).then(res => {
      console.log(res);
      if(!res){
        return false
      }
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: res.signType,
        paySign: res.paySign,
        success(payres) {
          console.log(payres);
          wx.showToast({
            title: '支付成功',
            icon: 'none',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/user/orderDetail/orderDetail?order_id=' + orderId,
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
    
  },3000,true),
  timing: function (remainTime) {
    remainTime--
    // 获取分秒
    let m = parseInt(remainTime / 60)
    let s = remainTime - m * 60

    let str = util.formatNumber(m) + '分' + util.formatNumber(s) + "秒"
    this.setData({
      remainTime: remainTime,
      timingTxt: str
    })

    timer = setTimeout(() => {
      this.timing(remainTime)
    }, 1000);
  },

  cancelOrder() {
    let orderId = parseInt(this.data.orderId)
    let data = {
      orderId: orderId
    }
    wx.showModal({
      title: '提示',
      cancelText: "取消订单",
      confirmText: "继续支付",
      confirmColor: "#F73950",
      content: '取消当前订单并释放座位',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')

        } else if (res.cancel) {
          api.cancleOrder(data,{ 'content-type': 'application/x-www-form-urlencoded' }).then(stat=>{
            console.log(res);
            if(stat){
              wx.showToast({
                title: "订单取消成功",
                icon: 'none',
                duration: 2000,
                success:function(){
                  wx.navigateBack({
                    delta: 1
                  })
                }
              })
            }else{
              wx.showToast({
                title: "订单取消失败",
                icon: 'none',
                duration: 2000
              })
            }
          })
          console.log('用户点击取消')
        }
      }
    })
  },

  onShow() {
    let orderId = this.data.orderId,stopTime=this.data.stopTime
    if(stopTime){
      wx.showModal({
        title: '',
        content: "支付超时，订单关闭",
        showCancel:false,
        confirmText: "知道了",
        success(res) {
          wx.navigateBack({
            delta: 1
          })
        }
      })
      return
    }
    let data = {
      orderId: parseInt(orderId)
    }
    api.getOrderInfo(data, { 'content-type': 'application/x-www-form-urlencoded' }).then(res => {
      console.log(res);
      if (res) {
        let week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        let date = util.formatDate(res.filmStartTime),currTime = util.formatDate(res.currTime) || new Date().getTime()
        let dateTxt = ''
        let d1 = new Date(currTime).getTime()
        let d2 = new Date(date).getTime()
        let day = parseInt((d2 - d1) / 1000 / 3600 / 24)

        let orderTime = util.formatDate(res.orderTime)

        let remainTime = Math.round(300 - (new Date(currTime).getTime() - new Date(orderTime).getTime())/1000); 
        
        console.log(remainTime);
        if(remainTime<=0){
          console.log('---停止倒计时---');
          wx.showModal({
            title: '',
            content: "支付超时，订单关闭",
            showCancel:false,
            confirmText: "知道了",
            success(res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          clearTimeout(timer)
          timer=null
          this.setData({
            stopTime:true
          })
        }else{
          this.timing(remainTime)
        }
        
        if (day == 1) {
          dateTxt = "明天"
        }else if (day == 0) {
          dateTxt = "今天"
        } else if (day == 2) {
          dateTxt = "后天"
        } else {
          dateTxt = week[new Date(date).getDay()]
        }
        this.setData({
          filmInfo: res,
          dateTxt
        })
      }

    })
  },
  onLoad: function (options) {
    let orderId = options.orderId
    this.setData({
      orderId:orderId
    })
  },
  onHide:function(){
    clearTimeout(timer)
    timer = null
  },
  onUnload(){
    clearTimeout(timer)
    timer = null
  }

})