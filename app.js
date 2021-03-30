//app.js
import 'umtrack-wx';
const auth = require('utils/auth.js')
const api = require('utils/api.js')
const util = require('utils/util.js')
App({
  umengConfig: {
    appKey: '60584221b8c8d45c13a9a6bc', //由友盟分配的APP_KEY
    useOpenid: true, // 是否使用openid进行统计，此项为false时将使用友盟+随机ID进行用户统计。使用openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用OpenID。
    autoGetOpenid: false, // 是否需要通过友盟后台获取openid，如若需要，请到友盟后台设置appId及secret
    debug: true, //是否打开调试模式
    uploadUserInfo: true // 上传用户信息，上传后可以查看有头像的用户分享信息，同时在查看用户画像时，公域画像的准确性会提升。
  },
  onLaunch: function (options) {
    // wx.showLoading({
    //   title: '加载中...',
    //   mask: true,
    //   success (res) {
    //     console.log('显示loading')
    //   }
    // })
    this.init()
  },
  async init() {
    console.log("---app onload--");
    var is_authed, local = null,
      is_mobile = null
    let userInfo = wx.getStorageSync(userInfo)
    if (userInfo && JSON.parse(userInfo).is_authed == 1) {
      is_authed = JSON.parse(userInfo).is_authed
    } else {
      let loginInfo = await auth.getLoginInfo()
      console.log(loginInfo)
      if (loginInfo.statusCode == 200) {
        let result = loginInfo.data.result
        is_authed = result.is_authed
        is_mobile = result.is_mobile

        let {
          openid,
          user_info,
          user_id,
          address_info
        } = result
        //给友盟openid
        wx.uma.setOpenid(openid)

        let userInfo = {
          user_id: user_id,
          is_authed: is_authed,
          is_mobile: is_mobile,
          openid: openid,
          nickname: user_info.nickname,
          photo: user_info.head_url,
          phone: user_info.mobile
        }
        wx.setStorageSync("userInfo", JSON.stringify(userInfo))

        wx.getSetting({
          success: res => {
            if (!res.authSetting['scope.userInfo'] || is_authed != 1) {
              // 未授权跳授权页
              wx.navigateTo({
                url: '/pages/login/login'
              })
            }
          },
          fail: res => {
            wx.showModal({
              title: '网络出错',
              content: '网络出错，请刷新重试',
              showCancel: false
            })
          }
        })

        console.log(address_info)
        if (!address_info.city_id) {
          try {
            local = await util.getLocation()
          } catch (error) {
            local = error
          }

          console.log(local);
          let data = {
            lng: local.longitude,
            lat: local.latitude
          }
          console.log(data)
          let addressInfo = await api.getUserLocation(data)
          console.log(addressInfo)
          wx.setStorageSync("addressInfo", JSON.stringify(addressInfo.address_info))
        } else {
          let {
            address: addresstxt,
            id,
            area_id,
            area_name,
            old_city_id,
            city_name,
            address_detail,
            is_default,
            mobile,
            name
          } = user_info.default_address
          let addressInfo = {
            address: addresstxt,
            id: id,
            area_id: area_id,
            area_name: area_name,
            city_id: old_city_id,
            city_name: city_name,
            address_detail: address_detail,
            is_default: is_default,
            mobile: mobile,
            name: name,
            is_ziti: address_info.is_ziti
          }
          console.log(addressInfo);
          wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
        }

      }
    }
    await this.getBtmHolder()
    wx.hideLoading()
  },

  // getUserInfo(){
  //   return new Promise(function(resolve,reject){
  //     auth.getLoginInfo().then(res=>{
  //       console.log(res);
  //       if(res.statusCode==200){
  //         let {openid,user_info,user_id} = res.data.result
  //         let userInfo = {
  //           user_id:user_id,
  //           openid:openid,
  //           nickname:user_info.nickname,
  //           photo:user_info.head_url,
  //           phone:user_info.mobile
  //         }
  //         resolve(userInfo)
  //         openid && wx.setStorageSync("userInfo", JSON.stringify(userInfo))
  //       }

  //     })
  //   })
  // },
  getBtmHolder() {
    return new Promise(function (resolve, reject) {
      wx.getSystemInfo({
        success: function (res) {
          let safeArea = res.safeArea;
          let btmHolder = res.screenHeight - safeArea.bottom
          wx.setStorageSync('btmHolder', btmHolder)
          resolve(btmHolder)
        }
      });
    })
  },
  onShow(options) {
    console.log(options);
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.isShare = true
    } else {
      this.globalData.isShare = false
    };
    // if ((options.scene == 1001 || options.scene == 1012 || options.scene == 1017) && options.path == 'pages/chart/paySuccess/paySuccess') {
    //   this.globalData.sharePoster = true
    // }
    util.setWatcher(this);
  },

  globalData: {
    bindPhoneStat: "1022",
    proType: '',
    isShare: false,
    userInfo: null,
    cityId: null,
    cityName: null,
    isShowBalance: false,
    isShowScore: true,
    cardNo: null,
    cardPwd: null,
    thirdCardNo: null,
    thirdCardPwd: null,
    proSource: 1
  },
  watch: {
    'watchNum': function (value, oldValue) {
      console.log("appjs watch");
      console.log(value, oldValue)
      //整理
    },
  },
  //更新列表中的数据 指定格式索引  追加的数量
  refreshList(ctabTypeMealIdSpuId, num,allFlag=null) {
    // console.log(ctabTypeMealIdSpuId)
    let params = ctabTypeMealIdSpuId.split("_");
    console.log(params,num,allFlag)
    console.log(this.data)

    if (params.length == 3) {
      //搜索
      if (typeof (this.data.SearchSearch_SearchListIndex[ctabTypeMealIdSpuId]) != "undefined") {
        let tmpVal = this.data.SearchSearch_SearchList['list'][this.data.SearchSearch_SearchListIndex[ctabTypeMealIdSpuId]]
        tmpVal.selected = allFlag ? parseInt(num) : parseInt(tmpVal.selected) + parseInt(num);
        let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
        tmpVal['selectNumberLength'] = selectNumberLength;
        tmpVal['cornerTagStyle'] = this.getAddTapNumStyle(tmpVal.selected);
      }
    } else {
      //分类
      if (typeof (this.data.ProductList_ProListIndex[ctabTypeMealIdSpuId]) != "undefined") {
        let tmpVal = this.data.ProductList_ProList[params[0]][this.data.ProductList_ProListIndex[ctabTypeMealIdSpuId]];
        tmpVal.selected = allFlag ? parseInt(num):parseInt(tmpVal.selected) + parseInt(num);
        let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
        tmpVal['selectNumberLength'] = selectNumberLength;
        tmpVal['cornerTagStyle'] = this.getAddTapNumStyle(tmpVal.selected);
      }
    }
    // console.log(this.data)

  },
  //全部更新
  inCartRefreshList(params) {
    console.log('app- params', params);
    let diffStr = params['type'];
    diffStr = params['type'] == 1 ? diffStr + '_' + params['proId'] + "_0" : diffStr + '_' + params['proId'] + '_' + params['proId'];
    //分类
    for (let key in this.data.ProductList_ProListIndex) {
      let keyParams = key.substr(key.indexOf('_') + 1);
      if (keyParams == diffStr) {
        //更新
        this.refreshList(key, params['selected'],true)
      }
    }

    //搜索
    this.refreshList(diffStr, params['selected'],true)
  },
  getAddTapNumStyle(num) {
    let selectNumberLength = num > 0 ? num.toString().length : 0;
    let style = "";
    switch (selectNumberLength) {
      case 1:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px;width:5px;";
        break;
      case 2:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
        break;
      default:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
        break;
    }
    return style;
  },
  data: {
    ProductList_ProList: {}, //列表页信息
    ProductList_ProListIndex: {}, //列表页索引信息
    SearchSearch_SearchList: {}, //搜索列表
    SearchSearch_SearchListIndex: {}, //搜索列表
  }
})