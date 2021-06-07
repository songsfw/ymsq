const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')
Component({
  options:{
    styleIsolation:"apply-shared",
    multipleSlots: true
  },
  properties: {
    
    maskTouch: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    },
    popShow:{
      type: Boolean,
      value: false
    }
  },
  data: {
    tips:"获取验证码",
    step:1
  },
  lifetimes: {
    attached: function() {
      // this.setData({
      //   step:1
      // })
    }
  },
  methods: {
    async onGotUserPhone (e) {
      console.log(e);
      let loginInfo = await auth.getLoginInfo()
      console.log(loginInfo);

      let detail = e.detail
      let userInfo = wx.getStorageSync("userInfo")
        console.log(userInfo);
      userInfo = userInfo && JSON.parse(userInfo)
      if(detail.errMsg=="getPhoneNumber:ok"){
        let data = {
          encryptedData:detail.encryptedData,
          iv:detail.iv
        }
        api.wxPhone(data).then(res=>{
          
          console.log(res);
          if(!res){
            return
          }
          let mobile = res.mobile
          userInfo.phone=mobile
          userInfo.is_mobile=1
          this.setData({
            popShow:false
          })
          wx.setStorageSync("userInfo", JSON.stringify(userInfo))
          this.triggerEvent('phoneSucess',mobile)
        })
      }else{
        wx.showToast({
          icon:"none",
          title:"绑定失败"
        })
      }
    },
    bindUserPhone(){
      this.setData({
        step:2
      })
    },
    inputMobi:function(e){
      this.setData({
        mobile:e.detail.value
      })
    },
    inputCode:function(e){
      this.setData({
        code:e.detail.value
      })
    },
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
      let userInfo = wx.getStorageSync("userInfo")
        console.log(userInfo);
      userInfo = userInfo && JSON.parse(userInfo)
      
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
        console.log(res);
        if(res){
          userInfo.phone=mobile
          userInfo.is_mobile=1
          this.setData({
            popShow:false
          })
          wx.setStorageSync("userInfo", JSON.stringify(userInfo))
          this.triggerEvent('phoneSucess')
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
          this.setData({
            focus:true
          })
        }
      })
    },
    close() {
      this.triggerEvent('close')
      this.setData({
        step:1,
        popShow:false
      })
    },
    touchMask() {
      if(this.data.maskTouch){
        this.close()
      }
    }
  }
})