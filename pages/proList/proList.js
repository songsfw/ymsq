//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer=null,proNum=0,windowH,windowW,top,left
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
    },

    hideCount: true, //角标初始是隐藏的
    count: 0, //角标数
    hide_good_box: true,
    curPro: ""
  },
  switchTab: function (e) {
    var that = this;
    var currentId = e.currentTarget.dataset.tabid
    app.globalData.proType = currentId
    if (this.data.currentTab == currentId) {
      return false;
    } else {
      that.setData({
        currentTab: currentId
      })
    }
  },
  selectTag(e){
    var tagId = e.currentTarget.dataset.id
    let currentTab = this.data.currentTab
    if (this.data.currentTag == tagId) {
      return false;
    } else {
      this.setData({
        noMoreData: false,
        proList: null,
        currentTag: tagId,
        pageNum: 1,
      })
      this.getProList(currentTab)
    }
  },
  getStock(){
    let {city_id}=this.data
    let data = {
      city_id: city_id,
    }
    api.getProList(data).then(res => {
      console.log(res);
      if(!res){
        return false
      }
      let stock=res.stock
      this.setData({
        stock:stock,
      })
    })
  },
  getProList: function (currentTab) {
    let {pageNum,currentTag,city_id}=this.data
    currentTag = currentTag=='全部' ? '' : currentTag
    let data = {
      city_id: city_id,
      type:currentTab,
      tag:currentTag
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

      let proList = res.list,count=proList.length,stock=res.stock
      let noMoreData = count-pageNum*10 <= 0
      let currList = proList.slice(pageNum*10-10,pageNum*10)
      this.setData({
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
    let currentTab = this.data.currentTab
    this.setData({
      noMoreData: false,
      pageNum: 1,
      proList: null,
      count:null
    })
    this.getProList(currentTab)
  },
  addChart:function(e){
    let proId = e.currentTarget.dataset.id,
        img = e.currentTarget.dataset.img
    let {currentTab,curProId,stock,city_id,totalNum}=this.data
    totalNum = parseInt(totalNum)
    let curStock = parseInt(stock[proId])
    if(proId!=curProId){
      proNum=0
      this.setData({
        curProId:proId
      })
    }
    if(currentTab=="1"){
      if(proNum<curStock){

        if (!this.data.hide_good_box) return;
        //当前点击位置的x，y坐标
        this.finger = {};
        var topPoint = {};
        this.finger['x'] = e.touches["0"].clientX;
        this.finger['y'] = e.touches["0"].clientY-20 ;

        
        if (this.finger['y'] < this.busPos['y']) {
          topPoint['y'] = this.finger['y'] - 100;
        } else {
            topPoint['y'] = this.busPos['y'] - 100;
        }
        
        if (this.finger['x'] < this.busPos['x']) {
          topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2 + this.finger['x'];
          this.linePos = util.bezier([this.finger, topPoint, this.busPos], 30);
        } else {
          this.finger['x'] = e.touches["0"].clientX-20;
          this.finger['y'] = e.touches["0"].clientY-20
            topPoint['x'] = this.finger['x']-(this.finger['x'] - this.busPos['x']) / 2 
            this.linePos = util.bezier([this.busPos, topPoint, this.finger], 30,true);
        }

        
        this.startAnimation();

        proNum++
        totalNum++

        this.setData({
          finger:this.finger,
          topPoint:topPoint,
          busPos:this.busPos,
          curPro:img,
          totalNum
        })

        wx.setStorageSync("total_num",totalNum)
        wx.setTabBarBadge({ 
          index: 2,
          text: totalNum.toString()
        })
      }else{
        wx.showToast({
          icon:"none",
          title:`库存暂时不足`
        })
        proNum = curStock
      }
    }

    if (timer){
      clearTimeout(timer);
    }

    timer = setTimeout(()=>{
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
        if(!res){
          wx.showToast({
            icon:"none",
            title:'加入购物车失败'
          })
        }
        
      })
    },300)
  },
  //开始动画
  startAnimation: function() {
    var index = 0,
        that = this,
        bezier_points = that.linePos['bezier_points'];
    this.setData({
        hide_good_box: false,
        bus_x: that.finger['x'],
        bus_y: that.finger['y']
    })
    this.timer2 = setInterval(function() {
        index++;
        that.setData({
            bus_x: bezier_points[index]['x'],
            bus_y: bezier_points[index]['y']
        })
        if (index >= 29) {
            clearInterval(that.timer2);
            that.setData({
                hide_good_box: true
            })
        }
    }, 30);
},
  getMoreData() {
    let pageNum = this.data.pageNum + 1
    let currentTab = this.data.currentTab
    this.setData({
      pageNum: pageNum
    })
    this.getProList(currentTab)
  },
  toProInfo: function (e) {
    let proId = e.currentTarget.dataset.proid
    wx.navigateTo({
      url: '/pages/proInfo/proInfo?proId=' + proId
    })
  },
  onPullDownRefresh() {   //下拉刷新
    this.freshData()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.noMoreData){
      return false
    }
    this.getMoreData()
  },
  getCartInfo(){
    let total_num = wx.getStorageSync("total_num")
    this.setData({
      totalNum:total_num || 0
    })
    wx.setTabBarBadge({ 
      index: 2,
      text: total_num.toString() || '0'
    })
  },
  onShow() {
    //自定义tabbar选中
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo&&JSON.parse(addressInfo).city_id
    let proType = app.globalData.proType || 1
    // if (typeof this.getTabBar === 'function' &&
    //   this.getTabBar()) {
    //   this.getTabBar().setData({
    //     count:"",
    //     selected: 1
    //   })
    // }
    this.setData({
      currentTab:proType,
      city_id:city_id
    })
    this.getStock()
    this.getCartInfo()
  },
  
  onLoad: function () {
    let sysInfo = null
    if(app.globalSystemInfo){
      sysInfo = app.globalSystemInfo
    }else{
      sysInfo = wx.getSystemInfoSync()
    }
    //可视窗口x,y坐标
    console.log(sysInfo.screenHeight)
    this.busPos = {};
    this.busPos['x'] = sysInfo.screenWidth * .6;
    this.busPos['y'] = sysInfo.screenHeight * .85;
    let proType = app.globalData.proType || 1
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo&&JSON.parse(addressInfo).city_id
    
    let btmHolder = wx.getStorageSync('btmHolder')

    this.setData({
      city_id:city_id,
      currentTab: proType,
      currentTag:'',
      noMoreData: false,
      proList: null,
      pageNum: 1,
      btmHolder:btmHolder||0
    })
    this.getProList(proType);

    

    // let safeArea = sysInfo.safeArea;
    // if(sysInfo.screenHeight > safeArea.bottom){
    //   let btmHolder = sysInfo.screenHeight - safeArea.bottom
    //   btmHolder = parseInt(btmHolder)
    //   this.setData({
    //     btmHolder:btmHolder
    //   })
    // }
    util.setWatcher(this);
  },
  watch:{
    'currentTab':function (value, oldValue){
      console.log("watch");
      console.log(value);
      if(value==oldValue){
        return
      }
      this.setData({
        currentTag:'',
        noMoreData: false,
        proList: null,
        pageNum: 1,
      })
      this.getProList(value);
    }
  }

})