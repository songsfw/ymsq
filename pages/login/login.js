//index.js
const util = require('../../utils/util.js')
const auth = require('../../utils/auth.js')
const api = require('../../utils/api.js')

const app = getApp()

Page({
  data: {
    show:false
  },

  //授权用户信息
  onGotUserInfo: function (e) {
    var detailInfo = e.detail
    var userDetail = detailInfo.userInfo
    console.log(e.detail);
    var openid = this.data.userInfo.openid
    if (userDetail) { //同意授权
      let data = {
        encryptedData: detailInfo.encryptedData,
        iv: detailInfo.iv,
        rawData:detailInfo.rawData,
        openid: openid,
        uname:"wxxcx"
      }
      auth.appLogin(data)
      .then(res=>{
        console.log(res);
        wx.navigateBack({
          delta: 1
        })
      })
    }
  },
  onLoad () {
    let userInfo = wx.getStorageSync("userInfo")
        userInfo = userInfo && JSON.parse(userInfo)
        this.setData({
          userInfo:userInfo,
          show:true
        })
    // let loginInfo = await auth.getLoginInfo()
    // console.log(loginInfo);
    // let local
    // if(loginInfo.statusCode==200){
    //   let {openid,user_info,user_id,is_authed,address_info} = loginInfo.data.result
    //   let userInfo = {
    //     user_id:user_id,
    //     is_authed:is_authed,
    //     openid:openid,
    //     nickname:user_info.nickname,
    //     photo:user_info.head_url,
    //     phone:user_info.mobile
    //   }
    //   if(address_info){
    //     wx.setStorageSync("addressInfo", JSON.stringify(address_info))
    //   }else{
    //     try {
    //       local = await util.getLocation()
    //     } catch (error) {
    //       local = error
    //     }
        
    //     console.log(local);
    //     let data = {
    //       lng:local.longitude,
    //       lat:local.latitude
    //     }
    //     console.log(data)
    //     addressInfo = await api.getUserLocation(data)
    //     addressInfo = addressInfo.address_info
    //     console.log(addressInfo)
    //     wx.setStorageSync("addressInfo", JSON.stringify(addressInfo.address_info))
    //   }
    //   wx.setStorageSync("userInfo", JSON.stringify(userInfo))
    //   this.setData({
    //     userInfo:userInfo,
    //     show:true
    //   })
    // }

  },
  onShow() {

  }
})
