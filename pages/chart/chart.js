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
    startX: 0, //开始坐标
    startY: 0,
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
    skuNum:1
  },
  touchE: function (e) {
    // console.log(e);
    let type = e.currentTarget.dataset.type
    var that = this
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > 168 / 2 ? 168 : 0;

      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.idx;

      //更新列表的状态
      if(type=='1'){
        that.setData({
          ['breadLi['+index+'].txtStyle']: txtStyle
        })
      }
      else{
        that.setData({
          ['cakeLi['+index+'].txtStyle']: txtStyle
        })
      }
    }
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    // this.data.address.forEach(function (v, i) {
    //   if (v.isTouchMove) //只操作为true的
    //     v.isTouchMove = false;
    // })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    let type = e.currentTarget.dataset.type
    let txtStyle = 0
    var that = this,
      index = e.currentTarget.dataset.idx, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });

      if (Math.abs(angle) > 60) return;
      
      if (touchMoveX < startX){
        txtStyle = startX - touchMoveX
        if(type=='1'){
          that.setData({
            ['breadLi['+index+'].txtStyle']: txtStyle
          })
        }
        else{
          that.setData({
            ['cakeLi['+index+'].txtStyle']: txtStyle
          })
        }
        
      }else{
        txtStyle = touchMoveX - startX
        if(type=='1'){
          that.setData({
            ['breadLi['+index+'].txtStyle']: -txtStyle
          })
        }
        else{
          that.setData({
            ['cakeLi['+index+'].txtStyle']: -txtStyle
          })
        }
      }
    //更新数据
    
  },
  //计算滑动角度
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  delPro(e){
    let id = e.currentTarget.dataset.id
    let data = {
      cart_id:id
    }
    api.deletePro(data).then(res => {
      console.log(res);
      if(res){
        this.getChartData()
      }else{
        wx.showToast({
          title: '删除失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
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
          totalPrice = selectedBread.reduce((pre,cur)=>{
            let curPrice = util.floatObj().multiply(cur.sku_number,cur.sku_price,2)
            return util.floatObj().add(pre,curPrice,2)
          },0)
        }
        break;
      case "2":
        selectedCake = cakeLi.filter(getSelected("1"))
        if(selectedCake.length>0){
          totalPrice = selectedCake.reduce((pre,cur)=>{
            let curPrice = util.floatObj().multiply(cur.sku_number,cur.sku_price,2)
            return util.floatObj().add(pre,curPrice,2)
          },0)
        }
        break;
      default:
        break;
    }
    console.log(totalPrice)
    totalPrice = util.formatePrice(totalPrice)
    console.log(totalPrice)
    
    this.setData({
      fittings:fittings,
      totalPrice:totalPrice
    })
  },
  getOrder:util.debounce(function(){
    let {totalPrice,type,cakeLi,breadLi,city_id}=this.data

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
      city_id:city_id,
      type : type
    }
    if(parseFloat(totalPrice)==0){
      wx.showToast({
        icon:"none",
        title:"您还没有选择商品哦"
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
    
  }),
  //改变商品数量
  minusNum(e){
    let skuid = e.currentTarget.dataset.skuid,type=e.currentTarget.dataset.type,num = e.currentTarget.dataset.num
    this.addChart("minus",skuid,type,num)
  },
  plusNum(e){
    let skuid = e.currentTarget.dataset.skuid,type=e.currentTarget.dataset.type,num = e.currentTarget.dataset.num
    this.addChart("plus",skuid,type,num)
  },
  //改变商品数量
  minusFitting:util.debounce(function(){
    let skuNum = this.data.skuNum
    if(skuNum>1){
      skuNum--
    }
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
  confirmFitting:util.debounce(function(e){
    let proId = e.currentTarget.dataset.sku
    let {city_id,skuNum}=this.data

    // let cartItem = this.data.cakeLi.find(i=>{
    //   return i.sku_id == proId && i.is_fittings==1
    // })
    // if(cartItem){
    //   let oldNum = cartItem.sku_number

    //   if(parseInt(oldNum)>skuNum){
    //     skuNum = -(oldNum - skuNum)
    //   }else{
    //     skuNum = skuNum - oldNum
    //   }
    // }

    let data = {
      city_id: city_id,
      type:'2',
      tab_id:proId,
      number:skuNum
    }
    console.log(data);
    api.setChart(data).then(res => {
      console.log(res);
      if(res.status=="2001"){
        wx.showToast({
          icon:"none",
          title:'商品不存在或已下架'
        })
      }else{
        wx.showToast({
          icon:"none",
          title:'加入购物车成功'
        })
        this.setData({
          pop:0
        })
        //this.getProList()
        this.getChartData()
      }
      
    })
  }),
  selectFittings(e){
    
    let idx= e.currentTarget.dataset.idx

    // let cartItem = this.data.cakeLi.find(i=>{
    //   return i.sku_id == id && i.is_fittings==1
    // })
    let item = this.data.fittingsList[idx]

    // if(cartItem){
    //   skuNum=cartItem.sku_number
    // }else{
    //   skuNum=1
    // }
    this.setData({
      skuNum:1,
      fitting:item,
      pop:"fittings-panel"
    })
  },
  selectFittingSku(e){
    let sku = e.currentTarget.dataset.sku
    this.setData({
      'fitting.sku':sku
    })
  },
  addChart:util.debounce(function(option,skuid,type,num){
    
    let {city_id}=this.data
    let data = {
      city_id: city_id,
      type:type,
      tab_id:skuid,
    }
    console.log(data);
    if(option=="plus"){
      //proNum++
      data.number=1
      this.setCartNum(data)
    }
    if(option=="minus"){
      if(num==1){
        wx.showModal({
          title: '',
          content: '删除商品？',
          cancelText:"取消",
          confirmText: "删除",
          confirmColor:"#C1996B",
          success:res=> {
            if (res.confirm) {
              data.number=-1
              this.setCartNum(data)
            } else if (res.cancel) {
              return
            }
          }
        })
      }else{
        data.number=-1
        this.setCartNum(data)
      }
      //proNum--
    }
    
  }),
  
  setCartNum(data){
    api.setChart(data).then(res => {
      console.log(res);
      if(res){
        this.getChartData()
      }
    })
  },
  getChartData(){
    let data = {
      type:app.globalData.proSource,  //此type为跳转过来的参数，不同于页面中其他type
      city_id:this.data.city_id
    }
    api.getChartData(data).then(res => {
      console.log(res);
      if(!res){
        wx.showToast({
          icon:"none",
          title:"获取购物车失败，刷新页面",
          duration:3000
        })
        return
      }
      let type="1",breadSelectedNum=0,cakeSelectedNum=0,noallBread=true,noallCake=true
      if(res){
        let breadLi = res.bread.detail,cakeLi=res.cake.detail
        
        wx.setStorageSync('total_num',res.total_num)
        util.setTabBarBadge(res.total_num)
        
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
        noallBread = breadSelectedNum==res.bread.detail.length ? false : true
        noallCake = cakeSelectedNum==res.cake.detail.length ? false : true

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
  getCartInfo(){
    let total_num = wx.getStorageSync("total_num")
    if(total_num && total_num>0){
      wx.setTabBarBadge({ 
        index: 2,
        text: total_num.toString()
      })
    }else{
      wx.removeTabBarBadge({
        index: 2
      })
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

    let btmHolder = wx.getStorageSync('btmHolder')

    this.setData({
      btmHolder:btmHolder||0
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
    // if (typeof this.getTabBar === 'function' &&
    //   this.getTabBar()) {
    //   this.getTabBar().setData({
    //     count:"",
    //     selected: 2
    //   })
    // }
    let sysInfo = app.globalSystemInfo;
    let userInfo = wx.getStorageSync("userInfo")
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo&&JSON.parse(addressInfo).city_id
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      city_id:city_id || '10216',
      userInfo:userInfo
    })
    //this.getUserCenter();
    this.getChartData()
    this.getCartInfo()
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
})