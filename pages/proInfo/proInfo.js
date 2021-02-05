//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

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
      path: "/pages/proInfo/proInfo",
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
  confirmBread:util.debounce(function(e){
    let proId = e.currentTarget.dataset.id
    let {city_id,skuNum,action,totalNum}=this.data

    let data = {
      city_id: city_id,
      type:'1',
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
        this.setData({
          totalNum:totalNum,
          pop:0
        })
        if(action==1){
          wx.switchTab({
            url:"/pages/chart/chart"
          })
        }
      }
      
    })
  },300,true),
  onShareAppMessage: function (res) {
    let {proInfo} = this.data
    return {
      title: `好友邀你购买${proInfo.name}`,
      path:'/pages/proInfo/proInfo?id=2&proId=' + proInfo.proId,
      imageUrl: proInfo.price
    }
  },
  addCart(toCart){
    let proId = this.data.proId
    let city_id = "10216"
    
    if (timer){
      clearTimeout(timer);
    }

    timer = setTimeout(()=>{
      
      let data = {
        city_id: city_id,
        type:"1",
        tab_id:proId,
        number:1,
        is_list:1
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
            icon:"success",
            title:'加入购物车成功'
          })
          if(toCart==1){
            wx.switchTab({
              url:"/pages/chart/chart"
            })
          }
        }
        
      })
      
    },300)
  },
  buyToCart(){
    this.addCart(1)
  },
  onPullDownRefresh() { //下拉刷新
    this.getProInfo()
  },
  getProInfo(){
    let data = {
      meal_id:this.data.proId
    }
    api.getProInfo(data).then(res=>{
      wx.stopPullDownRefresh()
      console.log(res)
      if(res){
        this.setData({
          proInfo:res
        })
      }
    })
  },
  onLoad: function (options) {
    let proId = options.proId
    let addressInfo = wx.getStorageSync("addressInfo")
    let totalNum = wx.getStorageSync("total_num")
    let city_id = JSON.parse(addressInfo).city_id
    this.setData({
      totalNum:totalNum,
      city_id:city_id,
      proId: proId
    })
    this.getProInfo()
    let btmHolder = wx.getStorageSync('btmHolder')

      this.setData({
        btmHolder:btmHolder||0,
      })
    
    //this.initData()
  }

})