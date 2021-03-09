const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
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
    },
  },
  data: {
    tips:"获取验证码"
  },
  attached: function() {
    
  },
  methods: {
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
        }
      })
    },
    close() {
      this.triggerEvent('close')
      this.setData({
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