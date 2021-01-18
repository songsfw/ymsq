const app = getApp();
const util = require('../../utils/util.js')
const ajax = require('../../utils/request.js')
const api = require('../../utils/api.js')

const throttle = util.throttle
// 'id': '1',
//     'cityName': '上海',
//     'firstletter': 'S',
//     'city_pinyin': 'Shanghai',
//     'city_short': 'sh',
//     'count': '311'

Page({
  data: {
    citylist: [],
    navTop: 0, //侧边导航距离窗口顶部的距离,
    navItemHeight: 0, //侧边导航项的高度
    sections: [], //所有section，保存每个section的节点在文档的位置信息
    inNavbar: false, //手指是否在侧边导航，主要是区别后面wx.pageScrollTo触发的滚动还是直接触发的滚动
    searchValue: '', //查询值
    result: [], //城市查询结果列表

    visitied:[]

  },
  onShow() {

  },
  onLoad() {
    let userCityName= null,userCityId=null,userLocation=null,visitied=[]
    var sysInfo = app.globalSystemInfo
    var fixedTop = sysInfo.navBarHeight

    this.normalizeCityList()
    if (wx.getStorageSync("userLocation")) {
      userLocation = JSON.parse(wx.getStorageSync("userLocation"))
      userCityName = userLocation.cityName;
      userCityId = userLocation.cityId;
    }
    if (wx.getStorageSync("visitied")) {
      visitied = JSON.parse(wx.getStorageSync("visitied"))
    }else{
      visitied.push({cityName:userCityName,cityId:userCityId})
    }
    console.log(userLocation);
    let pathArr = getCurrentPages()
    let prePage = pathArr[pathArr.length-2].route
    this.setData({
      fixedTop: fixedTop,
      prePage:prePage,
      userLocation:userLocation,
      visitied:visitied
    })
  },
  onReady() {
    
    

  },
  onUnload() {
    wx.hideToast()
  },
  initNav(){
    const query = wx.createSelectorQuery()
    query.select('.citylist-nav').boundingClientRect();
    query.select('.citylist-nav-item').boundingClientRect();
    query.selectAll('.section').fields({
      dataset: true,
      size: true,
      rect: true
    });
    query.select('.search-city').boundingClientRect();
    query.exec((res) => {
      let sections = []
      res[2].forEach(item => {
        sections.push({
          top: item.top - res[3].height - this.data.fixedTop,
          height: item.height,
          title: item.dataset.title
        })
      })
      this.setData({
        navTop: res[0].top,
        navItemHeight: res[1].height,
        sections
      })
    })
  },
  //页面滚动监听，使用函数节流优化
  // onPageScroll: throttle(function (e) {
  //   if (this.data.inNavbar || this.data.searchValue) {
  //     return //如果是侧边栏的wx.pageScrollTo触发的滚动则不执行下面的程序
  //   }
  //   const sections = this.data.sections
  //   const scrollTop = e.scrollTop
  //   this.handlePageScroll(sections, scrollTop)
  // }),
  //页面滚动的处理程序
  // handlePageScroll(sections, scrollTop) {
  //   for (let item of sections) {
  //     if (scrollTop >= item.top && scrollTop < item.top + item.height) {
  //       wx.showToast({
  //         title: item.title,
  //         icon: 'none',
  //         duration: 500
  //       })
  //       break;
  //     }
  //   }
  // },
  //处理API返回的城市列表数据
  normalizeCityList() {
    let map = {}
    let hotCity = []
    api.getCity()
      .then(res => {
        console.log(res);
        let citys = res
        citys.forEach(item => {
          const key = item.firstletter.toUpperCase()
          if (item.ishot == 1) {
            hotCity.push(item)
          }
          //如果没有该字母索引，就创建该字母索引
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(item)
        })
        let list = []
        for (let [index, value] of Object.entries(map)) {
          list.push(value)
        }
        //按字母顺序排序
        list.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0))

        //创建当前定位城市
        console.log(list);
        // let current = {
        //   title: '当前定位城市',
        //   index: '定位',
        //   style: 'inline',
        //   items: []
        // };
        // //判断是否获得用户定位城市
        // let location =  wx.getStorageSync("location")
        // if (location) {
        //   let city = citys.find(item => item.cityName === app.globalData.userLocation.cityName) || { cityName: '定位失败，请点击重试' }
        //   current.items = [city]
        // } else {
        //   current.items = [{
        //     cityName: '定位失败，请点击重试'
        //   }]
        // }

        this.setData({
          citylist: list,
          hotCity: hotCity
        })
        this.initNav()
      })

  },
  //点击城市的事件处理程序
  selectCity(e) {
    const cityId = e.currentTarget.dataset.city.cityId,
          cityName = e.currentTarget.dataset.city.cityName
    const _this = this
    let visitied = this.data.visitied
    let obj={}
    
    visitied.forEach(function(item){
      obj[item.cityId]=true
    })

    if(!obj[cityId]){
      if(visitied.length<4){
        visitied.push({cityId:cityId,cityName:cityName})
      }else{
        visitied.shift()
        visitied.push({cityId:cityId,cityName:cityName})
      }
    }
    let data = {
      areaId: '',
      areaName: "",
      cityId: cityId,
      cityName: cityName
    }
    console.log(visitied);
    wx.setStorageSync("selectCity",JSON.stringify(data))
    wx.setStorageSync("visitied",JSON.stringify(visitied))
    
    wx.navigateBack({
      delta: 1
    })
    
  },
  //侧边栏导航的点击事件处理
  navSelect(e) {
    const {
      citylist,
      sections
    } = this.data
    console.log(sections);
    const index = e.currentTarget.dataset.index

    // wx.showToast({
    //   icon: 'none',
    //   title: citylist[index].title
    // })

    wx.pageScrollTo({
      scrollTop: sections[index].top,
      duration: 0
    })
  },
  //在侧边栏上滑动的事件处理,使用函数节流优化
  handleTouchmove: throttle(function (e) {
    const {
      navTop,
      navItemHeight,
      citylist,
      sections
    } = this.data
    let index = Math.floor((e.changedTouches[0].clientY - navTop) / navItemHeight)
    if (index < 0 || index > citylist.length - 1) {
      return
    }
    // wx.showToast({
    //   icon: 'none',
    //   title: citylist[index].title,
    //   duration: 500
    // })
    wx.pageScrollTo({
      scrollTop: sections[index].top,
      duration: 0
    })
  }),
  //input框输入是的查询事件
  search(e) {
    const value = e.detail.value.trim().toUpperCase()
    let result = []
    if (value) {
      result = citys.filter(item => {
        if (value.length === 1 && value >= 'A' && value <= 'Z') {
          return value === item.firstletter.toUpperCase()
        }
        return item.cityName.includes(value) || item.city_pinyin.toUpperCase().includes(value) || item.city_short.toUpperCase().includes(value)
      })
    }
    this.setData({
      searchValue: value,
      result,
    })
  },
  //设置手指在侧边导航中
  handleTouchstart() {
    this.setData({
      inNavbar: true
    })
  },
  //设置手指离开侧边导航中
  handleTouchend() {
    this.setData({
      inNavbar: false
    })
  }
})