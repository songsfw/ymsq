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
      lng:curCity.point.lng,
      lat:curCity.point.lat,
      cityId:cityId,
      currentTab: currentId
    })
    console.log(cakePoints);
    if(breadPosints.length>0 && currentId==1){
      this.setData({
        polygons:breadPosints
      })
      return
    }
    if(cakePoints[cityId].length>0 && currentId==2){
      this.setData({
        polygons:cakePoints[cityId]
      })
      return
    }
    this.deliveryPoints()
  },
  IsPtInPoly(aLat, aLon, pointList) {
    /* 
    :param aLon: double 经度 
    :param aLat: double 纬度 
    :param pointList: list [{latitude: 22.22, longitude: 113.113}...] 多边形点的顺序需根据顺时针或逆时针，不能乱 
    */
    var iSum = 0
    var iCount = pointList.length

    if (iCount < 3) {
      return false
    }
    for (var i = 0; i < iCount; i++) {
      var pLat1 = pointList[i].latitude
      var pLon1 = pointList[i].longitude
      if (i == iCount - 1) {
        var pLat2 = pointList[0].latitude
        var pLon2 = pointList[0].longitude
      } else {
        var pLat2 = pointList[i + 1].latitude
        var pLon2 = pointList[i + 1].longitude
      }
      if (((aLat >= pLat1) && (aLat < pLat2)) || ((aLat >= pLat2) && (aLat < pLat1))) {
        if (Math.abs(pLat1 - pLat2) > 0) {
          var pLon = pLon1 - ((pLon1 - pLon2) * (pLat1 - aLat)) / (pLat1 - pLat2);
          if (pLon < aLon) {
            iSum += 1
          }
        }
      }
    }
    if (iSum % 2 != 0) {
      return true
    } else {
      return false
    }
  },
  moveToUserLocal(){
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
    let type = e.type, moving = false
    if (type == 'end') {
      console.log("111")
      //this.getCenterLocation()
      moving = true
    } else {
      this.setData({
        poi: []
      });
      moving = false
    }
    this.setData({
      moving
    })
  },

  getPoi: util.debounce(function (lat, lng) {
    let { city } = this.data, location = null
    //let polygons = this.data.polygons
    //let hasAdd
    if (lat && lng) {
      location = `${lat},${lng}`
      //for(let i = 0;i<polygons.length;i++){
        // if(this.IsPtInPoly(lat,lng,polygons[i].points)){
        //   hasAdd = true
        //   this.setData({
        //     hasAdd:true
        //   })
        //   break
        // }
      //}
    }
    // if(!hasAdd){
    //   this.setData({
    //     hasAdd:false
    //   })
    //   return
    // }
    qqmapsdk.reverseGeocoder({

      location: location || '', //获取表单传入的位置坐标,不填默认当前位置
      get_poi: 1, //是否返回周边POI列表
      success: res => {
        console.log(res);
        var res = res.result;
        var cityName = res.ad_info.city || '未知' ,district= res.ad_info.district
        let isAllow = city.some(item => cityName.indexOf(item.city_nae>=0))
        if (!isAllow) {
          wx.showToast({
            title: '城市暂未开通,默认到北京',
            icon: 'none',
            duration: 3000
          })
          this.setData({
            cityName: "北京",
            lat: '39.983673',
            lng: '116.458033'
          })
          this.moveToLocation('116.458033','39.983673')
        } else {
          this.setData({
            cityName: cityName,
            district:district,
            poi: res.pois
          });
        }

      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        //console.log(res);
      }
    })
  }, 1000, false),
  getCenterLocation: function () {
    console.log("22")
    this.mapCtx.getCenterLocation({
      success: res => {
        console.log(res.longitude)
        console.log(res.latitude)
        // this.setData({
        //   localLat:res.latitude,
        //   localLng:res.longitude
        // })
        this.getPoi(res.latitude, res.longitude)
      }
    })
  },
  getCity() {
    api.deliveryList().then(res => {
      console.log(res);
      if (res) {
        let city = res.data
        city['2'].forEach(item=>{
          let key = item.city_id
          cakePoints[key]=[]
        })
        console.log(city);
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
        let posints = res.points
        posints.forEach(item=>{
          let newItem = {
            points:item,
            fillColor: "#00000033",
            strokeColor: "#FFF",
            strokeWidth: 2,
            zIndex: 1
          }
          if(currentTab==1){
            breadPosints.push(newItem)
            this.setData({
              polygons:breadPosints
            },() => {
              wx.hideLoading()
            })
          }else{
            cakePoints[cityId].push(newItem)
            this.setData({
              polygons:cakePoints[cityId]
            },() => {
              wx.hideLoading()
            })
          }
        })
      }
    })
  },
  selectCity(e) {
    let index = e.detail.value
    let city = this.data.city['2']
    let {city_nae,city_id,point} = city[index]
    let cityName = city_nae
    console.log(cityName);
    this.setData({
      lng:point.lng,
      lat:point.lat,
      scale:9.8,
      cityId:city_id,
      cityName: cityName
    })
    if(cakePoints[city_id].length>0){
      this.setData({
        polygons:cakePoints[city_id]
      })
      return
    }
    this.deliveryPoints()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { type } = options
    qqmapsdk = new QQMapWX({
      key: 'PFTBZ-RUYWU-I64VW-2A3XS-AVAS7-4YBUB'
    });
    this.getCity()
    this.deliveryPoints()
    util.getLocation().then(res => {
      console.log(res)
      this.setData({
        lng: res.longitude,
        lat: res.latitude,
        type,
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