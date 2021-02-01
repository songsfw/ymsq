const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
// const mapUrl = "https://apis.map.qq.com/ws/"
// const key = 'PFTBZ-RUYWU-I64VW-2A3XS-AVAS7-4YBUB'
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityName: "北京市",
    selected: 0,
    index: 0,
    cityIndex: 0,
    multiIndex: [0, 0],
    hasAdd:true,
    poi:[],
    polygons: [
      {
        points: [{
          longitude: 116.44496986689417,
          latitude: 39.922802961321324
        }, {
          longitude: 116.44796800915726,
          latitude: 39.92259077484159
        }, {
          longitude: 116.44788129443994,
          latitude: 39.921134873701035
        },
        {
          longitude: 116.44447444763144,
          latitude: 39.92005764171167
        },
        {
          longitude: 116.44250652541457,
          latitude: 39.92157474416733
        }],
        fillColor: "#00000033",
        strokeColor: "#FFF",
        strokeWidth: 2,
        zIndex: 1
      },
      {
        points: [{
          longitude: 111.818599,
          latitude: 34.707698
        }, {
          longitude: 108.985415,
          latitude: 34.441382
        },
        {
          longitude: 107.771193,
          latitude: 33.120195
        },
        {
          longitude: 110.78835,
          latitude: 32.778928
        }],
        fillColor: "#ffff0033",
        strokeColor: "#FFF",
        strokeWidth: 2,
        zIndex: 1
      }
    ],
    cityList: [],
    backfill: "",
    scale:16
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
  selectAdd(e) {
    let {address,lng,lat,title} = e.currentTarget.dataset
    let type = this.data.type,city=this.data.cityName + ',' + this.data.district
    console.log(address);
    wx.redirectTo({
      url: "/pages/user/adddata/adddata?address=" + address + "&lng=" + lng + "&lat="+lat+"&type="+type+"&city="+city+"&title="+title
    })
  },
  moveToUserLocal(){
    this.mapCtx.moveToLocation()
  },
  moveToLocation: function (lng='',lat='') {
    this.mapCtx.moveToLocation({
      longitude:lng,
      latitude:lat,
      success(res){
        console.log(res);
        this.setData({
          scale:16
        })
      }
    })
  },
  changeRegion: function (e) {
    console.log(e)
    let type = e.type, moving = false
    if (type == 'end') {
      console.log("111")
      this.getCenterLocation()
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
  //触发关键词输入提示事件
  getsuggest: util.debounce(function (e) {
    if (!e.detail.value) return
    let cityName = this.data.cityName
    console.log(cityName);
    console.log(e.detail.value)
    var _this = this;
    //调用关键词提示接口
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value, //用户输入的关键词，可设置固定值
      region: cityName, //设置城市名，限制关键词所示的地域范围，非必填参数
      success: function (res) {
        console.log(res);
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }
        _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
          suggestion: sug
        });
      },
      fail: function (error) {
        console.error(error);
      }
    });
  }, 500),
  backfill: function (e) {
    var id = e.currentTarget.id;
    let suggestion = this.data.suggestion
    for (var i = 0; i < suggestion.length; i++) {
      if (i == id) {
        console.log(suggestion[i]);
        this.setData({
          backfill: suggestion[i].title,
          lng: suggestion[i].longitude,
          lat: suggestion[i].latitude,
          suggestion: []
        });
      }
    }
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
        var cityName = res.ad_info.city,district= res.ad_info.district
        let isAllow = city.some(item => item.name == cityName)
        if (!isAllow) {
          wx.showToast({
            title: '城市暂未开通,默认到北京',
            icon: 'none',
            duration: 3000
          })
          this.setData({
            cityName: "北京市",
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
    api.getCity().then(res => {
      console.log(res);
      let cityList = [], city = res.city, area = res.area

      cityList[0] = res.city
      cityList[1] = res.area[res.city[0].id]

      if (res) {
        this.setData({
          city,
          area,
          cityList: cityList
        })
      }

    })
  },
  getAddress() {
    api.getAddress().then(res => {
      console.log(res);
      if (res) {
        this.setData({
          address: res
        })
      }
    })
  },
  selectCity(e) {
    let index = e.detail.value
    let city = this.data.city
    let cityName = city[index].name
    console.log(cityName);
    this.setData({
      cityName: cityName
    })
  },
  selectZone(e) {
    console.log(e.detail);
    let { column, value } = e.detail
    let { city, area, cityList, multiIndex } = this.data

    let cityId
    multiIndex[column] = value
    switch (column) {
      case 0:
        cityId = city[value].id
        cityList[1] = area[cityId]
        multiIndex[1] = 0
        break;

      default:
        break;
    }
    console.log(cityList);
    console.log(multiIndex);
    this.setData({
      cityList: cityList,
      multiIndex: multiIndex
    })
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
    this.getAddress()
    util.getLocation().then(res => {
      console.log(res)
      this.setData({
        lng: res.longitude,
        lat: res.latitude,
        type,
        selected: 1
      })
      this.getPoi(res.latitude, res.longitude)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})