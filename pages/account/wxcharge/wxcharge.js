const api = require('../../../utils/api.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chargeList:[],
    money:"123",
    read:true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  setDefault(e){
    let idx = e.currentTarget.dataset.idx
    let chargeList = this.data.chargeList
    let checkedId;
    chargeList.forEach((item,index)=>{
      if(idx == index){
        if(item.checked == true){
          item.checked = false
          checkedId = null
        }else{
          item.checked = true
          checkedId = item.recharge_id
        }
      }else{
        item.checked = false
      }
      
    })
    this.setData({
      checkedId:checkedId,
      chargeList:chargeList
    })
  },
  getRead(){
    let read=this.data.read
    if(read){
      this.setData({
        read:false
      })
    }else{
      this.setData({
        read:true
      })
    }
    
  },
  bindPhoneSucess(){
    this.charge()
  },
  charge(){
    let checkedId = this.data.checkedId,read=this.data.read
    if(!checkedId){
      wx.showToast({
        title: '请选择金额',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!read){
      wx.showToast({
        title: '请阅读并同意会员章程',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let data = {
      recharge_id:checkedId
    }
    api.wxCharge(data).then(res=>{
      console.log(res);
      if(!res){
        return false
      }
      if(res==app.globalData.bindPhoneStat){
        this.setData({
          popShow:true
        })
        return
      }
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: res.signType,
        paySign: res.paySign,
        success(payres) {
          console.log(payres);

          wx.showModal({
            title: '充值成功',
            content: '恭喜您获得一张优惠券呦,可在会员中心 > 优惠券，查看使用',
            showCancel: false,
            confirmText: '我知道了',
            success: function success(res) {
              wx.navigateBack({
                delta: 1
              })  
              if (res.confirm) {
                console.log('用户点击确定');
              }
            }
          });



          return true;
          // return false;
          // wx.showToast({
          //   title: '支付成功',
          //   icon: 'none',
          //   duration: 1000,
          //   success: function () {
          //     setTimeout(function () {
          //       wx.navigateBack({
          //         delta: 1
          //       })
          //     }, 1000)
          //   }
          // })

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
  onLoad: function (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    this.setData({
      btmHolder:btmHolder||0
    })
    
    api.chargeList().then(res=>{
      console.log(res);
      if(res){
        this.setData({
          money:res.balance,
          chargeList:res.wx_charge_rule
        })
      }
      
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