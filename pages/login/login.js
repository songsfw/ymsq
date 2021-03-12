//index.js
const util = require('../../utils/util.js')
//const auth = require('../../utils/auth.js')
const api = require('../../utils/api.js')

const app = getApp()

Page({
  data: {
    show:false,
    pics:[
      '/image/cake1.jpg',
      '/image/cake2.jpg'
    ],
    setTime:'',
    num:0,
    showpic:null,
    hidepic:null
  },
  close(){
    this.setData({
      pop: 0
    })
  },
  //授权用户信息
  onGotUserInfo: function (e) {
    var detailInfo = e.detail
    var userDetail = detailInfo.userInfo
    console.log(e.detail);
    let timestamp = (new Date()).valueOf()
    var {openid,is_mobile} = this.data.userInfo
    if (userDetail) { //同意授权
      let data = {
        encryptedData: detailInfo.encryptedData,
        iv: detailInfo.iv,
        //rawData:detailInfo.rawData,
        openid: openid,
        uname:"wxxcx",
        timestamp:timestamp
      }
      api.appLogin(data)
      .then(res=>{
        console.log(is_mobile);
        console.log(res);
        if(!res){
          return
        }
        let result = res.data.result
        let user_info = result.user_info
        if(user_info){
          this.setData({
            'userInfo.nickname':user_info.nickname,
            'userInfo.photo':user_info.head_url,
            'userInfo.is_authed':user_info.is_authed
          })
          wx.setStorageSync("userInfo", JSON.stringify(this.data.userInfo))
        }
        
        //if(is_mobile==1){
          wx.navigateBack({
            delta: 1
          })
        //}else{
        //  this.setData({
        //    popShow:true
        //  })
        //}
        
      })
    }
  },
  bindPhoneSucess(){
    wx.navigateBack({
      delta: 1
    })
  },
  onLoad () {
    let userInfo = wx.getStorageSync("userInfo")
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    userInfo = userInfo && JSON.parse(userInfo)
    this.setData({
      userInfo:userInfo,
      show:true,
      fixedTop:fixedTop
    })

    if(this.data.pics.length>1){
      var _this=this;
      var num=_this.data.num;
      var animation= wx.createAnimation({}) //创建一个动画实例
      _this.setData({      //创建一个计时器
          setTime:setInterval(function(){
            _this.setData({
              num:num++
            })
            if(num>1){
              num=0;
            }           //淡入
            animation.opacity(1).step({
              duration:1000
            }) //描述动画
            _this.setData({
              showpic:animation.export()
            }) //输出动画
          //淡出
            animation.opacity(0).step({duration:1000})
            _this.setData({hidepic:animation.export()})
        },3000)
      })
    }
    
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
