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
    btmHolder:0,
    fittings:false,
    pop: 0,
    skuNum:0
  },
  showPop(e) {
    let pop = e.currentTarget.dataset.pop
    this.setData({
      pop: pop
    })
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  getSelectedPro(){
    let {type,cakeLi,breadLi}=this.data
    let selectedBread=null,selectedCake=null,totalPrice=0
    let fittings = type==1 ? false : true
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
        }
        break;
      case "2":
        selectedCake = cakeLi.filter(getSelected("1"))
        if(selectedCake.length>0){
          selectedCake.forEach(item=>{
            totalPrice += parseFloat(util.floatObj().multiply(item.sku_number,item.sku_price,2))
          })
        }
        break;
      default:
        break;
    }
    totalPrice = util.formatePrice(totalPrice)
    console.log(totalPrice)
    
    this.setData({
      fittings:fittings,
      totalPrice:totalPrice
    })
  },
  getOrder(){
    let {totalPrice,type,cakeLi,breadLi}=this.data

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
    if(parseFloat(totalPrice)==0){
      wx.showToast({
        icon:"none",
        title:"购物车为空"
      })
      return false
    }
    api.commitChart(data).then(res=>{
      console.log(res)
      if(res.status=='3011'){
        wx.showToast({
          icon:"none",
          title:"购物车为空"
        })
        return false
      }
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
    let skuid = e.currentTarget.dataset.skuid,type=e.currentTarget.dataset.type
    this.addChart("minus",skuid,type)
  },
  plusNum(e){
    let skuid = e.currentTarget.dataset.skuid,type=e.currentTarget.dataset.type
    this.addChart("plus",skuid,type)
  },
  //改变商品数量
  minusFitting:util.debounce(function(){
    let skuNum = this.data.skuNum
    skuNum--
    this.setData({
      skuNum:skuNum
    })
  }),
  addFitting:util.debounce(function(){
    let skuNum = this.data.skuNum
    skuNum++
    this.setData({
      skuNum:skuNum
    })
  }),
  //删除商品
  delete(){

  },
  selectFittings(e){
    
    let id = e.currentTarget.dataset.id,
        idx= e.currentTarget.dataset.idx
    // let cartItem = this.data.cakeLi.some(i=>{
    //   return i.sku_id == id && i.is_fittings==1
    // })
    let item = this.data.fittingsList[idx]
    // if(cartItem){
    //   this.setData({
    //     skuNum:cartItem.sku_number
    //   })
    // }
    this.setData({
      
      fitting:item,
      pop:"fittings-panel"
    })
  },
  addChart:util.debounce(function(option,skuid,type){
    let {city_id}=this.data

    if(option=="plus"){
      //proNum++
      proNum=1
    }
    if(option=="minus"){
      //proNum--
      proNum=-1
    }

    let data = {
      city_id: city_id,
      type:type,
      tab_id:skuid,
      number:proNum
    }
    //proNum=0
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
      
  }),
  getChartData(){
    let data = {
      city_id:this.data.city_id
    }
    api.getChartData(data).then(res => {
      console.log(res);
      if(res.status=='1001'){
        wx.showToast({
          icon:"none",
          title:"用户未登录"
        })
        return
      }
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
          cakeLi:cakeLi,
          fittingsList:res.fittings
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
    let sysInfo = null

    if(app.globalSystemInfo){
      sysInfo = app.globalSystemInfo
    }else{
      sysInfo = wx.getSystemInfoSync()
    }

    let safeArea = sysInfo.safeArea;
    if(sysInfo.screenHeight > safeArea.bottom){
      let btmHolder = sysInfo.screenHeight - safeArea.bottom
      btmHolder = parseInt(btmHolder)
      this.setData({
        btmHolder:btmHolder
      })
    }
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
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = JSON.parse(addressInfo).city_id
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      city_id:city_id || '10216',
      userInfo:userInfo
    })
    //this.getUserCenter();
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