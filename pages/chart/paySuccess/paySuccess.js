// pages/user/user.js
const api = require('../../../utils/api.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pop: 0,
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  showPop(e) {
    let pop = e.currentTarget.dataset.pop
    let action = this.data.shareInfo.action,
      order_code = this.data.order_code
    let data = {
      order_code: order_code
    }
    if (action == "share") {
      wx.showLoading({
        title: "加载中..."
      })
      api.createPoster(data).then(res => {
        console.log(res);
        if (!res) {
          return
        }
        let poster = res.file
        this.setData({
          poster: poster,
          pop: 'showPoster'
        })
        wx.hideLoading()
      })
    } else {
      this.setData({
        pop: pop
      })
    }

  },
  previewImage(e) {
    var cur = e.target.dataset.src; //获取本地一张图片链接
    wx.previewImage({
      current: cur, //字符串，默认显示urls的第一张
      urls: [cur] // 数组，需要预览的图片链接列表
    })
  },
  confirmCoupon() {
    wx.showLoading({
      title: "加载中..."
    })
    let order_code = this.data.order_code
    let data = {
      order_code: order_code
    }
    api.createPoster(data).then(res => {
      console.log(res);
      wx.hideLoading()
      if (!res) {
        return
      }
      let poster = res.file
      this.setData({
        poster: poster,
        pop: 'showPoster'
      })

      api.shareOrder(data).then(res => {
        console.log(res);
        if (!res) {
          return
        }
        this.setData({
          'shareInfo.action': "share"
        })
      })
    })
  },
  showTips() {
    let showTip = this.data.showTip
    if (showTip) {
      this.setData({
        showTip: false
      })
    } else {
      this.setData({
        showTip: true
      })
    }
  },
  //20200224
  saveImg() {
    var page = this;
    if (!wx.saveImageToPhotosAlbum) {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: false,
      });
      return;
    }

    wx.showLoading({
      title: "正在保存图片",
      mask: false,
    });

    wx.downloadFile({
      url: page.data.poster,
      success: function (e) {
        wx.showLoading({
          title: "正在保存图片",
          mask: false,
        });
        wx.saveImageToPhotosAlbum({
          filePath: e.tempFilePath,
          success: function () {
            wx.showModal({
              title: '提示',
              content: '商品海报保存成功',
              showCancel: false,
            });
          },
          fail: function (e) {
            if (e.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              //用户取消 重新调起
              wx.showModal({
                title: '提示',
                content: '需要开启图片保存权限，点击确定去设置',
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.openSetting({
                      success(res) {

                      },
                      fail(res) {

                      }
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })

            }
          },
          complete: function (e) {
            
          }
        });
      },
      fail: function (e) {
        wx.showModal({
          title: '图片下载失败',
          content: e.errMsg + ";" + page.data.goods_qrcode,
          showCancel: false,
        });
      },
      complete: function (e) {
        console.log(e);
        wx.hideLoading();
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    let order_code = options.orderCode
    console.log(order_code)
    let data = {
      order_code: order_code
    }
    this.setData({
      btmHolder: btmHolder,
      order_code: order_code
    })
    api.preShareOrder(data).then(res => {
      console.log(res);
      if (!res) {
        return
      }
      this.setData({
        shareInfo: res
      })
    })

  },
  share() {
    wx.showShareImageMenu({
      path: this.data.poster,
      success(res) {
        console.log(res)
      }
    })
  },
  toPro(e) {
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: "/pages/proInfo/proInfo?proId=" + url
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
    // let action = this.data.shareInfo.action
    // if(action == "share")
    //   let data = {
    //     order_code:this.data.order_code
    //   }
    //   api.shareOrder(data).then(res=>{
    //     console.log(res);
    //     if(!res){
    //       return
    //     }
    //     this.setData({
    //       'shareInfo.action':"share"
    //     })
    //     // wx.showToast({
    //     //   icon:"success",
    //     //   title:res.msg
    //     // })
    //   })


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
  onShareAppMessage: function () {

  }
})