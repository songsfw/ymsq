//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
const app = getApp()

let timer = null

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,
    currentSwiper: 0,

    pop: 0,
    skuNum: 1,

    //
    ctabTypeMealIdSpuId:null,
    // backListType: null,
    // backListIdx: null,
    // backListItemidx: null,
    // backListCurrentTab:null,
    backNum:1,//1是详情页返回
  },
  preview(e) {
    console.log(e.currentTarget.dataset.src)
    let currentUrl = e.currentTarget.dataset.src
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: this.data.proInfo.banner // 需要预览的图片http链接列表
    })
  },
  //改变商品数量
  minusFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    if (skuNum == 1) {
      this.setData({
        skuNum: 1
      })
      return
    }
    skuNum--
    this.setData({
      skuNum: skuNum
    })
  }),
  addFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    skuNum++
    this.setData({
      skuNum: skuNum
    })
  }),
  showTip(e) {

    this.setData({
      pop: 'tip-panel'
    })
  },
  showPop(e) {
    let pop = e.currentTarget.dataset.pop,
      action = e.currentTarget.dataset.action
    this.setData({
      action: action,
      skuNum: 1,
      pop: pop
    })
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  toCart() {
    this.data.backNum = 0;
    app.globalData.proType = "1";
  },
  confirmBread: util.debounce(function (e) {
    wx.showLoading({mask:true})
    let proId = e.currentTarget.dataset.id
    if(!proId){
      wx.showToast({
        icon:"none",
        title:"商品暂时不可购买"
      })
      return 
    }
    let {
      city_id,
      skuNum,
      action,
      totalNum
    } = this.data

    let data = {
      city_id: city_id,
      type: '1',
      tab_id: proId,
      number: skuNum
    }
    totalNum = totalNum + skuNum
    api.setChart(data).then(res => {
      wx.hideLoading()
      console.log(res);
      if (res) {
        wx.setStorageSync('total_num', totalNum)
        wx.showToast({
          icon: "none",
          title: '加入购物车成功'
        })
        this.setData({
          totalNum: totalNum,
          pop: 0
        })
        wx.reportAnalytics('addcart', {
          type: '面包',
          tab_id: proId,
          city_id: city_id,
          source:'详情页'
        });
        //压入数据
        //改变的 页面实例 对应的参数
        if(this.data.ctabTypeMealIdSpuId){
          app.refreshList(this.data.ctabTypeMealIdSpuId,skuNum);
        }
        if (action == 1) {
          this.data.backNum = 0;
          app.globalData.proType = "1"
          wx.navigateTo({
            url: "/pages/cart/cart/cart"
          })
        }
      }

    })
  }, 300, true),
  onShareAppMessage: function (res) {
    let {
      proInfo
    } = this.data
    console.log(proInfo);
    return {
      title: `好友与你分享${proInfo.name}`,
      path: '/pages/proInfo/proInfo?id=2&proId=' + proInfo.id,
      imageUrl: proInfo.img
    }
  },
  addCart(toCart) {
    wx.showLoading({mask:true})
    let proId = this.data.proId
    let city_id = "10216"

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {

      let data = {
        city_id: city_id,
        type: "1",
        tab_id: proId,
        number: 1,
        is_list: 1
      }
      console.log(data);
      api.setChart(data).then(res => {
        wx.hideLoading()
        console.log(res);
        if (res.status == "2001") {
          wx.showToast({
            icon: "none",
            title: '商品不存在或已下架'
          })
        } else {
          wx.showToast({
            icon: "success",
            title: '加入购物车成功'
          })
          wx.reportAnalytics('addcart', {
            type: '1',
            tab_id: proId,
            city_id: city_id,
            source:'detail'
          });
          if (toCart == 1) {
            wx.navigateTo({
              url: "/pages/cart/cart/cart"
            })
          }
        }

      })

    }, 300)
  },
  buyToCart() {
    this.addCart(1)
  },
  onPullDownRefresh() { //下拉刷新
    this.getProInfo()
  },
  getProInfo() {
    let data = {
      meal_id: this.data.proId
    }
    wx.showLoading({mask:true})
    api.getProInfo(data).then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log(res)
      if (res) {
        this.setData({
          is_show: true,
          proInfo: res
        })
      }else{
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  toIndexPage(){
    let pages = getCurrentPages(); // 子页面
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      if(prePage.route=="pages/proList/proList"){
        this.data.backNum = 0;
        prePage.setDetailBack && prePage.setDetailBack(this.data.backNum);
        this.data.backListType = null;
        this.data.backListIdx = null;
        this.data.backListItemidx = null;
        this.data.backListCurrentTab = null;
      }  
    }
  },
  async onShow(){
    let userInfo = wx.getStorageSync('userInfo')
    let addressInfo = wx.getStorageSync("addressInfo")
    let loginInfo = null
    if(!userInfo || !addressInfo){
      wx.showLoading({mask:true,title:"登录中..."})
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
      wx.hideLoading()
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    let options = currPage.options
    
    let totalNum = wx.getStorageSync("total_num")
    let proId = options.proId
    addressInfo = wx.getStorageSync("addressInfo")
    addressInfo = JSON.parse(addressInfo)
    let city_id = addressInfo.city_id

    if (options.ctabTypeMealIdSpuId) {
      this.data.ctabTypeMealIdSpuId = options.ctabTypeMealIdSpuId
    }
    this.setData({
      is_show: false,
      city_id: city_id,
      proId: proId,
      toCartParams:'?'+"ctabTypeMealIdSpuId="+this.data.ctabTypeMealIdSpuId,
      totalNum: totalNum,
    })
    this.getProInfo()

  },
  onLoad: function (options) {
    
    let btmHolder = wx.getStorageSync('btmHolder')
    let instructions = wx.getStorageSync('instructions')
    // let isWxPromote = null
    // if(options.promote){
    //   isWxPromote=options.promote
    // }
    this.setData({
      btmHolder: btmHolder || 0
    })
    if(instructions){
      instructions = JSON.parse(instructions)
      console.log(instructions);
      let special_tips =instructions['special_tips']
      this.setData({
        special_tips
      })
    }else{
      api.getIntroduction().then(res=>{
        console.log(res);
        if(res){
          instructions = res.instructions
          let special_tips =instructions['special_tips']
          this.setData({
            special_tips
          })
          wx.setStorageSync("instructions", JSON.stringify(res.instructions))
          
        }
      })
    }
    
    //this.initData()
  },
  onReady: function () {
    // this.getProInfo()
  },
  onUnload: function (e) {
    console.log('unload');
    let pages = getCurrentPages(); // 子页面
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      if(prePage.route=="pages/proList/proList" && this.data.backNum){
        prePage.setDetailBack && prePage.setDetailBack(this.data.backNum);
      }

      console.log(prePage)
      if(prePage.route=="pages/search/search" && this.data.backNum){
        prePage.setDetailBack && prePage.setDetailBack(this.data.backNum);
      }
    }
    this.data.ctabTypeMealIdSpuId = null;
  }
})