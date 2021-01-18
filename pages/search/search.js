//index.js
const util = require('../../utils/util.js')
const ajax = require('../../utils/request.js')
const auth = require('../../utils/auth.js')

const app = getApp()

Page({
  data: {
    isShowAuth:false,
    popup: false,
    pageNum: 1,

    currentCity:"",
    curBsid:"",
    
    filter:0,
     history:[],
    maskShow:false,

    share:{
      tit:"分享文字",
      path:"/pages/index/index",
      imageUrl:"/image/share.png"
    },

    initvalue:''
  },
  onPageScroll: function (e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  cancle:function(){
    this.setData({
      initvalue:''
    })
  },
  search:function(e){
    let that = this
    let val = e.detail.value
    console.log(e)
    if(val == ''){
      wx.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }else{
      this.setData({
        schvalue:val
      })
    }
  },
  delHistory(){
    wx.setStorageSync("schvalue",'')
    wx.setStorageSync("schvalueArr", null)
    this.setData({
      schvalue:'',
      schvalueArr: null
    })
  },
  
  toListPage(e){

    let schvalue = this.data.schvalue || e.currentTarget.dataset.val

    if(!schvalue){
      wx.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    let schvalueArr = wx.getStorageSync("schvalueArr") || []
    if(schvalueArr.indexOf(schvalue) == -1){
      if (schvalueArr.length<5){
        schvalueArr.unshift(schvalue)
      }else{
        schvalueArr.unshift(schvalue)
        schvalueArr.pop()
      }
      wx.setStorageSync("schvalueArr", schvalueArr)
    }

    wx.redirectTo({
      url: '/pages/gym/gymList/gymList?value=' + schvalue,
    })
  },

  hidePop:function(){
    this.setData({
      filter: 0
    })
  },

  noActTip:function(){
    wx.showToast({
      icon:"none",
      title: '暂无活动',
    })
  },
  timeFormat(param) {//小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  uniq:function(arr){   //简单去个重
    var temp = [];
    for (var i = 0; i < arr.length; i++) {
      if (temp.indexOf(arr[i]) == -1) {
        temp.push(arr[i]);
      }else{
        temp.push('0')
      }
    }
    return temp;
  },
  onShow: function () {
    var sysInfo = app.globalSystemInfo
    var fixedTop = sysInfo.navBarHeight
    this.setData({
      fixedTop: fixedTop
    })
  },

  onLoad: function () {
    var that = this;
    //var schvalue = wx.getStorageSync("schvalue")
    var schvalueArr = wx.getStorageSync("schvalueArr")
    this.setData({
      schvalue:'',
      schvalueArr: schvalueArr
    })
    
  }
})
