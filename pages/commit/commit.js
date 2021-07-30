const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app = getApp()
let initScore = [0,0,0,0,0],tags=null,status=[],selectTagArr=[],selectTag = [],delivery_status=0,old_status=''
let num=0,contentTxt="网络繁忙，刷新页面？",confirmTxt="刷新"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score:[0,0,0,0,0],
    star:0,
    pop: 0,
    commentStat:false,
    proList:[]
  },
  close(){
    this.setData({
      pop: 0
    })
  },
  selected(e){
    let idx = e.currentTarget.dataset.idx
    let score = this.data.score

    score.forEach((item,index)=>{
      if(idx<index){
        initScore[index]=0
      }else{
        initScore[index]=1
      }
    })
    selectTagArr=[]
    tags[idx+1].forEach(item=>{
      selectTagArr.push(0)
    })
    this.setData({
      selectTag:[],
      selectTagArr,
      star:idx+1,
      score:initScore,
      curTag:-1,
      curTags:tags[idx+1]
    })
  },
  selectTag(e){
    let idx = e.currentTarget.dataset.idx
    let curTags = this.data.curTags
    selectTag = []
    if(selectTagArr[idx]==0){
      selectTagArr[idx]=1
      
    }else{
      selectTagArr[idx]=0
    }
    console.log(selectTagArr);

    selectTagArr.forEach((item,index)=>{
      if(item==1){
        selectTag.push(curTags[index])
      }
    })
    
    this.setData({
      selectTag:selectTag,
      selectTagArr
    })
  },
  inputTxt(e){
    let val = e.detail.value
    console.log(val);
    this.setData({
      count:val.length,
      comment:val
    })
  },
  setStatus(e){
    let curStatus = e.currentTarget.dataset.status,
    idx = e.currentTarget.dataset.idx

    this.setData({
      ['proList['+idx+'].stat']:curStatus
    })
  },
  inputComment(e){
    let val = e.detail.value
    let idx = e.currentTarget.dataset.idx
    console.log(val);
    this.setData({
      ['proList['+idx+'].comment']:val,
    })
    console.log(this.data.proList);
  },
  addComment(){
    let {orderCode,comment,star,selectTag,proList,commentStat,is_reward}=this.data
    let hasSpecial = null,msgHasSpecial = null
    if(is_reward){
      this.setData({
        pop: 'hongbao'
      })
      return
    }
    let detail=[]
    proList.find(item=>{
      if(item.stat){
        if(item.comment){
          msgHasSpecial = util.checkSpecialStr(item.comment)
        }
        detail.push({meal_id:item.meal_id,meal_name:item.name,meal_content:item.comment || item.default_comment || '',meal_grade:item.stat})
      }
    })
    if(!star || star==0){
      wx.showToast({
        icon:"none",
        title:"暂未评分"
      })
      return
    }
    if(selectTag.length==0){
      wx.showToast({
        icon:"none",
        title:"请为本次购物选择标签"
      })
      return
    }
    if(!comment){
      wx.showToast({
        icon:"none",
        title:"请填写订单评价"
      })
      return
    }
    if(proList.length!=detail.length){
      wx.showToast({
        icon:"none",
        title:"请填写商品评价"
      })
      return
    }

    hasSpecial = util.checkSpecialStr(comment)
    if(hasSpecial || msgHasSpecial){
      wx.showToast({
        icon:'none',
        title:"不能提交特殊字符"
      })
      return
    }
    wx.showLoading({mask:true,title:"提交中"})
    detail = JSON.stringify(detail)
    let data = {
      order_code:orderCode,
      comment:comment,
      detail:detail,
      star:star,
      tags:selectTag
    }
    api.setComment(data).then(res=>{
      wx.hideLoading()
      console.log(res);
      if(!res){
        return
      }
      if(res==app.globalData.bindPhoneStat){
        this.setData({
          popShow:true
        })
        return
      }
      api.getComment(data).then(res=>{
        console.log(res);
        wx.hideLoading()
        let commentStat = res.hasComment,is_reward = res.is_reward
        let detail=res.orderReader.detail || []
        if(commentStat){
          let score = this.data.score,star = parseInt(res.defaultStar)-1
          let commentDetail = res.commentDetailReader
          score.forEach((item,index)=>{
            if(star<index){
              initScore[index]=0
            }else{
              initScore[index]=1
            }
          })
          this.setData({
            is_reward:is_reward,
            commentStat:commentStat,
            commentDetail:commentDetail,
            commentContent:res.commentContent,
            curTags:res.commentTags,
            proList:detail,
            score:initScore,
            price:res.reward_price,
            pop: 'hongbao'
          })
        }
      })
      // this.setData({
      //   commentStat:true,
      //   price:res.price,
      //   pop: 'hongbao'
      // })
      
    })
  },
  checkHongbao(){
    this.setData({
      pop: 'hongbao'
    })
  },
  bindPhoneSucess(){
    this.addComment()
  },
  onPageScroll: util.throttle(function (e) {
    //debounce()
    var scrollTop = e.scrollTop

    if (scrollTop > 0) {
      this.setData({
        isFold: true
      })
    } else {
      this.setData({
        isFold: false
      })
    }
  },100),
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    console.log(num);
    
    let userInfo = wx.getStorageSync('userInfo')
    let addressInfo = wx.getStorageSync("addressInfo")
    let loginInfo = null
    if(!userInfo || !addressInfo){
      wx.showLoading({mask:true,title:"登录中..."})
      loginInfo = await app.wxLogin()
      await app.getAddress(loginInfo)
    }
    if(num==2){
      contentTxt="模块加载失败，重启小程序？"
      confirmTxt="重启"
    }
    wx.showLoading({mask:true,title:"加载评论模块"})
    let orderCode = options.orderCode
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    let data = {
      order_code:orderCode
    }
    api.getComment(data).then(res=>{
      console.log(res);
      wx.hideLoading()
      if(!res){
        wx.showModal({
          content:contentTxt,
          showCancel: false,
          confirmText: confirmTxt,
          success: res=> {
            if (res.confirm) {
              if(num==3){
                wx.switchTab({
                  url:"/pages/index/index"
                })
                return
              }else{
                this.onLoad(options)
              }
              num+=1
            }
          }
        });

        return
      }
      let commentStat = res.hasComment,is_reward=res.is_reward
      let detail=res.orderReader.detail || []

      if(commentStat){

        let score = this.data.score,star = parseInt(res.defaultStar)-1
        let commentDetail = res.commentDetailReader
        score.forEach((item,index)=>{
          if(star<index){
            initScore[index]=0
          }else{
            initScore[index]=1
          }
        })
        this.setData({
          is_reward:is_reward,
          commentStat:commentStat,
          commentDetail:commentDetail,
          commentContent:res.commentContent,
          curTags:res.commentTags,
          proList:detail,
          score:initScore,
          price:res.reward_price
        })
        return
      }

      tags = res.tags || {
        1: ["口味差", "分量不足", "包装不好", "环境差", "配送慢"],
        2: ["口味一般", "分量一般", "包装普通", "环境一般", "配送一般"],
        3: ["口味一般", "分量一般", "包装普通", "环境一般", "配送一般"],
        4: ["味道赞", "分量足", "包装精美", "环境好", "配送快"],
        5: ["味道赞", "分量足", "包装精美", "环境好", "配送快"]
      }
      tags['1'].forEach(item=>{
        selectTagArr.push(0)
      })
      delivery_status=res.orderReader.delivery_status
      old_status=res.orderReader.old_status
      this.setData({
        is_reward:is_reward,
        commentStat:commentStat,
        curTags:tags['1'],
        delivery_time:res.orderReader.delivery_time,
        proList:detail
      })
      
    })

    this.setData({
      orderCode,
      btmHolder:btmHolder||0
    })
    

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
    
    if(this.data.isShare){
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 500);
    }
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
  onShareAppMessage: function (res) {
    if(res.from==='button'){
      this.setData({
        isShare:true
      })
      return {
        title:'恭喜您获得红包',
        path:"/pages/share/share?orderCode="+this.data.orderCode,
        imageUrl:"https://api.withwheat.com/img/hongbao.jpg"
      }
    }
    if(res.from==='menu'){
      return {
        title:'原麦山丘',
        path:"/pages/index/index",
        imageUrl:"https://api.withwheat.com/img/hongbao2.jpg",
      }
    }
    
  }
})