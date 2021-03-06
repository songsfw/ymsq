//index.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

const app = getApp()
var timer = null

Page({
  data: {
    banner: [],
    autoplay: true,
    interval: 3000,
    duration: 800,
    circular: true,
    currentSwiper: 0,
    showGoto:false,
    playnotice:true,
    isNotice:false,
    navHeight: 0,
    cityId: null,
    areaId: null,
    cityName: null,
    zoneIndex: 0,
    noMoreData: false,
    pageNum: 1,
    popup: false,
    mask:false,
    filter: 0
  },
  toPro(e){
    let urlType = e.currentTarget.dataset.type;
    let url = e.currentTarget.dataset.url;
    switch (urlType) {
      case "2":
        wx.navigateTo({
          url:"/pages/cakeInfo/cakeInfo?proId="+url
        })
        break;
      case "3":
        wx.navigateTo({
          url:"/pages/proInfo/proInfo?proId="+url
        })
        break;
      case "4":
        app.globalData.proType = url
        wx.switchTab({
          url:"/pages/proList/proList"
        })
        break;
      default:
        break;
    }
  },

  timing: function () {
    let that = this

    let startTime = this.data.startTime

    startTime++
    // 获取时分秒
    let h = parseInt(startTime / 3600)
    let m = parseInt((startTime - h * 3600) / 60)
    let s = startTime - h * 3600 - m * 60

    let str = util.formatNumber(h) + ':' + util.formatNumber(m) + '.' + util.formatNumber(s)
    that.setData({
      startTime: startTime,
      timingTxt: str
    })

    timer = setTimeout(() => {
      this.timing()
    }, 1000);
  },
  freshData: function () {
    
  },

  onPageScroll: util.throttle(function (e) {
    //debounce()
    // var scrollTop = e.scrollTop
    // var hdTop = this.data.hdTop
    // if (hdTop) {
    //   if (scrollTop > hdTop - 70) {
    //     this.setData({
    //       fixedHd: true
    //     })
    //   } else {
    //     this.setData({
    //       fixedHd: false
    //     })
    //   }
    // }

    // if (scrollTop > 0) {
    //   this.setData({
    //     isFold: true
    //   })
    // } else {
    //   this.setData({
    //     isFold: false
    //   })
    // }
  },100),
  onShareAppMessage: function (res) {

  },
  getIndexInfo:function(){
    let data = { 
      city_id:this.data.addressInfo.city_id
    }
    api.getIndexInfo(data).then(res => {
      console.log(res);
      if(res){
        let {notice,operate} = res
        let components = operate[0].components
        let banner = components[0].componentDetail.imageReader,
            menu = components[1].componentDetail.imageReader,
            block1 = components[2] && components[2].componentDetail,
            block2 = components[3] && components[3].componentDetail,
            block3 = components[4] && components[4].componentDetail

        wx.setStorageSync("total_num",res.cart.total_num)
        util.setTabBarBadge(res.cart.total_num)
        // if(res.cart.total_num>0){
        //   let  totalNum = res.cart.total_num.toString()|| '0'
        //   if(res.cart.total_num>=100){
        //     totalNum = '99+';
        //   }
         
        //   wx.setTabBarBadge({
        //     index: 2,
        //     text: totalNum
        //   })
        // }else{
        //   wx.removeTabBarBadge({
        //     index: 2
        //   })
        // }
        
        this.setData({
          notice:notice,
          banner,
          menu,
          block1:block1 || null,
          block2:block2 || null,
          block3:block3 || null,
          curBg:banner[0].image_url
        })
      }

      wx.stopPullDownRefresh() //停止下拉刷新
    })

  },
  scroll(e){
    if(e.detail.scrollTop>200){
      this.setData({
        showGoto:true
      })
    }else{
      this.setData({
        showGoto:false
      })
    }
  },
  gotop(){
    this.setData({
      pos:0
    })
  },
  showNotice(){
    this.setData({
      panel:'notice',
      mask:true
    })
  },
  closePanel(){
    this.setData({
      panel:false,
      mask:false
    })
  },
  changeBg(e){
    let curidx = e.detail.current
    this.setData({
      curBg:this.data.banner[curidx].image_url
    })
  },
  // onPullDownRefresh() { //下拉刷新
  //   this.freshData()
  // },
  getMoreData() {
    let pageNum = this.data.pageNum + 1
    this.setData({
      pageNum: pageNum
    })

  },
  onShow() {
    //自定义tabbar选中
    // if (typeof this.getTabBar === 'function' &&
    //   this.getTabBar()) {
    //   this.getTabBar().setData({
    //     count:"",
    //     selected: 0
    //   })
    // }

    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    console.log(sysInfo)

    let userInfo = wx.getStorageSync("userInfo")
    let addressInfo = wx.getStorageSync("addressInfo")
    let btmHolder = wx.getStorageSync('btmHolder')

    if(addressInfo){
      addressInfo = JSON.parse(addressInfo)
    }
    
    if(!userInfo){
      // wx.showToast({
      //   icon:"none",
      //   title:"未登录"
      // })
      return
    }else{
      userInfo = JSON.parse(userInfo)
    }
    console.log(addressInfo)
    this.setData({
      btmHolder:btmHolder||0,
      addressInfo:addressInfo,
      userInfo:userInfo,
      fixedTop:fixedTop
    })

    this.getIndexInfo();

  },
  onLoad: function (options) {
    console.log('111',wx.canIUse('scroll-view.refresher-enabled'))

  },
})