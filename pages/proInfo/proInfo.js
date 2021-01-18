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

    noMoreData:false,
    movies: [],

    popup: false,
    pageNum: 1,
    nearpro:null,
    share: {
      tit: "原麦山丘",
      path: "/pages/proInfo/proInfo",
      imageUrl: ''
    }
  },
  
  toSelectSeat(e){
    let showId = e.currentTarget.dataset.showid
    wx.navigateTo({
      url: '/pages/selectSeat/selectSeat?showId=' + showId
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
    console.log(proId)
    
    this.setData({
      proId: proId
    })
    this.getProInfo()

    //this.initData()
  }

})