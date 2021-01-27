//index.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app = getApp()

let timer=null

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,
    currentSwiper: 0,

    share: {
      tit: "原麦山丘",
      path: "/pages/cakeInfo/cakeInfo",
      imageUrl: ''
    },
    pop: 0,
    skuNum:1
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
  close() {
    this.setData({
      pop: 0
    })
  },
  onShareAppMessage: function (res) {
    let {proInfo} = this.data
    return {
      title: `好友邀你购买${proInfo.name}`,
      path:'/pages/proInfo/proInfo?id=2&proId=' + proInfo.proId,
      imageUrl: proInfo.price
    }
  },
  confirmCake:util.debounce(function(e){
    let proId = e.currentTarget.dataset.sku
    let {city_id,skuNum,action}=this.data

    // if(skuNum==0){
    //   this.setData({
    //     pop:0
    //   })
    //   return
    // }

    let data = {
      city_id: city_id,
      type:'2',
      tab_id:proId,
      number:skuNum
    }

    console.log(data);
    api.setChart(data).then(res => {
      console.log(res);
      if(res.status=="2001"){
        wx.showToast({
          icon:"none",
          title:'商品不存在或已下架'
        })
      }else{
        wx.showToast({
          icon:"none",
          title:'加入购物车成功'
        })
        if(action==1){
          wx.switchTab({
            url:"/pages/chart/chart"
          })
        }
        this.setData({
          pop:0
        })
        
      }
      
    })
  },300,true),
  selectSku(e){
    let skuid = e.currentTarget.dataset.skuid
    let sku_list = this.data.proInfo.sku_list
    let selectSku = Object.assign({},sku_list[skuid])
    this.setData({
      'selectSku.sku_id':skuid,
      selectSku:selectSku
    })
  },
  onPullDownRefresh() { //下拉刷新
    this.getProInfo()
  },
  getProInfo(){
    let data = {
      spu_id:this.data.proId
    }
    api.getCakeProInfo(data).then(res=>{
      wx.stopPullDownRefresh()
      console.log(res)
      let selectSku = Object.assign({},res.sku_list[res.sku_id])
      if(res){
        this.setData({
          proInfo:res,
          selectSku:selectSku
        })
      }
    })
  },
  onLoad: function (options) {
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = JSON.parse(addressInfo).city_id
    let proId = options.proId
    console.log(proId)
    let btmHolder = wx.getStorageSync('btmHolder')

    this.setData({
      btmHolder:btmHolder||0,
      city_id:city_id,
      proId: proId,
    })
    this.getProInfo()
    
    //this.initData()
  }

})