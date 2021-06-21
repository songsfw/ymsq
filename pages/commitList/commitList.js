//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
const app = getApp()

let max_id=null,proId=null,timer=null

Page({
  data: {
    pop: 0,
    skuNum: 1,
    page:1,
    noMoreData:false
  },
  //改变商品数量
  minusFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    if (skuNum == 1) {
      this.setData({
        skuNum: 1
      })
      return
    }
    skuNum--
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
  showTip(e) {

    this.setData({
      pop: 'tip-panel'
    })
  },
  showPop(e) {
    let pop = e.currentTarget.dataset.pop,
      action = e.currentTarget.dataset.action
    this.setData({
      action: action,
      skuNum: 1,
      pop: pop
    })
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  toCart() {
    app.globalData.proType = "1";
  },
  confirmBread: util.debounce(function (e) {
    wx.showLoading({mask:true})
    let proId = e.currentTarget.dataset.id
    if(!proId){
      wx.showToast({
        icon:"none",
        title:"商品暂时不可购买"
      })
      return 
    }
    let {
      city_id,
      skuNum,
      action,
      totalNum
    } = this.data

    let data = {
      city_id: city_id,
      type: '1',
      tab_id: proId,
      number: skuNum
    }
    totalNum = totalNum + skuNum
    api.setChart(data).then(res => {
      wx.hideLoading()
      console.log(res);
      if (res) {
        wx.setStorageSync('total_num', totalNum)
        wx.showToast({
          icon: "none",
          title: '加入购物车成功'
        })
        this.setData({
          totalNum: totalNum,
          pop: 0
        })
        if (action == 1) {
          app.globalData.proType = "1"
          wx.navigateTo({
            url: "/pages/cart/cart/cart"
          })
        }
      }

    })
  }, 300, true),
  addCart(toCart) {
    wx.showLoading({mask:true})
    let proId = this.data.proId
    let city_id = "10216"

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {

      let data = {
        city_id: city_id,
        type: "1",
        tab_id: proId,
        number: 1,
        is_list: 1
      }
      console.log(data);
      api.setChart(data).then(res => {
        wx.hideLoading()
        console.log(res);
        if (res.status == "2001") {
          wx.showToast({
            icon: "none",
            title: '商品不存在或已下架'
          })
        } else {
          wx.showToast({
            icon: "success",
            title: '加入购物车成功'
          })
          wx.reportAnalytics('addcart', {
            type: '1',
            tab_id: proId,
            city_id: city_id,
            source:'detail'
          });
          if (toCart == 1) {
            wx.navigateTo({
              url: "/pages/cart/cart/cart"
            })
          }
        }

      })

    }, 300)
  },
  buyToCart() {
    this.addCart(1)
  },
  onPullDownRefresh() { //下拉刷新
    this.getCommitList()
  },
  getCommitList() {
    let data = {
      meal_id: proId,
      max_id:max_id,
      page:this.data.page
    }
    wx.showLoading({mask:true})
    api.getCommitList(data).then(res => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log(res)
      if (res) {
        let list = res.list,pageInfo=res.page

        let count = parseInt(pageInfo.total_count)
        let noMoreData = count - this.data.page * pageInfo.pagesize <= 0

        this.setData({
          ['list[' + (this.data.page - 1) + ']']: list,
          noMoreData,
          comment: res
        })
      }else{
        this.setData({
          noMoreData: true
        })
      }
    })
  },
  getMoreData() {
    let page = this.data.page + 1
    this.setData({
      page: page
    })
    this.getCommitList()
  },
  getProInfo() {
    let data = {
      meal_id: proId
    }
    wx.showLoading({mask:true})
    api.getProInfo(data).then(res => {
      wx.hideLoading()
      console.log(res)
      if (res) {
        this.setData({
          is_show: true,
          proInfo: res
        })
      }
    })
  },
  onShow(){
    let totalNum = wx.getStorageSync("total_num")
    this.setData({
      totalNum: totalNum
    })
  },
  onLoad: function (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    max_id = options.max_id,proId=options.proId
    this.getCommitList()
    this.getProInfo()
    this.setData({
      btmHolder: btmHolder || 0
    })
  },
  onReady: function () {
    
  },
  onReachBottom() {
    if (this.data.noMoreData) {
      return false
    }
    this.getMoreData()
  },
})