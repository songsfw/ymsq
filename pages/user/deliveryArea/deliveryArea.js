const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
// const mapUrl = "https://apis.map.qq.com/ws/"
// const key = 'PFTBZ-RUYWU-I64VW-2A3XS-AVAS7-4YBUB'
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
let breadPosints = [],cakePoints={}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu:{1: "面包", 2: "蛋糕"},
    currentTab:1,
    cityName: "北京市",
    selected: 0,
    index: 0,
    cityIndex: 0,
    multiIndex: [0, 0],
    hasAdd:true,
    poi:[],
    polygons: [],

    cityId:10216,
    scale:9.8
  },
  switchTab: function (e) {
    var currentId = e.currentTarget.dataset.tabid
    let cityId,curCity
    let city = this.data.city
    if(currentId==1){
      cityId = this.data.cityId == '675' ? '10216' : this.data.cityId
      curCity = city['1'].find(item=>{
        return item.city_id == '10216'
      })
    }else{
      cityId = this.data.cityId == '10216' ? '675' : this.data.cityId
      curCity = city['2'].find(item=>{
        return item.city_id == cityId
      })
    }
    this.setData({
      lng:curCity.longitude,
      lat:curCity.latitude,
      cityId:cityId,
      currentTab: currentId
    })
    this.initPolygons()
  },
  initPolygons(){
    let currentTab = this.data.currentTab,
        cityId = this.data.cityId
    if(breadPosints.length>0 && currentTab==1){
      this.setData({
        polygons:breadPosints
      })
      return
    }
    if(cakePoints[cityId].length>0 && currentTab==2){
      this.setData({
        polygons:cakePoints[cityId]
      })
      return
    }
    this.deliveryPoints()
  },
  IsPtInPoly(obj) {
    //let {city_name,area_name,lng,lat,cart_type}=obj
    console.log(obj);
    if(!obj) return
    api.checkAddressInMap(obj).then(res => {
      if (res) {
        console.log(res);
      }

    })
    /* 
    :param aLon: double 经度 
    :param aLat: double 纬度 
    :param pointList: list [{latitude: 22.22, longitude: 113.113}...] 多边形点的顺序需根据顺时针或逆时针，不能乱 
    */
    // var iSum = 0
    // var iCount = pointList.length

    // if (iCount < 3) {
    //   return false
    // }
    // for (var i = 0; i < iCount; i++) {
    //   var pLat1 = pointList[i].latitude
    //   var pLon1 = pointList[i].longitude
    //   if (i == iCount - 1) {
    //     var pLat2 = pointList[0].latitude
    //     var pLon2 = pointList[0].longitude
    //   } else {
    //     var pLat2 = pointList[i + 1].latitude
    //     var pLon2 = pointList[i + 1].longitude
    //   }
    //   if (((aLat >= pLat1) && (aLat < pLat2)) || ((aLat >= pLat2) && (aLat < pLat1))) {
    //     if (Math.abs(pLat1 - pLat2) > 0) {
    //       var pLon = pLon1 - ((pLon1 - pLon2) * (pLat1 - aLat)) / (pLat1 - pLat2);
    //       if (pLon < aLon) {
    //         iSum += 1
    //       }
    //     }
    //   }
    // }
    // if (iSum % 2 != 0) {
    //   return true
    // } else {
    //   return false
    // }
  },
  moveToUserLocal(){
    this.getPoi()
    this.mapCtx.moveToLocation()
  },
  moveToLocation: function (lng='',lat='') {
    this.mapCtx.moveToLocation({
      longitude:lng,
      latitude:lat,
      success(res){
        this.setData({
          scale:9.8
        })
      }
    })
  },
  changeRegion: function (e) {
    console.log(e)
    let causedBy =e.causedBy
    let type = e.type, moving = false
    if(causedBy=="gesture"){
      this.setData({
        showMark: false
      });
    }
    if (type == 'end') {
      //this.getCenterLocation()
      moving = true
    } else {
      
      moving = false
    }
    this.setData({
      moving
    })
  },
  //触发关键词输入提示事件
  getsuggest: util.debounce(function (e) {
    if (!e.detail.value){
      this.setData({
        showSugg:false
      })
      return
    }
    console.log(e.detail.value)
    var _this = this;
    //调用关键词提示接口
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value, //用户输入的关键词，可设置固定值
      //region: cityName, //设置城市名，限制关键词所示的地域范围，非必填参数
      success: function (res) {
        console.log(res);
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            category: res.data[i].category,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }
        _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
          showSugg:true,
          suggestion: sug
        });
      },
      fail: function (error) {
        console.error(error);
      }
    });
  }, 500),
  selectAdd(e) {
    let {lng,lat,prov,district,address} = e.currentTarget.dataset
    let currentTab = this.data.currentTab
    let markers = [
      {
        callout:{padding:5,content:address,display:"ALWAYS",borderRadius:10},
        latitude:lat,
        longitude:lng,
        iconPath:"../../../image/local.png",
        width:30,
        height:30
      }
    ]
    this.setData({
      lng:lng,
      lat:lat,
      scale:12,
      showSugg:false,
      showMark:true,
      markers:markers
    })
    let isCity = this.isCity(prov)
    if(isCity){
      this.IsPtInPoly({
        address:address,
        city_name:prov,
        area_name:district,
        lng:lng,
        lat:lat,
        cart_type:currentTab
      })
      this.getPoi(lat, lng)
    }
  },
  //判断是否为可配送城市
  isCity(currcity){
    let { city,currentTab } = this.data
    let isAllow = city[currentTab].some(item => item.name == currcity)
    if (!isAllow) {
      wx.showToast({
        title: '城市暂未开通',
        icon: 'none',
        duration: 3000
      })
    }
    return isAllow
  },
  getPoi: util.debounce(function (lat, lng) {
    let { city,currentTab } = this.data, location = null
    if (lat && lng) {
      location = `${lat},${lng}`
    }
    qqmapsdk.reverseGeocoder({

      location: location || '', //获取表单传入的位置坐标,不填默认当前位置
      get_poi: 0, //是否返回周边POI列表
      success: res => {
        console.log(res);
        var res = res.result;
        var cityName = res.ad_info.city
        console.log(city[currentTab]);
        if(!location){
          let isCity = this.isCity(cityName)
          if(!isCity){
            return
          }
        }
        let currCity = city[currentTab].find(item => cityName==item.name)
        
        console.log(currCity);
        if(currCity){
          this.setData({
            cityId:currCity.city_id
          })
          this.initPolygons()
        }else{
          wx.showToast({
            title: '城市暂未开通',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: function (error) {
        console.error(error);
      }
    })
  }, 1000, false),
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: res => {
        this.getPoi(res.latitude, res.longitude)
      }
    })
  },
  getCity() {
    //wx.showLoading({mask:true})
    api.deliveryList().then(res => {
      //wx.hideLoading()
      if (res) {
        let city = res.data
        city['2'].forEach(item=>{
          let key = item.city_id
          cakePoints[key]=[]
        })
        this.setData({
          city,
          citys:city['2']
        })
      }

    })
  },
  deliveryPoints() {
    wx.showLoading({title:"地图渲染中..."})
    let {currentTab,cityId} = this.data
    let data = {
      type:currentTab,
      city_id:cityId
    }
    api.deliveryPoints(data).then(res => {
      console.log(res);
      if (res) {
        wx.hideLoading()
        let posints = res.points
        posints.forEach(item=>{
          let newItem = {
            points:item,
            fillColor: "#5375FD33",
            strokeColor: "#FFF",
            strokeWidth: 2,
            zIndex: 1
          }
          if(currentTab==1){
            breadPosints.push(newItem)
            this.setData({
              polygons:breadPosints
            })
            
          }else{
            cakePoints[cityId].push(newItem)
            this.setData({
              polygons:cakePoints[cityId]
            })
          }
        })
      }
    })
  },
  //蛋糕城市
  selectCity(e) {
    let index = e.detail.value
    let city = this.data.city['2']
    let {name,city_id,longitude,latitude} = city[index]
    this.setData({
      lng:longitude,
      lat:latitude,
      scale:9.8,
      cityId:city_id,
      cityName: name
    })
    if(cakePoints[city_id].length>0){
      this.setData({
        polygons:cakePoints[city_id]
      })
      return
    }
    this.deliveryPoints()
  },
  //面包城市-北京
  setCity(e) {
    this.setData({
      lat: '39.983673',
      lng: '116.458033',
      scale:9.8,
      cityId:'10216'
    })
    
    if(breadPosints.length>0){
      this.setData({
        polygons:breadPosints
      })
      return
    }
    this.deliveryPoints()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'PFTBZ-RUYWU-I64VW-2A3XS-AVAS7-4YBUB'
    });
    this.getCity()
    if(breadPosints.length==0){
      this.deliveryPoints()
    }else{
      this.setData({
        polygons:breadPosints
      })
    }

    util.getLocation().then(res => {
      this.setData({
        userLocal:res,
        lng: res.longitude,
        lat: res.latitude,
        selected: 1
      })
    }).catch(err=>{
      this.setData({
        userLocal:err,
        lng: err.longitude,
        lat: err.latitude,
        selected: 1
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})