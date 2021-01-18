const api = require('../../../utils/api.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,
    noMoreData: false,
    list:null,
    selected:false,
    loaded:false
  },
  balanceList(tag_id){
    
    let pageNum = this.data.pageNum,loaded=this.data.loaded
    let data = {
      page:pageNum,
      limit:20,
      tag_id:tag_id||'0'
    }
    api.balanceList(data).then(res=>{
      console.log(res);
      if(!res){
        this.setData({
          noMoreData: true,
          list:[]
        })
        return false
      }
      let list = res.list || []
      let noMoreData = list.length < 20
      if(!loaded){
        this.setData({
          type:res.tags,
          loaded:true
        })
      }
      this.setData({
        
        ['list['+(data.page-1)+']']:list,
        noMoreData: noMoreData
      })
      console.log(this.data.list);
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  selectItem(e){
    let id = e.currentTarget.dataset.id,
    index = e.currentTarget.dataset.index,
    tags = this.data.type
    tags.forEach(item=>{
      item.selected = false
    })
    tags[index].selected = true
    this.setData({
      pageNum:1,
      list:null,
      noMoreData:false,
      type:tags,
      selected:false
    })
    this.balanceList(id)
  },
  select(){
    let selected = this.data.selected
    if(selected){
      this.setData({
        selected:false
      })
    }else{
      this.setData({
        selected:true
      })
    }
  },
  onReachBottom(){
    if(this.data.noMoreData){
      return false
    }
    this.getMoreData()
  },
  getMoreData() {
    let currentTab = this.data.currentTab
    let pageNum = this.data.pageNum + 1
    this.setData({
      pageNum: pageNum
    })

    this.balanceList()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.balanceList()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})