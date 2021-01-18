//app.js

App({
  onLaunch: function (options) {
    // let enterPage = options.path
    // console.log(enterPage)
    //this.Promise = this.getUserInfo()
    // auth.getLoginInfo().then(res=>{
    //   console.log(res);
    //   if(res.statusCode==200){
    //     let {openid,user_info,user_id,is_authed} = res.data.result
    //     let userInfo = {
    //       user_id:user_id,
    //       is_authed:is_authed,
    //       openid:openid,
    //       nickname:user_info.nickname,
    //       photo:user_info.head_url,
    //       phone:user_info.mobile
    //     }
    //     wx.setStorageSync("userInfo", JSON.stringify(userInfo))
       
    //   }
    // })
    this.isAuth()
  },
  isAuth:function() {
    wx.getSetting({
      success: res => {
        let userInfo = wx.getStorageSync("userInfo")
        
        var is_authed = userInfo ? JSON.parse(userInfo).is_authed :'0'
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
  },
  // getSystemInfo: function () {
  //   let t = this;
  //   wx.getSystemInfo({
  //     success: function (res) {
  //       t.globalData.systemInfo = res;
  //       t.globalData.statusBarHeight = res.statusBarHeight
  //     }
  //   });
  // },
  
  globalData: {
    proType:1,
    isShare: false,
    userInfo: null,
    cityId:null,
    cityName:null
  }
})