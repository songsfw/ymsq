// pages/user/user.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')
const auth = require('../../utils/auth.js')
const app = getApp()
let loginInfo = null,startX= 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curProId: -1,
    userInfo: null,
    count: 0,
    user: null,
    allBread: false,
    allCake: false,
    totalPrice: 0,
    btmHolder: 0,
    fittings: false,
    pop: 0,
    skuNum: 1,
    //delStatus: 0,
    //breadItemIds: {}, //move
    //cakeItemIds: {}, //move

  },
  touchE: function (e) {
    // console.log(e);
    let {breadLi,cakeLi,curItemId} = this.data
    let type = e.currentTarget.dataset.type
    var that = this
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = startX - endX;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > 80 / 2 ? -158 : 0;

      //获取手指触摸的是哪一项
      var id = e.currentTarget.dataset.id;
      var idx = e.currentTarget.dataset.idx;
      //更新列表的状态
      if (type == '1') {
        that.setData({
          curItemId:id,
          ['breadLi[' + idx + '].txtStyle']: txtStyle
        })
        console.log(breadLi);
      } else {
        that.setData({
          curItemId:id,
          ['cakeLi[' + idx + '].txtStyle']: txtStyle
        })
      }
      if(id!=curItemId){
        breadLi.find((item,index)=>{
          if(item.cart_id==curItemId){
            this.setData({
              ['breadLi['+index+'].txtStyle']: 0
            })
          }
        })
        cakeLi.find((item,index)=>{
          if(item.cart_id==curItemId){
            this.setData({
              ['cakeLi['+index+'].txtStyle']: 0
            })
          }
        })
      }
      
    }
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    startX= e.changedTouches[0].clientX
  },
  initCartData(res){
    let bread = res.bread,
        cake = res.cake,
        total_num = res.total_number
    util.setTabBarBadge(total_num)
    wx.setStorageSync('total_num', total_num)
    let selectType = this.getSelectType(bread,cake)
    let hasActive = bread.detail.some(item=>{
      return item.special_tag=="活动商品"
    })
    this.setData({
      hasActive,
      type:selectType.type,
      noallBread: selectType.noallBread,
      noallCake: selectType.noallCake,
      cakeSelectedNum:cake.select_number,
      breadSelectedNum:bread.select_number,
      cakeSelectedPrice:cake.select_price,
      breadSelectedPrice:bread.select_price,
      breadLi: bread.detail,
      totalPrice:res.select_price,
      cakeLi: cake.detail,
      fittingsList: res.fittings,
    })
  },
  delPro(e) {
    let id = e.currentTarget.dataset.id
    let { city_id } = this.data
    let data = {
      city_id: city_id,
      cart_id: id
    }
    
    wx.showModal({
      title: '',
      content: '是否将该商品从购物车移除',
      cancelText: "再想想",
      confirmText: "确定",
      confirmColor: "#C1996B",
      success: res => {
        if (res.confirm) {
          this.setData({
            showLoading: true
          })
          //this.data.delStatus = 1;
          api.deletePro(data).then(res => {
            console.log(res);
            if(res){
              this.initCartData(res)
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none',
                duration: 3000
              })
            }
            this.setData({
              showLoading: false
            })
          })
        } else if (res.cancel) {
          return
        }
      }
    })
    // let query = wx.createSelectorQuery()
    // let queryNode = query.selectAll('.pro-box')
    // return false;
    
  },
  showTip(){
    wx.showToast({
      icon:"none",
      title:"蛋糕配件不允许单独购买，请与蛋糕一同购买",
      duration:3000
    })
  },
  toProInfo: function (e) {
    
    let proId = e.currentTarget.dataset.proid
    let type = e.currentTarget.dataset.type,isfit=e.currentTarget.dataset.isfit
    if(!proId){
      return
    }
    if(isfit==1){
      return
    }
    let url = "/pages/" + (type == 1 ? 'proInfo/proInfo' : 'cakeInfo/cakeInfo') + "?proId=" + proId + "";
    console.log(url)
    wx.navigateTo({
      url: url
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
  getSelectedPro() {
    let {
      cakeLi,
    } = this.data
    let selectedCake = null
      //totalPrice = 0

    function getSelected(type) {
      return pro => pro.is_selected == type;
    }
    
    selectedCake = cakeLi.filter(getSelected("1"))
    if (selectedCake.length > 0) {
      this.setData({
        fittings: true
      })
    } else {
      this.setData({
        fittings: false
      })
    }
  },
  Settlement(){
    let {cakeLi,breadLi}=this.data
    let isBread = breadLi.some(item => {
      return item.is_selected == "1"
    })
    let isCake = cakeLi.some(item => {
      return item.is_selected == "1"
    })
    if (isBread && isCake) {
      this.setData({
        pop:"order-panel"
      })
      
    }else{
      this.getOrder()
    }
  },
  getOrder: util.debounce(function (e) {
    wx.showLoading({mask:true})
    let type=""
    if(e){
      let curType = e.currentTarget.dataset.type
      type = curType
    }else{
      type = this.data.type
    }
    let {
      totalPrice,
      city_id
    } = this.data

    let data = {
      city_id: city_id,
      type: type
    }
    if (parseFloat(totalPrice) == 0) {
      wx.showToast({
        icon: "none",
        title: "您还没有选择商品哦"
      })
      return false
    }
    api.commitChart(data).then(res => {
      wx.hideLoading()
      console.log(res)
      if (res) {
        wx.navigateTo({
          url: "/pages/cart/payOrder/payOrder?type=" + type
        })
      }
    })

  },500,true),

  //改变商品数量
  minusNum(e) {
    let skuid = e.currentTarget.dataset.skuid,
      type = e.currentTarget.dataset.type,
      num = e.currentTarget.dataset.num
    this.addChart("minus", skuid, type, num)
  },
  plusNum(e) {
    let skuid = e.currentTarget.dataset.skuid,
      type = e.currentTarget.dataset.type,
      num = e.currentTarget.dataset.num
    this.addChart("plus", skuid, type, num)
  },
  //改变商品数量
  minusFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    if (skuNum > 1) {
      skuNum--
    }
    this.setData({
      skuNum: skuNum
    })
  }),
  addFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    skuNum++
    this.setData({
      skuNum: skuNum
    })
  }),
  confirmFitting: util.debounce(function (e) {
    let proId = e.currentTarget.dataset.sku
    let {
      city_id,
      skuNum
    } = this.data

    let data = {
      city_id: city_id,
      type: '2',
      is_list:1,
      tab_id: proId,
      number: skuNum
    }
    console.log(data);
    api.setChart(data).then(res => {
      console.log(res);
      if (res.status == "2001") {
        wx.showToast({
          icon: "none",
          title: '商品不存在或已下架'
        })
      } else {
        wx.showToast({
          icon: "none",
          title: '加入购物车成功'
        })
        this.setData({
          pop: 0
        })
        this.initCartData()
      }

    })
  }),
  selectFittings(e) {

    let idx = e.currentTarget.dataset.idx
    let item = this.data.fittingsList[idx]

    this.setData({
      skuNum: 1,
      fitting: item,
      pop: "fittings-panel"
    })
  },
  selectFittingSku(e) {
    let sku = e.currentTarget.dataset.sku
    this.setData({
      'fitting.sku': sku
    })
  },
  addChart: util.debounce(function (option, skuid, type, num) {
    if(!skuid){
      wx.showToast({
        icon:"none",
        title: "商品失效，重新加购试试？"
      })
      return
    }
    let {
      city_id
    } = this.data
    let data = {
      city_id: city_id,
      is_list:1,
      type: type,
      tab_id: skuid,
    }
    console.log(data);
    if (option == "plus") {
      //proNum++
      data.number = 1
      this.setCartNum(data)
    }
    if (option == "minus") {
      if (num == 1) {
        wx.showModal({
          title: '',
          content: '是否将该商品从购物车移除',
          cancelText: "再想想",
          confirmText: "确定",
          confirmColor: "#C1996B",
          success: res => {
            if (res.confirm) {
              data.number = -1
              this.setCartNum(data)
            } else if (res.cancel) {
              return
            }
          }
        })
        
      } else {
        data.number = -1
        this.setCartNum(data)
      }
      //proNum--
    }

  }),

  setCartNum(data) {
    api.setChart(data).then(res => {
      if (res) {
        this.initCartData(res)
      }
    })
  },
  getSelectType(bread,cake){
    let type = "",
        noallBread = true,
        noallCake = true
    let breadLi = bread.detail,
        cakeLi = cake.detail,
        breadSelectedNum = 0,
        cakeSelectedNum = 0

    function getSelected(type) {
      return pro => pro.is_selected == type;
    }

    if (breadLi&&breadLi.length > 0) {
      breadSelectedNum = breadLi.filter(getSelected("1")).length
      noallBread = breadSelectedNum == breadLi.length ? false : true
    }
    if (cakeLi&&cakeLi.length > 0) {
      cakeSelectedNum = cakeLi.filter(getSelected("1")).length
      noallCake = cakeSelectedNum == cakeLi.length ? false : true
    }
    if(breadSelectedNum>0 && cakeSelectedNum>0){
      type=''
    }else{
      type = breadSelectedNum > 0 ? "1" : "2"
    }

    return {
      cakeSelectedNum,
      breadSelectedNum,
      type,
      noallBread,
      noallCake
    }
  },
  getChartData() {
    //let proType = app.globalData.proType
    let data = {
      city_id: !this.data.city_id || this.data.city_id == 0?  10216 :this.data.city_id,
    }
    // if(proType){
    //   data.type=proType
    // }
    api.getChartData(data).then(res => {
      console.log(res);
      this.setData({
        showLoading: false
      })
      if (!res) {
        wx.showToast({
          icon: "none",
          title: "获取购物车失败，刷新页面",
          duration: 3000
        })
        return
      }
      if (res) {
        let bread =  res.bread,cake = res.cake
        this.initCartData(res)
        if(this.data.pop=='order-panel' && cake.select_number==0 && bread.select_number==0){
          this.close()
        }
      }
      wx.stopPullDownRefresh()
    })
  },
  //选中/撤销选中
  selectPro(cartId, action) {
    let { city_id } = this.data
    let data = {
      city_id:city_id,
      cart_id: cartId,
      action: action
    }
    api.selectPro(data).then(res => {
      console.log(res);
      if (!res) {
        wx.showToast({
          icon: "none",
          title: "撤销选中失败"
        })
      } else {
        let bread =  res.bread,cake = res.cake
        let selectType = this.getSelectType(bread,cake)
        // let noallBread = res.bread.detail.some(item => {
        //   return item.is_selected == "0"
        // })
        // let noallCake = res.cake.detail.some(item => {
        //   return item.is_selected == "0"
        // })
        this.setData({
          cakeSelectedNum:cake.select_number,
          breadSelectedNum:bread.select_number,
          cakeSelectedPrice:cake.select_price,
          breadSelectedPrice:bread.select_price,
          type:selectType.type,
          noallBread: selectType.noallBread,
          noallCake: selectType.noallCake,
          breadLi: bread.detail,
          cakeLi: cake.detail,
          totalPrice:res.select_price,
        })
        //this.getSelectedPro()
      }

    })
  },
  //全选
  selectAll(e) {
    let type = e.currentTarget.dataset.type
    
    let {
      city_id,
      noallBread,
      noallCake
    } = this.data
    let data = {
      city_id:city_id,
      type: type
    }

    if (type == "1") {
      if (noallBread) {
        // this.setData({
        //   noallBread: false,
        //   noallCake: true,
        //   fittings: false
        // })
        data.action = "1"
      } else {
        // this.setData({
        //   noallBread: true
        // })
        data.action = "0"
      }
    }
    if (type == "2") {
      if (noallCake) {
        // this.setData({
        //   noallBread: true,
        //   noallCake: false,
        //   fittings: true
        // })
        data.action = "1"
      } else {
        // this.setData({
        //   noallCake: true,
        //   fittings: false
        // })
        data.action = "0"
      }
    }

    api.selectAllPro(data).then(res => {
      console.log(res);
      if (!res) {
        wx.showToast({
          icon: "none",
          title: "撤销选中失败"
        })
      } else {
        let bread =  res.bread,cake = res.cake
        let selectType = this.getSelectType(bread,cake)

        this.setData({
          cakeSelectedNum:cake.select_number,
          breadSelectedNum:bread.select_number,
          cakeSelectedPrice:cake.select_price,
          breadSelectedPrice:bread.select_price,
          type:selectType.type,
          noallBread: selectType.noallBread,
          noallCake: selectType.noallCake,
          breadLi: bread.detail,
          cakeLi: cake.detail,
          totalPrice:res.select_price,
        })
      }

    })
  },
  select(e) {
    let id = e.currentTarget.dataset.id,
      type = e.currentTarget.dataset.type,
      index = e.currentTarget.dataset.idx,
      stock = e.currentTarget.dataset.stock
    let {
      cakeLi,
      breadLi
    } = this.data
    // this.setData({
    //   type: type
    // })
    if(stock==0){
      wx.showToast({
        icon:"none",
        title:"暂无库存"
      })
      return
    }
    if (type == "1") {
      if (breadLi[index].is_selected == "0") {
        this.selectPro(id, "1")
      } else {
        this.selectPro(id, "0")
      }
    }
    if (type == "2") {
      if (cakeLi[index].is_selected == "0") {
        this.selectPro(id, "1")
      } else {
        this.selectPro(id, "0")
      }
    }

  },
  getCartInfo() {
    let total_num = wx.getStorageSync("total_num")
    if (total_num) {
      util.setTabBarBadge(total_num)
    }

  },
  showNotice(e) {

    this.setData({
      pop: 'tip-panel'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = null

    if (app.globalSystemInfo) {
      sysInfo = app.globalSystemInfo
    } else {
      sysInfo = wx.getSystemInfoSync()
    }

    let btmHolder = wx.getStorageSync('btmHolder')
    let instructions = wx.getStorageSync('instructions')

    if(instructions){
      console.log(instructions);
      instructions = JSON.parse(instructions)
      let txt =instructions['cart-top'],
          // tipsBread = instructions['cart-bread-tips'],
          tipsCake = instructions['cart-cake-tips'],
          special_tips =instructions['special_tips']
      this.setData({
        tipsCake,
        instructions:txt,
        special_tips
      })
    }else{
      api.getIntroduction().then(res=>{
        console.log(res);
        if(res){
          instructions = res.instructions
          let txt =instructions['cart-top'],
          //tipsBread = instructions['cart-bread-tips'],
          tipsCake = instructions['cart-cake-tips'],
          special_tips =instructions['special_tips']
          this.setData({
            tipsCake,
            instructions:txt,
            special_tips
          })
          wx.setStorageSync("instructions", JSON.stringify(res.instructions))
          
        }
      })
    }
  

    this.setData({
      btmHolder: btmHolder || 0
    })

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getUserCenter() {
    api.getUserCenter().then(res => {
      console.log(res);
      this.setData({
        user: res.user
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
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    if (userInfo) {
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      city_id: city_id || '10216',
      userInfo: userInfo
    })

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

  }
})