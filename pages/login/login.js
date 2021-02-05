//index.js
const util = require('../../utils/util.js')
//const auth = require('../../utils/auth.js')
const api = require('../../utils/api.js')

const app = getApp()

Page({
  data: {
    show:false,
    pop:0,
    tips:"获取验证码",
  },
  close(){
    this.setData({
      pop: 0
    })
  },
  inputMobi:util.debounce(function(e){
    this.setData({
      mobile:e.detail.value
    })
  },300),
  inputCode:util.debounce(function(e){
    this.setData({
      code:e.detail.value
    })
  },300),
  secondDown(num){
    if(num==0){
      clearTimeout(timer)
      this.setData({
        isSend:false,
        tips:"重新获取验证码"
      })
      return
    }else{
      num--
    }
    this.setData({
      second:num
    })
    let timer = setTimeout(()=> {
      this.secondDown(num)
    }, 1000);
  },
  bindPhone(){
    let mobile = this.data.mobile,code=this.data.code

    if(!mobile){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }else if(!util.isMobile(mobile)){
      wx.showToast({
        title: '请填写正确的手机号，如:13012345678',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!code){
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let data = {
      mobile:mobile,
      send_type:"bindMobile",
      code:code
    }
    api.bindPhone(data).then(res=>{
      if(res){
        wx.navigateBack({
          delta: 1
        })
      }
      
    })
  },
  getCode(){
    let mobile = this.data.mobile

    if(!mobile){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }else if(!util.isMobile(mobile)){
      wx.showToast({
        title: '请填写正确的手机号，如:13012345678',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let data = {
      mobile:mobile,
      send_type:"bindMobile"
    }
    api.getCode(data).then(res=>{
      this.secondDown("20")
      this.setData({
        isSend:true
      })
      console.log(res)
      if(!res){
        wx.showToast({
          title: "网络错误",
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: '验证码已发送',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //授权用户信息
  onGotUserInfo: function (e) {
    var detailInfo = e.detail
    var userDetail = detailInfo.userInfo
    console.log(e.detail);
    let timestamp = (new Date()).valueOf()
    var openid = this.data.userInfo.openid
    if (userDetail) { //同意授权
      let data = {
        encryptedData: detailInfo.encryptedData,
        iv: detailInfo.iv,
        rawData:detailInfo.rawData,
        openid: openid,
        uname:"wxxcx",
        timestamp:timestamp
      }
      api.appLogin(data)
      .then(res=>{
        let is_mobile = app.globalData.is_mobile
        console.log(res);
        if(res){
          let user_info = res.user_info
          if(user_info){
            let userInfo = {
              user_id:res.user_id,
              is_authed:res.is_authed,
              openid:res.openid,
              nickname:user_info.nickname,
              photo:user_info.head_url,
              phone:user_info.mobile
            }
            wx.setStorageSync("userInfo", JSON.stringify(userInfo))
          }
        }
        if(is_mobile==0){
          wx.navigateBack({
            delta: 1
          })
        }else{
          this.setData({
            pop:"phone"
          })
        }
        
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
