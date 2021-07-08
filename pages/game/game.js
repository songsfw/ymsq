const api = require("../../utils/api");

//index.js
const app = getApp()

var timer = null,timer2=null;
let title="",text="",img="",status=0
Page({
  data: {
    gameResult:0
  },
  
  onShow: function () {
    
  },
  toPro(e) {
    let url = e.currentTarget.dataset.url,type = e.currentTarget.dataset.type;
    if(type==1){
      wx.navigateTo({
        url: "/pages/proInfo/proInfo?proId=" + url
      })
    }else{
      wx.navigateTo({
        url: "/pages/cakeInfo/cakeInfo?proId=" + url
      })
    }
  },
  toIndex(){
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  close(){
    this.setData({
      popShow:false
    })
  },
  start:function(){
    clearTimeout(timer)
    clearTimeout(timer2)
    let popConfig =null
    let {start,isGrabbing}=this.data
    let data = {
      lottery_id:this.data.lottery_id
    }
    if(start||isGrabbing){
      console.log('抓取中');
      return
    }
    api.startGame(data).then(res=>{
      console.log(res);
      if(res.status && res.status!=0){
        popConfig = {
          title:'抽不了啦',
          text:res.message,
          status:2
        }
        this.setData({
          popShow:true,
          popConfig
        })
       
      }else{
        this.setData({
          start:true,
          isGrabbing:false,
          isGrabbingEnd:false
        })
      }
      
    })
    
  },
  initGame(){
    this.setData({
      gameResult:0,
      start:false,
      isGrabbing:false,
      isGrabbingEnd:false,
      popShow:false
    })
  },
  getGift(){
    let data = {
      lottery_id:this.data.lottery_id
    }
    let popConfig =null
    
      api.getGift(data).then(res=>{
        console.log(res);
        let lotteryInfo = res['lottery-info']
        if(lotteryInfo.type=="locking"){
          return
        }
        let gameInfo = res.user
        let bazinga = lotteryInfo.id
        if(bazinga==0){
          //谢谢惠顾
          title='很遗憾'
          text="哎呀呀，就差那么一点点...\n 不要灰心还有更大的奖品等着你哦～"
          status=0
        }else{
          title='恭喜您'
          text="中奖啦！\n运气爆棚，获得了一下奖品"
          img=lotteryInfo.image
          status=1
        }

        popConfig = {
          title:title,
          text:text,
          img:img,
          status:status
        }

        timer = setTimeout(() => {
          this.setData({
            popConfig,
            popShow:true
          })
        }, 800);
        this.setData({
          lotteryInfo:lotteryInfo,
          gameResult:lotteryInfo.type,
          gameInfo:res.user,
          isGrabbingEnd:true
        })
      })
    
  },
  grab: function () {
    let {start,isGrabbing}=this.data
    if(isGrabbing){
      console.log('抓取中');
      return
    }
    if(!start){
      wx.showToast({
        icon:"none",
        title:"请点击开始"
      })
      return
    }
    timer2 = setTimeout(() => {
      this.getGift()
    },800)
    this.setData({
      isGrabbing:true,
    })
  },
  async onLoad (options) {
    let userInfo = wx.getStorageSync('userInfo')
    let addressInfo = wx.getStorageSync("addressInfo")
    let loginInfo = null
    if(!userInfo || !addressInfo){
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
    }

    let lottery_id = options.lotteryid || 4;

    let data = {
      lottery_id:lottery_id
    }
    wx.showLoading({mask:true,title:"加载游戏模块"})
    api.getGameInfo(data).then(res=>{
      wx.hideLoading()
      console.log(res);
      let info = res['lottery-info']
      this.setData({
        rule:info.rules,
        paytype:info.condition_payment_type,
        detail:info.detail_arr,
        payment:info.condition_payment_val,
        proList:res.meal,
        gameInfo:res.user
      })
    })
    
    this.setData({
      lottery_id:lottery_id
    })
  },
  onUnload: function (e) {
    
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  // }
})