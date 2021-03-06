const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
let initScore = [0,0,0,0,0],tags=null,status=[],selectTagArr=[],selectTag = [],delivery_status=0,old_status=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score:[0,0,0,0,0],
    star:0,
    pop: 0,
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
  inputTxt:util.debounce(function(e){
    let val = e.detail.value
    console.log(val);
    this.setData({
      count:val.length,
      comment:val
    })
  },500),
  setStatus(e){
    let curStatus = e.currentTarget.dataset.status,
    idx = e.currentTarget.dataset.idx

    this.setData({
      ['proList['+idx+'].stat']:curStatus
    })
  },
  addComment(){
    let {orderCode,comment,star,selectTag,proList}=this.data
    let detail=[]
    proList.find(item=>{
      if(item.stat){
        detail.push({meal_id:item.id,meal_name:item.name,meal_content:"",meal_grade:item.stat})
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
        title:"暂未选择标签"
      })
      return
    }
    if(!comment){
      wx.showToast({
        icon:"none",
        title:"暂未填写评价"
      })
      return
    }
    detail = JSON.stringify(detail)
    let data = {
      order_code:orderCode,
      comment:comment,
      detail:detail,
      star:star,
      tags:selectTag
    }
    api.setComment(data).then(res=>{
      console.log(res);
      if(res){
        if(old_status=='COMPLETE'&&delivery_status=='3'){
          this.setData({
            price:res.price,
            pop: 'hongbao'
          })
        }else{
          wx.showToast({
            icon:"none",
            title:"评价成功"
          })
        }
        
        
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderCode = options.orderCode

    let btmHolder = wx.getStorageSync('btmHolder')
    
    let data = {
      order_code:orderCode
    }
    api.getComment(data).then(res=>{
      console.log(res);
      let detail=res.orderReader.detail
      detail.forEach(item=>{
        item.stat=1
      })
      console.log(detail);
      tags = res.tags

      tags['1'].forEach(item=>{
        selectTagArr.push(0)
      })
      console.log(selectTagArr);
      delivery_status=res.orderReader.delivery_status
      old_status=res.orderReader.old_status
      this.setData({
        curTags:tags['1'],
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

      return {
        title:'恭喜您获得红包',
        path:"/pages/share/share?orderCode="+this.data.orderCode
      }
    }
    if(res.from==='menu'){
      wx.showToast({
        icon:"none",
        title:"点击按钮分享"
      })
      return
    }
    
  }
})