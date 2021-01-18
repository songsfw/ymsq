//index.js
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
      path: "/pages/cakeInfo/cakeInfo",
      imageUrl: ''
    }
  },
  
  onShareAppMessage: function (res) {
    let {proInfo} = this.data
    return {
      title: `好友邀你购买${proInfo.name}`,
      path:'/pages/proInfo/proInfo?id=2&proId=' + proInfo.proId,
      imageUrl: proInfo.price
    }
  },
  addCart(e){
    console.log(e)
    let proId = e.currentTarget.dataset.sku,
        buy = e.currentTarget.dataset.buy
    let city_id = this.data.city_id
    
    if (timer){
      clearTimeout(timer);
    }

    timer = setTimeout(()=>{
      
      let data = {
        city_id: city_id,
        type:"2",
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
          if(buy==1){
            wx.switchTab({
              url:"/pages/chart/chart"
            })
          }
        }
        
      })
      
    },300)
  },
  buyToCart(e){
    this.addCart(e)
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
      if(res){
        this.setData({
          proInfo:res
        })
      }
    })
  },
  onLoad: function (options) {
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = JSON.parse(addressInfo).city_id
    let proId = options.proId
    console.log(proId)
    
    this.setData({
      city_id:city_id,
      proId: proId
    })
    this.getProInfo()

    //this.initData()
  }

})