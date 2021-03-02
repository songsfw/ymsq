const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    poptitle:"请输入设置的余额密码",
    status:0,
    tips:"获取验证码",
    selected:0,
    step:1,
    list: [],
    confirmText:"开启",
    unuse:true,
    type:null
  },
  pwdInput(e){
    var val = e.detail.value
    if(val.length==6){
      this.setData({
        pwdVal:val,
        unuse:false
      })
    }else{
      this.setData({
        pwdVal:val,
        unuse:true
      })
    }
  },
  //旧密码
  oldPwdInput:util.debounce(function(e){
    let val = e.detail.value
    let newPwd = this.data.newPwd || ''
    this.setData({
      oldPwd:val
    })
    if(val.length==6 && newPwd.length==6){
      this.setData({
        unuse:false
      })
    }
    if(val.length!=6 || newPwd.length!=6){
      this.setData({
        unuse:true
      })
    }
  },500),
  //新密码
  newPwdInput:util.debounce(function(e){
    let val = e.detail.value
    let oldPwd = this.data.oldPwd || ''
    this.setData({
      newPwd:val
    })
    if(val.length==6 && oldPwd.length==6){
      this.setData({
        unuse:false
      })
    }
    if(val.length!=6 || oldPwd.length!=6){
      this.setData({
        unuse:true
      })
    }
  },500),
  //初始密码
  initPwdInput:util.debounce(function(e){
    let val = e.detail.value
    let confirmPwd = this.data.confirmPwd || ''
    this.setData({
      initPwd:val
    })
    if(val.length==6 && confirmPwd.length==6){
      this.setData({
        unuse:false
      })
    }
    if(val.length!=6 || confirmPwd.length!=6){
      this.setData({
        unuse:true
      })
    }
  },500),
  //确认密码
  confirmInput:util.debounce(function(e){
    let val = e.detail.value
    let initPwd = this.data.initPwd || ''
    this.setData({
      confirmPwd:val
    })
    if(val.length==6 && initPwd.length==6){
      this.setData({
        unuse:false
      })
    }
    if(val.length!=6 || initPwd.length!=6){
      this.setData({
        unuse:true
      })
    }
  },500),
  verifyPwd(val){
    let data = {
      password:val
    }
    api.verifyPwd(data).then(res=>{
      console.log(res);
      if(res){
        this.setData({
          poptitle:"设置新的余额密码",
          step:2
        })
      }
    })
  },
  verifyInput(e){
    var val = e.detail.value
    if(val.length==6){
      this.setData({
        verify:val,
        unuse:false
      })
    }else{
      this.setData({
        verify:val,
        unuse:true
      })
    }
  },
  forgetPwd(){
    this.setData({
      poptitle:"输入验证码",
      step:3,
      confirmText:"下一步"
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
  getCode(){
    let mobile = this.data.userInfo.phone
    let data = {
      mobile:mobile,
      send_type:"password"
    }
    api.getCode(data).then(res=>{
      this.secondDown("20")
      this.setData({
        isSend:true
      })
      console.log(res)
      if(!res){
        wx.showToast({
          title: "验证码发送失败",
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: '验证码发送成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  confirm(){
    let step = this.data.step
    
    switch (step) {
      case 1:
        let val = this.data.pwdVal
        if(!val || val.length<6){
          wx.showToast({
            title: '请输入6位数字密码',
            icon: 'none',
            duration: 2000
          })
          return 
        }
        if(this.data.type==0){
          this.changeFreePay(val)
        }
        if(this.data.type==1){
          this.verifyPwd(val)
        }
        
        break;
      case 2:
        let {newPwd,oldPwd,confirmPwd,initPwd,pwd_set}=this.data
        if(pwd_set==1){
          if(newPwd.length<6 || oldPwd.length<6){
            wx.showToast({
              title: '请输入6位数字密码',
              icon: 'none',
              duration: 2000
            })
            return 
          }
          let data = {
            old_password:oldPwd,
            new_password:newPwd
          }
          api.setNewPwd(data).then(res=>{
            console.log(res)
            if(res.pwd_set==1){
              wx.showToast({
                title: '新密码设置成功',
                icon: 'none',
                duration: 2000
              })
              this.setData({
                popShow:false
              })
            }
          })
        }else{
          if(confirmPwd.length<6 || initPwd.length<6){
            wx.showToast({
              title: '请输入6位数字密码',
              icon: 'none',
              duration: 2000
            })
            return 
          }
          let data = {
            password:initPwd,
            re_password:confirmPwd
          }
          api.setPwd(data).then(res=>{
            console.log(res)
            //if(res.pwd_set==1){
              wx.showToast({
                title: '密码设置成功',
                icon: 'none',
                duration: 2000
              })
              this.setData({
                popShow:false
              })
            //}
          })
        }
        
        break
      case 3:
        let verify =this.data.verify,phone=this.data.userInfo.phone

        if(verify.length<6){
          wx.showToast({
            title: '请输入6位验证码',
            icon: 'none',
            duration: 2000
          })
          return 
        }else{
          let data = {
            code:verify,
            mobile:phone,
            send_type:"password"
          }
          api.verifyCode(data).then(res=>{
            console.log(res)
            this.setData({
              poptitle:"输入密码",
              step:2
            })
          })
        }

        
        // if(newPwd!=oldPwd){
        //   wx.showToast({
        //     title: '',
        //     icon: 'none',
        //     duration: 2000
        //   })
        //   return 
        // }
        break 
      default:
        break;
    }
    
  },
  close(e){
    let step = this.data.step,
    free_secret = this.data.free_secret
    console.log(free_secret);
    this.setData({ 
      unuse:true
    })
    switch (step) {
      case 1:
        if(free_secret==0){
          this.setData({
            free_secret:0
          })
        }
        
        
        break;
    
      default:
        break;
    }
    
  },
  changeFreePay(val){
    console.log(this.data.free_secret);
    let action = this.data.free_secret==0 ? 1 : 2
    
    console.log(action)
    let data = {
      action
    }
    if(val){
      data.password=val
    }
    api.changeFreePay(data).then(res=>{
      console.log(res);
      
      if(res.free_secret==1){
        wx.showToast({
          title: "小额免密开启成功",
          icon: 'none',
          duration: 2000
        })
        this.setData({
          popShow:false,
          free_secret:1
        })
      }else if(res.free_secret==0){
        wx.showToast({
          title: "已关闭免密支付",
          icon: 'none',
          duration: 2000
        })
        this.setData({
          free_secret:0
        })
      }
    })
  },
  freePayInfo(){
    api.freePayInfo().then(res=>{
      console.log(res);
      console.log(res.free_secret)
      let list = res.free_amount_list,
          free_amount = res.free_amount
      
      let index = list.findIndex(item=>{
        return item == free_amount
      })
      if(res){
        this.setData({
          index:index,
          free_amount:free_amount,
          free_secret:res.free_secret,
          list:list,
          pwd_set:res.pwd_set
        })
      }
    })
  },
  switch(e){
    console.log(e.detail.value)
    if(this.data.free_secret==0){
      this.setData({
        pwdVal:'',
        unuse:true,
        type:0,//开启免密支付中
        //free_secret:1,
        popShow:true,
        poptitle:"请输入设置的余额密码",
        step:1
      })
      
    }else{
      wx.showToast({
        title: "已关闭免密支付",
        icon: 'none',
        duration: 2000
      })

      this.changeFreePay()
    }
  },
  changePwd(){
    this.setData({
      pwdVal:'',
      unuse:true,
      type:1,//修改或设置密码中
      popShow:true,
      poptitle:"请设置余额密码",
      step:2,
      confirmText:"设置",
    })
  },
  editPwd(){
    this.setData({
      oldPwd:'',
      newPwd:'',
      unuse:true,
      type:1,//修改或设置密码中
      popShow:true,
      poptitle:"请输入设置的余额密码",
      step:2,
      confirmText:"修改",
    })
  },
  // setPwd(e){
  //   this.setData({
  //     popShow:true,
  //     poptitle:"设置余额密码",
  //     step:2,
  //     confirmText:"下一步",
  //   })
  // },
  bindSelect(e){
    let free_secret = this.data.free_secret
    if(free_secret==0){
      wx.showToast({
        title: "请先开启免密支付",
        icon: 'none',
        duration: 2000
      })
      return false
    }
    console.log(e.detail)
    let index = e.detail.value,
    list = this.data.list
    this.setData({
      selected:1,
      index:index,
      free_amount:list[index]
    })
    api.setAmount({amount:index}).then(res=>{
      console.log(res);

    })
  },
  toAdddata(){
    wx.navigateTo({
      url:"/pages/user/adddata/adddata"
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let userInfo = wx.getStorageSync('userInfo')
    this.freePayInfo()
    this.setData({
      userInfo:JSON.parse(userInfo)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})