//app.js
import 'umtrack-wx';
var fundebug = require('utils/fundebug.1.3.1.min.js');
fundebug.init(
{
    apikey : '05bb7bb968530f0b763cd18f315a4b8e991b7fb61164fb86e59a4da888c785f4'
})
const api = require('utils/api.js')
const util = require('utils/util.js')
let local=null
App({
  umengConfig: {
    appKey: '60584221b8c8d45c13a9a6bc', //由友盟分配的APP_KEY
    useOpenid: true, // 是否使用openid进行统计，此项为false时将使用友盟+随机ID进行用户统计。使用openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用OpenID。
    autoGetOpenid: false, // 是否需要通过友盟后台获取openid，如若需要，请到友盟后台设置appId及secret
    debug: true, //是否打开调试模式
    uploadUserInfo: true // 上传用户信息，上传后可以查看有头像的用户分享信息，同时在查看用户画像时，公域画像的准确性会提升。
  },
  onLaunch: function (options) {
    this.getBtmHolder()
    //this.init()
    this.autoUpdate()
  },
  autoUpdate:function(){
    var self=this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //2. 小程序有新版本，则静默下载新版本，做好更新准备
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  //3. 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    }
  },
  async getAddress(loginInfo){
    let addressInfo = null
    let {
      user_info,
      address_info
    } = loginInfo
    if (!address_info.city_id) {
      try {
        local = await util.getLocation()
      } catch (error) {
        local = error
      }
      let data = {
        lng: local.longitude,
        lat: local.latitude
      }
      addressInfo = await api.getUserLocation(data)
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
      addressInfo = {
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
      wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
      
    }
  },
  wxLogin() {
    return new Promise((resolve, reject) => {
      var is_authed,is_mobile = null,userInfo=null
      wx.login({
        success: res => {
          console.log(res);
          let code = res.code
          let data = {
            code: code
          };
          api.getLoginInfo(data).then(loginInfo=>{
            if (loginInfo.statusCode == 200) {
              let result = loginInfo.data.result
              is_authed = result.is_authed
              is_mobile = result.is_mobile
              
              let {
                openid,
                user_id,
                user_info
              } = result
              //给友盟openid
              wx.uma.setOpenid(openid)
              console.log(result);
              userInfo = {
                user_id: user_id,
                is_authed: is_authed,
                is_mobile: is_mobile,
                birthday:user_info.birthday || "0000-00-00",
                real_gender:user_info.real_gender,
                openid: openid
              }
              if(is_mobile==1){
                userInfo.phone=user_info.mobile
              }
              if(is_authed==1){
                userInfo.nickname=user_info.nickname
                userInfo.head_url=user_info.head_url
              }

              wx.setStorageSync("userInfo", JSON.stringify(userInfo))

              resolve(result)
            }
          })
        },
        fail: function () {
          wx.showModal({
            title: '登录失败',
            content: '登录失败，请刷新重试',
            showCancel: false
          })
          wx.hideLoading()
        }
      })
    })
  },
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
    proSource: 1,
    breadCityList:{"10216":"1"},
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