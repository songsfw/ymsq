//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer=null,proNum=0,breadList=null,cakeList=null
Page({
  data: {
    curProId:-1,
    currentTab:'1',
    breadList:null,
    cakeList:null,

    proNum:0,
    pageNum:1,
    noMoreData:false,

    breadInfo:{count:0,pageNum:1,noMoreData:false},
    cakeInfo:{count:0,pageNum:1,noMoreData:false},

    breadTag:'',
    cakeTag:'',

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
      if(!breadList){
        this.getProList(currentId)
      }
      if(!cakeList){
        this.getProList(currentId)
      }
      that.setData({
        currentTab: currentId
      })
    }
  },
  selectTag(e){
    var tagId = e.currentTarget.dataset.id
    let currentTab = this.data.currentTab
    let currentTag = tagId=='全部'?'':tagId
    
    if(currentTab==1){
      console.log(currentTag);
      this.setData({
        breadTag:currentTag,
        breadList:[]
      })
    }else{
      this.setData({
        cakeTag:currentTag,
        cakeList:[]
      })
    }

    this.getProList(currentTab)
    
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
    let {city_id,breadTag,cakeTag}=this.data
    let count,noMoreData,currentTag
    if(currentTab=='1'){
      currentTag = breadTag
    }else{
      currentTag = cakeTag
    }
    
    let data = {
      city_id: city_id,
      type:currentTab,
      tag:currentTag
    }

    api.getProList(data).then(res => {
      console.log(res);
      if(!res){
        return false
      }

      if(currentTab=='1'){
        breadList = res.list
        let stock=res.stock
        count = breadList.length
        noMoreData = count-1*10 <= 0
        this.setData({
          breadTags:res.tags,
          stock:stock,
          breadInfo:{count:count,pageNum:1,noMoreData:noMoreData},
          'breadList[0]':this.getCurrList(breadList,1),
        })
      }
      if(currentTab=='2'){
        cakeList = res.list
        count = cakeList.length
        noMoreData = count-1*10 <= 0
        this.setData({
          cakeTags:res.tags,
          cakeInfo:{count:count,pageNum:1,noMoreData:noMoreData},
          'cakeList[0]':this.getCurrList(cakeList,1),
        })
      }
      
      // let currList = proList.slice(pageNum*10-10,pageNum*10)
      this.setData({
        menu:res.type,
        city_id:res.city_id
      })
      wx.stopPullDownRefresh() //停止下拉刷新
    })

  },
  getCurrList(list,pageNum){
    return list.slice(pageNum*10-10,pageNum*10)
  },
  freshData: function () {
    let currentTab = this.data.currentTab
    this.getProList(currentTab)
  },
  addChart:function(e){
    let proId = e.currentTarget.dataset.id,
        img = e.currentTarget.dataset.img,
        idx = e.currentTarget.dataset.idx
    let pageNum = parseInt(this.data.breadInfo.pageNum)
    let index = pageNum-1
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
          curPro:img
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
        if(res){
          wx.setStorageSync("total_num",totalNum)
          this.setData({
            totalNum:totalNum
          })
          if(totalNum>0){
            wx.setTabBarBadge({ 
              index: 2,
              text: totalNum.toString()
            })
          }else{
            wx.removeTabBarBadge({
              index: 2
            })
          }
        }else{
          this.setData({
            ['breadList['+index+']['+idx+'].soldStat']:1
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
        if (index >= 28) {
            clearInterval(that.timer2);
            that.setData({
                hide_good_box: true
            })
        }
    }, 20);
},
  getMoreData() {
    let pageNum,noMoreData
    let {currentTab,breadInfo,cakeInfo} = this.data
    switch (currentTab) {
      case '1':
        if(breadInfo.noMoreData){
          return false
        }
        pageNum = breadInfo.pageNum + 1
        noMoreData = breadInfo.count-pageNum*10 <= 0
        this.setData({
          ['breadInfo.pageNum']: pageNum,
          ['breadInfo.noMoreData']:noMoreData,
          ['breadList['+(pageNum-1)+']']:this.getCurrList(breadList,pageNum),
        })

        break;
      case '2':
        if(cakeInfo.noMoreData){
          return false
        }
        pageNum = cakeInfo.pageNum + 1
        noMoreData = cakeInfo.count-pageNum*10 <= 0
        this.setData({
          ['cakeInfo.pageNum']: pageNum,
          ['cakeInfo.noMoreData']:noMoreData,
          ['cakeList['+(pageNum-1)+']']:this.getCurrList(cakeList,pageNum),
        })

        break;
      default:
        break;
    }
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
    this.getMoreData()
  },
  getCartInfo(){
    let total_num = wx.getStorageSync("total_num")
    this.setData({
      totalNum:total_num || 0
    })
    if(total_num>0){
      wx.setTabBarBadge({ 
        index: 2,
        text: total_num.toString()
      })
    }else{
      wx.removeTabBarBadge({
        index: 2
      })
    }
  },
  onShow() {
    //自定义tabbar选中
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo&&JSON.parse(addressInfo).city_id
    let proType = app.globalData.proType || '1'
    // if (typeof this.getTabBar === 'function' &&
    //   this.getTabBar()) {
    //   this.getTabBar().setData({
    //     count:"",
    //     selected: 1
    //   })
    // }
    this.setData({
      currentTab:proType,
      city_id:city_id || '10216'
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
    let proType = app.globalData.proType || '1'
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
    //util.setWatcher(this);
  },
  watch:{
    // 'currentTab':function (value, oldValue){
    //   console.log("watch");
    //   console.log(value);
    //   if(value==oldValue){
    //     return
    //   }
    //   this.setData({
    //     currentTag:'',
    //     noMoreData: false,
    //     proList: null,
    //     pageNum: 1,
    //   })
    //   this.getProList(value);
    // }
  }

})