//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer=null,proNum=0
Page({
  data: {
    curProId:-1,
    currentTab:1,
    breadLi:null,
    cakeLi:null,
    breakLi:null,
    proNum:0,
    pageNum:1,
    noMoreData:false,

    share: {
      tit: "原麦山丘",
      path: "/pages/index/index",
      imageUrl: ''
    }
  },
  switchTab: function (e) {
    var that = this;
    var currentId = e.currentTarget.dataset.tabid
    app.globalData.proType = currentId
    if (this.data.currentTab === currentId) {
      return false;
    } else {
      that.setData({
        currentTag:'',
        noMoreData: false,
        proList: null,
        currentTab: currentId,
        pageNum: 1,
      })
      this.getProList()

    }
  },
  selectTag(e){
    var tagId = e.currentTarget.dataset.id
    if (this.data.currentTag == tagId) {
      return false;
    } else {
      this.setData({
        noMoreData: false,
        proList: null,
        currentTag: tagId,
        pageNum: 1,
      })
      this.getProList()
    }
  },
  getProList: function () {
    let {pageNum,currentTab,currentTag,city_id}=this.data

    let data = {
      city_id: city_id,
      // index: pageNum,
      // size: 10,
      type:currentTab,
      tag:currentTag || ''
    }

    api.getProList(data).then(res => {
      console.log(res);
      if(!res){
        this.setData({
          noMoreData: true,
          count:0,
          proList:[]
        })
        return false
      }
      let currentTab = res.choose_type,currTag = res.choose_tag
      let proList = res.list,count=proList.length,stock=res.stock
      let noMoreData = count-pageNum*10 == 0
      let currList = proList.slice(pageNum*10-10,pageNum*10)
      this.setData({
        currentTab:currentTab,
        menu:res.type,
        tags:res.tags,
        noMoreData: noMoreData,
        count:count,
        stock:stock,
        city_id:res.city_id,
        ['proList['+(pageNum-1)+']']:currList
      })
      wx.stopPullDownRefresh() //停止下拉刷新
    })

  },

  freshData: function () {

    this.setData({
      noMoreData: false,
      pageNum: 1,
      proList: null,
      count:null
    })
    this.getProList()
       
  },
  addChart(e){
    let proId = e.currentTarget.dataset.id
    let {currentTab,curProId,stock,city_id}=this.data
    if(proId!=curProId){
      proNum=0
      this.setData({
        curProId:proId
      })
    }
    if(currentTab=="1"){
      if(proNum<stock[proId]){
        proNum++
      }else{
        wx.showToast({
          icon:"none",
          title:`库存不足`
        })
        return
      }
    }else{
      proNum++
    }

    if (timer){
      clearTimeout(timer);
    }

    timer = setTimeout(()=>{
      
      console.log(this.data.curProId);
      let data = {
        city_id: city_id,
        type:currentTab,
        tab_id:proId,
        number:proNum
      }
      proNum=0
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
          //this.getProList()
        }
        
      })
      
    },300)

    
  },
  getMoreData() {
    let currentTab = this.data.currentTab
    let pageNum = this.data.pageNum + 1
    this.setData({
      pageNum: pageNum
    })


    this.getBread()

  },
  toProInfo: function (e) {

    let proId = e.currentTarget.dataset.proid
    wx.navigateTo({
      url: '/pages/proInfo/proInfo?proId=' + proId
    })
  },
  toSelectCity() {
    wx.navigateTo({
      url: '/pages/citySelect/citySelect'
    })
  },
  onPullDownRefresh() {   //下拉刷新

    this.freshData()
  },
  onShow() {
    let proType = app.globalData.proType
    // api.getChartData().then(res => {
    //   console.log(res);
    //   this.setData({
    //     count:res.total_num
    //   })
    // })
    //自定义tabbar选中
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = JSON.parse(addressInfo).city_id

    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    this.setData({
      city_id:city_id,
      currentTab:proType!=1 && proType!=2 ? 1 : proType,
      currentTag:'',
      noMoreData: false,
      proList: null,
      pageNum: 1,
    })
    
    this.getProList();
  },
  onLoad: function () {
    let sysInfo = app.globalSystemInfo;
    let safeArea = sysInfo.safeArea;
    if(sysInfo.screenHeight > safeArea.bottom){
      let btmHolder = sysInfo.screenHeight - safeArea.bottom
      this.setData({
        btmHolder:btmHolder
      })
    }
    //util.setWatcher(this);
  },
  watch:{
    'selectCityId':function (value, oldValue){
      if(value==oldValue){
        return
      }
      console.log(value, oldValue);
      this.setData({
        areaId:'',
        selectIndex: 0,
        pageNum: 1,
        nearCinema:null,
        noMoreData: false
      })
      console.log("watch");
      //this.getCinema({ cityId: value, areaId: '' })
    }
  }

})