//app.js
const auth = require('utils/auth.js')
const api = require('utils/api.js')
const util = require('utils/util.js')
App({
  onLaunch: function (options) {
    this.isAuth()
  },
  async isAuth () {
    var is_authed,local=null
    let userInfo = wx.getStorageSync("userInfo")
    if(userInfo && JSON.parse(userInfo).is_authed==1){
      is_authed = JSON.parse(userInfo).is_authed
      return 
    }else{
      let loginInfo = await auth.getLoginInfo()
      console.log(loginInfo)
      if(loginInfo.statusCode==200){
        is_authed = loginInfo.data.result.is_authed
        let {openid,user_info,user_id,address_info} = loginInfo.data.result
        userInfo = {
          user_id:user_id,
          is_authed:is_authed,
          openid:openid,
          nickname:user_info.nickname,
          photo:user_info.head_url,
          phone:user_info.mobile
        }
        console.log(address_info)
        if(!address_info.city_id){
          try {
            local = await util.getLocation()
          } catch (error) {
            local = error
          }
          
          console.log(local);
          let data = {
            lng:local.longitude,
            lat:local.latitude
          }
          console.log(data)
          let addressInfo = await api.getUserLocation(data)
          console.log(addressInfo)
          wx.setStorageSync("addressInfo", JSON.stringify(addressInfo.address_info))
        }else{
          let {address:addresstxt,id,area_id,area_name,old_city_id,city_name,address_detail,is_default,mobile,name} = user_info.default_address
          let addressInfo = {
            address: addresstxt,
            id: id,
            area_id: area_id,
            area_name: area_name,
            city_id: old_city_id,
            city_name: city_name,
            address_detail:address_detail,
            is_default:is_default,
            mobile:mobile,
            name:name
          }
          wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
        }
        wx.setStorageSync("userInfo", JSON.stringify(userInfo))
      }
    }
    
    wx.getSetting({
      success: res => {
        
        if (!res.authSetting['scope.userInfo'] || is_authed !=1) {
          // 未授权跳授权页
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      },
      fail:res=>{
        wx.showModal({
          title: '网络出错',
          content: '网络出错，请刷新重试',
          showCancel: false
        })
      }
    })

  },
  //Promise:null,
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
  onShow(options) {
    console.log(options);
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.isShare = true
    } else {
      this.globalData.isShare = false
    };
    if ((options.scene == 1001 || options.scene == 1012) && options.path == 'pages/chart/paySuccess/paySuccess') {
      this.globalData.sharePoster = true
    }
  },
  
  globalData: {
    proType:1,
    isShare: false,
    userInfo: null,
    cityId:null,
    cityName:null
  }
})