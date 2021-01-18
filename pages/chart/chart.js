// pages/user/user.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const app = getApp()
let timer=null,proNum=0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curProId:-1,
    userInfo:null,
    count:0,
    user:null,
    allBread:false,
    allCake:false,
    totalPrice:0,
    cakeEmpty:true,
    breadEmpty:true
  },
  getSelectedPro(){
    let {type,cakeLi,breadLi}=this.data
    let selectedBread=null,selectedCake=null,totalPrice=0
    function getSelected(type) {
      return pro => pro.is_selected == type;
    }
    switch (type) {
      case "1":
        selectedBread = breadLi.filter(getSelected("1"))
        if(selectedBread.length>0){
          selectedBread.forEach(item=>{
            totalPrice += parseFloat(util.floatObj().multiply(item.sku_number,item.sku_price,2))
          })
          this.setData({
            breadEmpty:false
          })
        }else{
          this.setData({
            breadEmpty:true
          })
        }
        
        break;
      case "2":
        selectedCake = cakeLi.filter(getSelected("1"))
        if(selectedCake.length>0){
          selectedCake.forEach(item=>{
            totalPrice += parseFloat(util.floatObj().multiply(item.sku_number,item.sku_price,2))
          })
          this.setData({
            cakeEmpty:false
          })
        }else{
          this.setData({
            cakeEmpty:true
          })
        }
        
        break;
      default:
        break;
    }
    totalPrice = util.formatePrice(totalPrice)
    console.log(totalPrice)
    this.setData({
      totalPrice:totalPrice
    })
  },
  getOrder(){
    let {cakeEmpty,breadEmpty,type,cakeLi,breadLi}=this.data

    let isBread = breadLi.some(item=>{
      return item.is_selected=="1"
    })
    let isCake = cakeLi.some(item=>{
      return item.is_selected=="1"
    })
    if(isBread && isCake){
      wx.showToast({
        icon:"none",
        title:"蛋糕与面包需分开支付，先支付面包"
      })
      return false
    }

    let data = {
      type : type
    }
    if(cakeEmpty&&breadEmpty){
      wx.showToast({
        icon:"none",
        title:"购物车为空"
      })
      return false
    }
    api.commitChart(data).then(res=>{
      console.log(res)
      if(res){
        wx.navigateTo({
          url:"/pages/chart/payOrder/payOrder?type="+type
        })
      }else{
        wx.showToast({
          icon:"none",
          title:"结算失败，刷新页面"
        })
      }
    })
    
  },
  //改变商品数量
  minusNum(e){
    let skuid = e.currentTarget.dataset.skuid,index=e.currentTarget.dataset.idx,type=e.currentTarget.dataset.type
    this.addChart("minus",skuid,index,type)
  },
  plusNum(e){
    let skuid = e.currentTarget.dataset.skuid,index=e.currentTarget.dataset.idx,type=e.currentTarget.dataset.type
    this.addChart("plus",skuid,index,type)
  },
  //删除商品
  delete(){

  },
  addChart(option,skuid,index,type){
    let addressInfo = wx.getStorageSync("addressInfo")
    let {cakeLi,breadLi,curProId}=this.data
    let city_id = JSON.parse(addressInfo).city_id
    let currPro,currNum
    if(type=="1"){
      currPro = breadLi[index]
    }
    if(type=="2"){
      currPro = cakeLi[index]
    }
    this.setData({
      currPro:currPro
    })
    currNum = parseInt(currPro.sku_number)
    if(skuid!=curProId){
      proNum=0
      this.setData({
        curProId:skuid
      })
    }
    if(option=="plus"){
      proNum++
    }
    if(option=="minus"){
      
        proNum--
      
    }

    if (timer){
      clearTimeout(timer);
    }

    timer = setTimeout(()=>{
      
      console.log(this.data.curProId);
      let data = {
        city_id: city_id,
        type:type,
        tab_id:skuid,
        number:proNum
      }
      proNum=0
      console.log(data);
      api.setChart(data).then(res => {
        console.log(res);
        if(!res){
          wx.showToast({
            icon:"none",
            title:'加入购物车失败'
          })
          return
        }
        if(res.status=="2001"){
          wx.showToast({
            icon:"none",
            title:"商品不存在或已下架"
          })
        }else{
          this.getChartData()
        }
        
      })
      
    },300)
  },
  getChartData(){
    api.getChartData().then(res => {
      console.log(res);
      let type="1",breadSelectedNum=0,cakeSelectedNum=0,noallBread=true,noallCake=true
      if(res){
        let breadLi = res.bread.detail,cakeLi=res.cake.detail
        if(breadLi.length>0){
          breadLi.forEach(item=>{
            if(item.is_selected=="1"){
              breadSelectedNum++
            }
          })
        }
        if(cakeLi.length>0){
          cakeLi.forEach(item=>{
            if(item.is_selected=="1"){
              cakeSelectedNum++
            }
          })
        }

        type = breadSelectedNum>0 ? "1" :"2"
        noallBread = breadSelectedNum==res.bread.length ? false : true
        noallCake = cakeSelectedNum==res.cake.length ? false : true

        this.setData({
          noallBread:noallBread,
          noallCake:noallCake,
          type:type,
          breadLi:breadLi,
          cakeLi:cakeLi
        })
        this.getSelectedPro()
      }
    })
  },
  //选中/撤销选中
  selectPro(cartId,action){
    let data = {
      cart_id:cartId,
      action:action
    }
    api.selectPro(data).then(res=>{
        console.log(res);
        if(!res){
          wx.showToast({
            icon:"none",
            title:"撤销选中失败"
          })
        }else{

          let noallBread = res.bread.detail.some(item=>{
            return item.is_selected=="0"
          })
          let noallCake = res.cake.detail.some(item=>{
            return item.is_selected=="0"
          })
          this.setData({
            noallBread:noallBread,
            noallCake:noallCake,
            breadLi:res.bread.detail,
            cakeLi:res.cake.detail
          })
          this.getSelectedPro()
        }
        
    })
  },
  //全选
  selectAll(e){
    let type= e.currentTarget.dataset.type
    let {noallBread,noallCake}=this.data
    let data = {
      type:type
    }

    if(type=="1"){
      if(noallBread){
        this.setData({
          noallBread:false,
          noallCake:true
        })
        data.action="1"
      }else{
        this.setData({
          noallBread:true
        })
        data.action="0"
      }
      // totalPrice =util.accMul(breadLi[index].sku_number,breadLi[index].sku_price,2)
    }
    if(type=="2"){
      if(noallCake){
        this.setData({
          noallBread:true,
          noallCake:false
        })
        data.action="1"
      }else{
        this.setData({
          noallCake:true
        })
        data.action="0"
      }
    }

    api.selectAllPro(data).then(res=>{
        console.log(res);
        if(!res){
          wx.showToast({
            icon:"none",
            title:"撤销选中失败"
          })
        }else{
          this.setData({
            type:type,
            breadLi:res.bread.detail,
            cakeLi:res.cake.detail
          })

          this.getSelectedPro()
        }
        
    })
  },
  select(e){
    let id = e.currentTarget.dataset.id,type= e.currentTarget.dataset.type,index=e.currentTarget.dataset.idx
    let {cakeLi,breadLi}=this.data
    this.setData({
      type:type
    })

    if(type=="1"){
      if(breadLi[index].is_selected=="0"){
        this.selectPro(id,"1")
      }else{
        this.selectPro(id,"0")
      }
    }
    if(type=="2"){
      if(cakeLi[index].is_selected=="0"){
        this.selectPro(id,"1")
      }else{
        this.selectPro(id,"0")
      }
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = app.globalSystemInfo;
    let fixedTop = sysInfo.navBarHeight;
    let safeArea = sysInfo.safeArea;
    if(sysInfo.screenHeight > safeArea.bottom){
      let btmHolder = sysInfo.screenHeight - safeArea.bottom
      this.setData({
        btmHolder:btmHolder
      })
    }
    this.setData({
      fixedTop
    })

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getUserCenter(){
    api.getUserCenter().then(res=>{
      console.log(res);
      this.setData({
        user:res.user
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //自定义tabbar选中
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    let sysInfo = app.globalSystemInfo;
    let userInfo = wx.getStorageSync("userInfo")
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      userInfo
    })
    this.getUserCenter();
    this.getChartData()
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
    this.onShow()
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