//index.js
const util = require('../../utils/util.js')
//const auth = require('../../utils/auth.js')
const api = require('../../utils/api.js')

const app = getApp()

Page({
  data: {
    show:false,
    pics:[
      'https://api.withwheat.com/img/cake1.jpg',
      'https://api.withwheat.com/img/cake2.jpg'
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
  onGotUserPhone: function (e) {
    console.log(e.detail);
    
  },
  onGotUserProFile(){
    wx.getUserProfile({
      desc: '为了您更便捷购物，请先微信授权',
      success:res=>{
        let timestamp = (new Date()).valueOf()
        var {openid} = this.data
        console.log(res);
        let data = {
          encryptedData: res.encryptedData,
          iv: res.iv,
          openid: openid,
          uname:"wxxcx",
          timestamp:timestamp
        }
        api.appLogin(data)
        .then(res=>{
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
          
            wx.navigateBack({
              delta: 1
            })

          
        })
      },
      fail:err=>{
        console.log(err);
      }
    })
  },
  //授权用户信息
  onGotUserInfo: function (e) {
    
    var detailInfo = e.detail
    var userDetail = detailInfo.userInfo
    console.log(e.detail);
    let timestamp = (new Date()).valueOf()
    var {openid} = this.data
    if (userDetail) { //同意授权
      let data = {
        encryptedData: detailInfo.encryptedData,
        iv: detailInfo.iv,
        openid: openid,
        uname:"wxxcx",
        timestamp:timestamp
      }
      api.appLogin(data)
      .then(res=>{
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
  async onLoad () {
    let userInfo = wx.getStorageSync('userInfo')
    let loginInfo = null
    if(!userInfo){
      loginInfo = await app.wxLogin()
      console.log(loginInfo);
    }

    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;

    // var pages = getCurrentPages();
    // console.log(pages);
    // var currPage = pages[pages.length - 2];
    // var path = currPage.route
    // var options = currPage.options
    // let temp = ''
    // Object.keys(options).forEach(key=>{
    //   temp+=`${key}=${options[key]}&`
    // })
    // console.log(temp);
    // console.log(currPage);

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    console.log(loginInfo);
    userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    console.log(userInfo);
    this.setData({
      userInfo:userInfo,
      openid:loginInfo.openid,
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

  },
  onShow() {

  }
})
