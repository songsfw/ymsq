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
    skuNum:1,

    //本页全局计数
    totalNum:0,
    proNum:0,
    //
    // backListType: null,
    // backListIdx: null,
    // backListItemidx: null,
    // backListCurrentTab:null,
    ctabTypeMealIdSpuId:null,
    backNum:1,

    //从购物车返回相关
    toCartParams:"",//去往购物车的数据
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
      path:'/pages/cakeInfo/cakeInfo?id=2&proId=' + proInfo.sku_id,
      imageUrl: proInfo.image
    }
  },
  toCart(){
    this.data.backNum = 0;
    app.globalData.proType = "2"
  },
  confirmCake:util.debounce(function(e){
    let proId = e.currentTarget.dataset.sku
    let {city_id,skuNum,action,totalNum}=this.data

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
  cartPageSyncData(){
    let pages = getCurrentPages(); // 子页面
    console.log("-----------------2222")
    console.log(pages);
  },
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
  onShow(){
    if (app.globalData.isLogin!=1){
      return
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    let options = currPage.options

    let addressInfo = wx.getStorageSync("addressInfo")
    let totalNum = wx.getStorageSync("total_num")
    let city_id = JSON.parse(addressInfo).city_id
    let proId = options.proId
    console.log('---------',proId)
    let btmHolder = wx.getStorageSync('btmHolder')
    let sData = {
      totalNum:totalNum,
      btmHolder:btmHolder||0,
      city_id:city_id,
      proId: proId,
    }

    if (options.ctabTypeMealIdSpuId) {
      this.data.ctabTypeMealIdSpuId = options.ctabTypeMealIdSpuId;
    }

    this.setData(sData)
    this.getProInfo()
  },
  onLoad: function (options) {
    // let addressInfo = wx.getStorageSync("addressInfo")
    // let totalNum = wx.getStorageSync("total_num")
    // let city_id = JSON.parse(addressInfo).city_id
    // let proId = options.proId
    // console.log('---------',proId)
    // let btmHolder = wx.getStorageSync('btmHolder')
    // let sData = {
    //   totalNum:totalNum,
    //   btmHolder:btmHolder||0,
    //   city_id:city_id,
    //   proId: proId,
    // }

    // if (options.ctabTypeMealIdSpuId) {
    //   this.data.ctabTypeMealIdSpuId = options.ctabTypeMealIdSpuId;
    // }

    // this.setData(sData)
    // this.getProInfo()
    
    //this.initData()
  },
  onUnload: function (e) {
    let pages = getCurrentPages(); // 子页面
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      if(prePage.route=="pages/proList/proList" && this.data.backNum){
        prePage.setDetailBack && prePage.setDetailBack(this.data.backNum);
      }  
    }
    this.data.ctabTypeMealIdSpuId = null;
  }

})