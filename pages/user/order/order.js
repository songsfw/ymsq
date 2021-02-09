const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    orderList:null,
    page:1,
    limit:20,
    noMoreData:false,
    pop:0,
    
    curRes:0,
    reasonTxt:"",
    reason:[
      "我不想买了",
      "信息填写错误",
      "其他原因"
    ]
  },
  close(){
    this.setData({
      pop: 0
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type
    let btmHolder = wx.getStorageSync('btmHolder')

    this.setData({
      btmHolder:btmHolder||0,
      currentTab:type || 0
    })
   
  },
  toOrder(e){
    let code = e.currentTarget.dataset.code
    wx.navigateTo({
      url:"/pages/user/orderInfo/orderInfo?code="+code
    })
  },
  switchTab: function (e) {
    var that = this;
    var currentId = e.currentTarget.dataset.tabid
    if (this.data.currentTab == currentId) {
      return false;
    } else {
      that.setData({
        noMoreData: false,
        orderList: null,
        currentTab: currentId,
        page: 1,
      })
      this.getOrder()
    }
  },
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
  bindcancel(e){
    let code = e.currentTarget.dataset.code
    this.setData({
      curOrderCode:code,
      pop:"cancel"
    })
  },
  bindSelect(e){
    let idx = e.currentTarget.dataset.idx
    this.setData({
      curRes:idx
    })
  },
  inputReason:util.debounce(function(e){
    let val = e.detail.value
    console.log(val);
    if(val){
      this.setData({
        reasonTxt:val,
      })
    }
  },500),
  cancelOrder(){
    let code = this.data.curOrderCode
    let {reason,curRes,reasonTxt} = this.data
    let data = {
      order_code:code,
      reason: reasonTxt=='' ? reason[curRes] : reasonTxt 
    }
    if(curRes==2 && reasonTxt == ''){
      wx.showToast({
        icon:"none",
        title:"请填写理由"
      })
      return
    }
    console.log(reason);
    api.cancleOrder(data).then(res=>{
      console.log(res);
      if(res){
        wx.showToast({
          icon:"none",
          title:"订单取消成功"
        })
        this.setData({
          noMoreData:false,
          page:1,
          orderList:[],
          pop:0
        })
        this.getOrder()
      }else{
        this.setData({
          pop:0
        })
      }
    })
  },
  payOrder(e){
    let code = e.currentTarget.dataset.code
    let data = {
      order_code:code
    }
    api.payOrder(data).then(res=>{

      console.log(res);
      if(res){
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
                    url: '/pages/chart/paySuccess/paySuccess?orderCode=' + code,
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
      }
    })
  },
  getOrder(){
    let {page,currentTab}=this.data
    let data = {
      page:page,
      type:currentTab,
      limit:20
    }
    api.orderList(data).then(res=>{
      console.log(res);
      if(!res.order){
        this.setData({
          noMoreData: true
        })
        return false
      }
      let list = res.order,count=parseInt(res.total_num)
      let noMoreData = count-page*20 <= 0
      this.setData({
        noMoreData: noMoreData,
        count:count,
        ['orderList['+(data.page-1)+']']:list,
      })
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  getMoreData() {
    let page = this.data.page + 1
    this.setData({
      page: page
    })
    this.getOrder()
  },
  onPullDownRefresh() {   //下拉刷新

    this.getOrder()
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
    
    let pop = e.currentTarget.dataset.pop,
    order_code = e.currentTarget.dataset.code

    let data = {
      order_code:order_code
    }

    api.preShareOrder(data).then(res=>{
      console.log(res);
      if(!res){
        return
      }
      let action = res.action
      this.setData({
        curOrderCode:order_code,
        shareInfo:res
      })
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
    })
    
    
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
    let order_code = this.data.curOrderCode
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrder()
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom(){
    if(this.data.noMoreData){
      return false
    }
    this.getMoreData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})