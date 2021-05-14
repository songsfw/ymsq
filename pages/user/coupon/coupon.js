const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const wxbarcode = require('../../../utils/initBarCode.js')

let mallLi = null,
  usedLi = null,
  shopLi = null,
  expiredLi = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: '0',
    mallLi: null,
    shopLi: null,
    usedLi: null,
    expiredLi: null,
    showStatus: {},
    dianStatus: null,
    card_no: '',
    pageInfo: {
      mall: {
        count: 0,
        pageNum: 1,
        noMoreData: true
      },
      shop: {
        count: 0,
        pageNum: 1,
        noMoreData: true
      },
      used: {
        count: 0,
        pageNum: 1,
        noMoreData: true
      },
      expired: {
        count: 0,
        pageNum: 1,
        noMoreData: true
      },
      tempFont: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let end = new Date().getFullYear()
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      userInfo = JSON.parse(userInfo)
    }
    this.setData({
      user_id: userInfo.user_id
    })
  },
  switchTab: function (e) {
    var currentId = e.currentTarget.dataset.tabid
    if (this.data.currentTab === currentId) {
      return false;
    } else {
      this.setData({
        currentTab: currentId,
      })
    }
  },

  getCoupon() {
    this.setData({
      showLoading: true
    })
    api.getCoupon().then(res => {
      console.log(res);
      if (!res) return

      let pageInfo = JSON.parse(JSON.stringify(this.data.pageInfo))
      let {
        showStatus
      } = this.data;
      console.log(pageInfo);
      let obj = {},
        currList = []
      Object.keys(res).map(key => {
        let count = res[key].length
        let noMoreData = count - pageInfo[key].pageNum * 10 <= 0
        obj[key] = {
          count: count,
          pageNum: 1,
          noMoreData: noMoreData
        }

        res[key].forEach(item => {
          showStatus[item.id] = true;
        });

      })

      mallLi = res.mall
      shopLi = res.shop
      usedLi = res.used
      expiredLi = res.expired

      this.setData({
        showLoading: false,
        pageInfo: obj,
        ['mallLi[' + (obj.mall.pageNum - 1) + ']']: this.getCurrList(mallLi, 1),
        ['shopLi[' + (obj.shop.pageNum - 1) + ']']: this.getCurrList(shopLi, 1),
        ['usedLi[' + (obj.used.pageNum - 1) + ']']: this.getCurrList(usedLi, 1),
        ['expiredLi[' + (obj.expired.pageNum - 1) + ']']: this.getCurrList(expiredLi, 1),
        showStatus,
      })
      let curShopLi = this.getCurrList(shopLi, 1)
      if (curShopLi.length > 0) {
        curShopLi.forEach(item => {
          wxbarcode.barcode('barcode-' + item.id, item.card_no, 660, 300);
        })
      }

    })
  },
  getCurrList(list, pageNum) {
    return list.slice(pageNum * 10 - 10, pageNum * 10)
  },
  changeShow(e) {
    let id = e.currentTarget.dataset.id;
    this.data.showStatus[id] = this.data.showStatus[id] == true ? false : true;
    this.setData({
      showStatus: this.data.showStatus,
      rotateRight: 'rotateRight',
    })
  },
  useCoupon(e) {
    let id = e.currentTarget.dataset.id,
      idx = e.currentTarget.dataset.idx
    let pageNum = parseInt(this.data.pageInfo.shop.pageNum)
    let index = pageNum - 1
    let data = {
      promotion_id: id
    }
    console.log(this.data.shopLi);

    wx.showModal({
      title: '兑换',
      content: '您的优惠券在点击确认后即兑换成功，确定兑换吗？',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          api.storeCoupon(data).then(res => {
            console.log(res);
            if (res) {
              this.setData({
                ['shopLi[' + index + '][' + idx + '].used']: true
              })
              console.log(this.data.shopLi);
              wx.showToast({
                icon: "success",
                title: "使用成功"
              })

            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  showTips(e) {
    let id = e.currentTarget.dataset.id,
      card = e.currentTarget.dataset.card,
      type = e.currentTarget.dataset.type


    switch (type) {
      case 'shopLi':
        this.data.showStatus[id] = this.data.showStatus[id] == true ? false : true;
        this.setData({
          showStatus: this.data.showStatus,
          rotateRight: 'rotateRight',
        })
        break;
      case 'mallLi':
        this.data.showStatus[id] = this.data.showStatus[id] == true ? false : true;
        this.setData({
          showStatus: this.data.showStatus,
          rotateRight: 'rotateRight',
        })
        break;
      case 'used':
        console.log(1)
        this.data.showStatus[id] = this.data.showStatus[id] == true ? false : true;
        this.setData({
          showStatus: this.data.showStatus,
          rotateRight: 'rotateRight',
        })
        break;
      case 'expired':
        console.log(1)
        this.data.showStatus[id] = this.data.showStatus[id] == true ? false : true;
        this.setData({
          showStatus: this.data.showStatus,
          rotateRight: 'rotateRight',
        })
        break;
    }

    // if (id == curId) {
    //   this.setData({
    //     curId: null,
    //   })
    // } else {
    //   wxbarcode.barcode('barcode-' + id, card, 660, 300);
    //   this.setData({
    //     curId: id,
    //   })
    // }

  },
  getMoreData() {
    let pageNum, noMoreData
    let {
      currentTab,
      pageInfo
    } = this.data
    switch (currentTab) {
      case "0":
        pageNum = pageInfo.mall.pageNum + 1
        if (pageInfo.mall.noMoreData) {
          return false
        }
        noMoreData = this.getCurrList(mallLi, pageNum).length - 10 < 0
        this.setData({
          ['pageInfo.mall.pageNum']: pageNum,
          ['pageInfo.mall.noMoreData']: noMoreData,
          ['mallLi[' + (pageNum - 1) + ']']: this.getCurrList(mallLi, pageNum),
        })

        break;
      case "1":
        pageNum = pageInfo.shop.pageNum + 1
        if (pageInfo.shop.noMoreData) {
          return false
        }
        let curShopLi = this.getCurrList(shopLi, pageNum)
        if (curShopLi.length > 0) {
          curShopLi.forEach(item => {
            wxbarcode.barcode('barcode', item.card_no, 660, 300);
          })
        }

        noMoreData = this.getCurrList(shopLi, pageNum).length - 10 < 0
        this.setData({
          ['pageInfo.shop.pageNum']: pageNum,
          ['pageInfo.shop.noMoreData']: noMoreData,
          ['shopLi[' + (pageNum - 1) + ']']: this.getCurrList(shopLi, pageNum),
        })

        break;
      case "2":
        pageNum = pageInfo.used.pageNum + 1
        if (pageInfo.used.noMoreData) {
          return false
        }
        noMoreData = this.getCurrList(usedLi, pageNum).length - 10 < 0
        this.setData({
          ['pageInfo.used.pageNum']: pageNum,
          ['pageInfo.used.noMoreData']: noMoreData,
          ['usedLi[' + (pageNum - 1) + ']']: this.getCurrList(usedLi, pageNum),
        })

        break;
      case "3":
        pageNum = pageInfo.expired.pageNum + 1
        if (pageInfo.expired.noMoreData) {
          return false
        }
        noMoreData = this.getCurrList(expiredLi, pageNum).length - 10 < 0
        this.setData({
          ['pageInfo.expired.pageNum']: pageNum,
          ['pageInfo.expired.noMoreData']: noMoreData,
          ['expiredLi[' + (pageNum - 1) + ']']: this.getCurrList(expiredLi, pageNum),
        })

        break;
      default:
        break;
    }

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
    this.getCoupon()
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
    this.getMoreData()
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})