// pages/user/user.js
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const app = getApp()
let timer = null,
  proNum = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startX: 0, //开始坐标
    startY: 0,
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
    windowWidth: wx.getSystemInfoSync().windowWidth,
    delStatus: 0,
    breadItemIds: {}, //move
    cakeItemIds: {}, //move

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
      var disX = that.data.startX - endX;
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
    this.setData({
      startX: e.changedTouches[0].clientX,
    })
  },
  delPro(e) {
    let id = e.currentTarget.dataset.id
    let data = {
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
          this.data.delStatus = 1;
          api.deletePro(data).then(res => {
            console.log(res);
            if(res){
              this.getChartData()
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none',
                duration: 3000
              })
            }
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
      type,
      cakeLi,
      breadLi
    } = this.data
    let selectedBread = null,
      selectedCake = null,
      totalPrice = 0

    function getSelected(type) {
      return pro => pro.is_selected == type;
    }
    switch (type) {
      case "1":
        selectedBread = breadLi.filter(getSelected("1"))
        if (selectedBread.length > 0) {
          totalPrice = selectedBread.reduce((pre, cur) => {
            let curPrice = util.floatObj().multiply(cur.sku_number, cur.sku_price, 2)
            return util.floatObj().add(pre, curPrice, 2)
          }, 0)
          this.setData({
            fittings: false
          })
        }
        break;
      case "2":
        selectedCake = cakeLi.filter(getSelected("1"))
        if (selectedCake.length > 0) {
          totalPrice = selectedCake.reduce((pre, cur) => {
            let curPrice = util.floatObj().multiply(cur.sku_number, cur.sku_price, 2)
            return util.floatObj().add(pre, curPrice, 2)
          }, 0)
          this.setData({
            fittings: true
          })
        } else {
          this.setData({
            fittings: false
          })
        }
        break;
      default:
        break;
    }
    console.log(totalPrice)
    totalPrice = util.formatePrice(totalPrice)
    console.log(totalPrice)

    this.setData({
      totalPrice: totalPrice
    })
  },
  getOrder: util.debounce(function () {
    let {
      totalPrice,
      type,
      cakeLi,
      breadLi,
      city_id
    } = this.data

    let isBread = breadLi.some(item => {
      return item.is_selected == "1"
    })
    let isCake = cakeLi.some(item => {
      return item.is_selected == "1"
    })
    if (isBread && isCake) {
      wx.showToast({
        icon: "none",
        title: "蛋糕与面包需分开支付，先支付面包"
      })
      return false
    }

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
      console.log(res)
      if (res) {
        wx.navigateTo({
          url: "/pages/chart/payOrder/payOrder?type=" + type
        })
      }
    })

  }),
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
      type: '2',
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
        //this.getProList()
        this.getChartData()
      }

    })
  }),
  selectFittings(e) {

    let idx = e.currentTarget.dataset.idx

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

    let {
      city_id
    } = this.data
    let data = {
      city_id: city_id,
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
      console.log(res);
      if (res) {
        this.getChartData()
      }
    })
  },
  getChartData() {
    let proType = app.globalData.proType
    let data = {
      city_id: this.data.city_id
    }
    if(proType){
      data.type=proType
    }
    api.getChartData(data).then(res => {
      console.log(res);
      if (!res) {
        wx.showToast({
          icon: "none",
          title: "获取购物车失败，刷新页面",
          duration: 3000
        })
        return
      }
      let type = "1",
        breadSelectedNum = 0,
        cakeSelectedNum = 0,
        noallBread = true,
        noallCake = true
      if (res) {
        let breadLi = res.bread.detail,
          cakeLi = res.cake.detail
        //util.setTabBarBadge(res.total_num)
        wx.setStorageSync('total_num', res.total_num)
        let breadItemIds = [];
        if (breadLi.length > 0) {
          breadLi.forEach(item => {
            if (item.is_selected == "1") {
              breadSelectedNum++
            }
            breadItemIds.push(item.cart_id)
            item['txtStyle'] = 0;
            if(this.data.delStatus == 1){
              item['txtStyle'] = 1;
            }           
            // console.log(item)
          })
        }
        this.data.breadItemIds = breadItemIds.join(',');

        let cakeItemIds = [];
        if (cakeLi.length > 0) {
          cakeLi.forEach(item => {
            if (item.is_selected == "1") {
              cakeSelectedNum++
            }
            cakeItemIds.push(item.cart_id)
            item['txtStyle'] = 0;
            if(this.data.delStatus == 1){
              item['txtStyle'] = 1;
            }   
          })
        }
        this.data.cakeItemIds = cakeItemIds.join(',');
        type = breadSelectedNum > 0 ? "1" : "2"
        noallBread = breadSelectedNum == res.bread.detail.length ? false : true
        noallCake = cakeSelectedNum == res.cake.detail.length ? false : true

        this.setData({
          noallBread: noallBread,
          noallCake: noallCake,
          type: type,
          breadLi: breadLi,
          breadItemIds: this.data.breadItemIds,
          cakeItemIds: this.data.cakeItemIds,
          cakeLi: cakeLi,
          fittingsList: res.fittings,
          delStatus:this.data.delStatus,
        })
        this.data.delStatus = 0;
        this.getSelectedPro()
      }
    })
  },
  //选中/撤销选中
  selectPro(cartId, action) {
    let data = {
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

        let noallBread = res.bread.detail.some(item => {
          return item.is_selected == "0"
        })
        let noallCake = res.cake.detail.some(item => {
          return item.is_selected == "0"
        })
        this.setData({
          noallBread: noallBread,
          noallCake: noallCake,
          breadLi: res.bread.detail,
          cakeLi: res.cake.detail
        })
        this.getSelectedPro()
      }

    })
  },
  //全选
  selectAll(e) {
    let type = e.currentTarget.dataset.type
    let {
      noallBread,
      noallCake
    } = this.data
    let data = {
      type: type
    }

    if (type == "1") {
      if (noallBread) {
        this.setData({
          noallBread: false,
          noallCake: true,
          fittings: false
        })
        data.action = "1"
      } else {
        this.setData({
          noallBread: true
        })
        data.action = "0"
      }
    }
    if (type == "2") {
      if (noallCake) {
        this.setData({
          noallBread: true,
          noallCake: false,
          fittings: true
        })
        data.action = "1"
      } else {
        this.setData({
          noallCake: true,
          fittings: false
        })
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
        this.setData({
          type: type,
          breadLi: res.bread.detail,
          cakeLi: res.cake.detail
        })

        this.getSelectedPro()
      }

    })
  },
  select(e) {
    let id = e.currentTarget.dataset.id,
      type = e.currentTarget.dataset.type,
      index = e.currentTarget.dataset.idx
    let {
      cakeLi,
      breadLi
    } = this.data
    this.setData({
      type: type
    })

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

    api.getIntroduction().then(res=>{
      console.log(res);
      if(res){
        let txt =res.instructions['cart-top'],
            tipsBread = res.instructions['cart-bread-tips'],
            tipsCake = res.instructions['cart-cake-tips']
        this.setData({
          tipsBread,
          tipsCake,
          instructions:txt
        })
      }
    })

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
    //this.getCartInfo()
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