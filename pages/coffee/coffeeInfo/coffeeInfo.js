//index.js
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const app = getApp()

let timer=null

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,
    currentSwiper: 0,

    
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
  minusFitting:util.debounce(function(){
    let skuNum = this.data.skuNum
    if(skuNum==1){
      this.setData({
        skuNum:1
      })
      return
    }
    skuNum--
    this.setData({
      skuNum:skuNum
    })
  }),
  addFitting:util.debounce(function(){
    let skuNum = this.data.skuNum
    skuNum++
    this.setData({
      skuNum:skuNum
    })
  }),
  showPop(e) {
    let pop = e.currentTarget.dataset.pop,
        action = e.currentTarget.dataset.action
    this.setData({
      action:action,
      skuNum:1,
      pop: pop
    })
  },
  handleTouchMove(e){
    e.stopPropagation()
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  onShareAppMessage: function (res) {
    let {proInfo} = this.data
    return {
      title: `好友与你分享${proInfo.name}`,
      path:'/pages/cakeInfo/cakeInfo?id=2&proId=' + proInfo.sku_id,
      imageUrl: proInfo.img
    }
  },
  toCart(){
    this.data.backNum = 0;
    app.globalData.proType = "2"
  },
  confirmCake:util.debounce(function(e){
    let proId = e.currentTarget.dataset.sku
    let {city_id,skuNum,action,totalNum}=this.data

    let data = {
      city_id: city_id,
      type:'2',
      tab_id:proId,
      number:skuNum
    }

    totalNum = totalNum+skuNum
    api.setChart(data).then(res => {
      console.log(res);
      if(res){
        wx.setStorageSync('total_num',totalNum)
        wx.showToast({
          icon:"none",
          title:'加入购物车成功'
        })
        this.data.proNum = skuNum;
        this.data.totalNum = totalNum;
        this.setData({
          totalNum:totalNum,
          pop:0
        })

        if(this.data.ctabTypeMealIdSpuId){
          app.refreshList(this.data.ctabTypeMealIdSpuId,skuNum);
        }
        
        if(action==1){
          this.data.backNum = 0;
          app.globalData.proType = "2"
          wx.navigateTo({
            url:"/pages/cart/cart/cart"
          })
        }
      }
    })

  },300,true),

  selectSku(e){
    let skuid = e.currentTarget.dataset.skuid
    let sku_list = this.data.proInfo.sku_list
    let selectSku = Object.assign({},sku_list[skuid])
    console.log(selectSku);
    this.setData({
      //'selectSku.sku_id':skuid,
      selectSku:selectSku
    })
  },
  onPullDownRefresh() { //下拉刷新
    this.getProInfo()
  },
  getProInfo(){
    let data = {
      spu_id:this.data.spuId
    }
    wx.showLoading({mask:true})
    api.coffeeInfo(data).then(res=>{
      wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log(res)
      if(res){
        this.setData({
         
          proInfo:res
        })
      }
    })
  },

  onShow(){
    
  },
  async onLoad (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    let userInfo = wx.getStorageSync('userInfo')

    let loginInfo = null
    if(!userInfo){
      wx.showLoading({mask:true,title:"登录中..."})
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
      wx.hideLoading()
    }

    let spuId = options.spuId

    
    this.setData({
      spuId,
      btmHolder:btmHolder||0
    })
    this.getProInfo()
  },
  onUnload: function (e) {
    
  }

})