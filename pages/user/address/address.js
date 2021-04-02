const api = require('../../../utils/api.js')
const app = getApp()
var timer = null,
  startX = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startX: 0, //开始坐标
    startY: 0,
    page: 1,
    address: null,
    source: 0,
    curIdx: null
  },
  touchE: function (e) {
    //按钮宽度(px)
    let btnW = 168
    if (e.changedTouches.length == 1) {
      //获取手指结束滑动的坐标
      var endX = e.changedTouches[0].clientX;
      //计算手指移动的距离
      var disX = startX - endX;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > btnW / 2 ? -btnW : 0;
      //获取当前滑动项
      var idx = e.currentTarget.dataset.idx;
      //更新列表的状态
      this.setData({
        curIdx: idx,
        ['address[' + idx + '].txtStyle']: txtStyle
      });
    }
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    startX = e.changedTouches[0].clientX
  },
  //滑动事件处理
  touchmove: function (e) {
    let address = this.data.address,
      txtStyle = 0
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
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

    if (Math.abs(angle) > 30) return;

    if (touchMoveX < startX) {
      txtStyle = startX - touchMoveX
      that.setData({
        ['address[' + index + '].txtStyle']: txtStyle
      })
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
  toAdddata(e) {
    let source = this.data.source
    let type = e.currentTarget.dataset.type
    if (type == 1) {
      let idx = e.currentTarget.dataset.idx
      let rawAddress = this.data.address[idx]
      let address = {
        city_id: rawAddress.old_city_id,
        id: rawAddress.id,
        name: rawAddress.name,
        province: rawAddress.city_name,
        district: rawAddress.area_name,
        //city_name:rawAddress.city_name+','+rawAddress.area_name,
        mobile: rawAddress.mobile,
        address: rawAddress.address,
        location: rawAddress.location,
        address_detail: rawAddress.address_detail,
        is_default: rawAddress.is_default,
        user_id: rawAddress.rawAddress,
        title: rawAddress.building,
        is_ziti: rawAddress.is_ziti
      }
      wx.setStorageSync('address', JSON.stringify(address))
    } else {
      wx.setStorageSync('address', '{}')
    }
    wx.navigateTo({
      url: "/pages/user/adddata/adddata?type=" + type + "&source=" + source
    })
  },
  setDefAddress(e) {
    let id = e.currentTarget.dataset.id,
      idx = e.currentTarget.dataset.idx
    let addressLi = this.data.address
    let data = {
      address_id: id
    }
    api.setDefAddress(data).then(res => {
      console.log(res);
      if (res) {
        let selectAddress = addressLi[idx]
        let {
          address: addresstxt,
          id,
          area_id,
          area_name,
          old_city_id,
          city_name,
          address_detail,
          is_default,
          mobile,
          name,
          is_ziti
        } = selectAddress
        console.log(addresstxt)
        console.log(selectAddress)
        let addressInfo = {
          address: addresstxt,
          id: id,
          area_id: area_id,
          area_name: area_name,
          city_id: old_city_id,
          city_name: city_name,
          address_detail: address_detail,
          is_default: is_default,
          mobile: mobile,
          name: name,
          is_ziti: is_ziti
        }
        wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
        this.getAddress()
        wx.showToast({
          title: '设置成功',
          icon: 'none',
          duration: 3000
        })
      } else {
        wx.showToast({
          title: '设置失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  delAddress(e) {
    let id = e.currentTarget.dataset.id,
      idx = e.currentTarget.dataset.idx
    let addressLi = this.data.address
    let data = {
      address_id: id
    }
    api.delAddress(data).then(res => {
      console.log(res);
      if (res) {
        let selectAddress = addressLi[idx]
        if (selectAddress.is_default == '1') {
          wx.setStorageSync("addressInfo", '{"city_id":"10216"}')
        }
        this.getAddress()
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  getAddress() {
    api.getAddress().then(res => {
      console.log(res);
      if (res) {
        this.setData({
          address: res
        })
      }

      //wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  selectAdd(e) {
    let idx = e.currentTarget.dataset.idx,
      id = e.currentTarget.dataset.id
    let {
      source,
      address: addressLi,
      cartType
    } = this.data
    console.log("11111")
    if (source != 0) {
      let data = {
        address_id: id,
        cart_type: cartType
      }
      api.checkAddress(data).then(res => {
        console.log(res);
        if (!res) {
          wx.hideToast()

          wx.showModal({
            title: '',
            content: '暂无法配送到地址',
            cancelText: "重选地址",
            confirmText: "配送范围",
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/user/deliveryArea/deliveryArea'
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }

            }
          })

          return
        }

        let selectAddress = addressLi[idx]
        let {
          address: addresstxt,
          id,
          area_id,
          area_name,
          old_city_id,
          city_name,
          address_detail,
          is_default,
          mobile,
          name
        } = selectAddress
        // console.log(addresstxt)
        console.log(selectAddress)
        // console.log(address);

        // return 
        console.log(this.data)
        // selectAddress.old_city_id != 
        let selectA;
        for (let tmlVal of this.data.address) {
          if (tmlVal['id'] == this.data.addressId) {
            selectA = tmlVal;
          }
        }

        if (selectA.old_city_id == selectAddress.old_city_id) {
          let addressInfo = {
            address: addresstxt,
            id: id,
            area_id: area_id,
            area_name: area_name,
            city_id: old_city_id,
            city_name: city_name,
            address_detail: address_detail,
            is_default: is_default,
            mobile: mobile,
            name: name,
            is_ziti: res.is_ziti
          }

          wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
          //切换城市后 重置所选商品类型 1 面包 2 蛋糕
          app.globalData.proType = ''
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            changedId: id
          })

          wx.navigateBack({
            delta: 1
          })
          return
        }

        let p = new Promise(resolve => {
          let pages = getCurrentPages();
          let flag = false;
          if (pages.length > 1) {
            //上一个页面实例对象
            var prePage = pages[pages.length - 2];
            if (prePage.route == "pages/cart/payOrder/payOrder") {
              wx.showModal({
                title: '',
                content: '切换该地址后部分商品不能配送，请到购物车核对商品',
                cancelText: "取消",
                confirmText: "确认更换",
                success(res) {
                  resolve(res.confirm); //true  切换
                  return;
                },
              })
            }
          } else {
            //首页逻辑
            wx.showModal({
              title: '',
              content: '首页切换该地址后部分商品不能配送，请到购物车核对商品',
              cancelText: "取消",
              confirmText: "确认更换",
              success(res) {
                let r = res.confirm ? 'index' : res.confirm;
                resolve(r); //true  切换
                return;
              },
            })
          }
        });

        p.then(res => {
          console.log(res);
          if (!res) {
            return
          }

          if (res == "index") {
            //首页逻辑
            let addressInfo = {
              address: addresstxt,
              id: id,
              area_id: area_id,
              area_name: area_name,
              city_id: old_city_id,
              city_name: city_name,
              address_detail: address_detail,
              is_default: is_default,
              mobile: mobile,
              name: name,
              is_ziti: res.is_ziti
            }

            wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
            //切换城市后 重置所选商品类型 1 面包 2 蛋糕
            app.globalData.proType = ''
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2]; //上一个页面
            //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
            prevPage.setData({
              changedId: id
            })

            wx.navigateBack({
              delta: 1
            })
            return
          }

          let addressInfo = {
            address: addresstxt,
            id: id,
            area_id: area_id,
            area_name: area_name,
            city_id: old_city_id,
            city_name: city_name,
            address_detail: address_detail,
            is_default: is_default,
            mobile: mobile,
            name: name,
            is_ziti: res.is_ziti
          }

          wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
          //切换城市后 重置所选商品类型 1 面包 2 蛋糕
          app.globalData.proType = ''
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            changedId: id
          })
          wx.switchTab({
            url: '/pages/cart/cart',
          })
          // wx.navigateBack({
          //   delta: 1
          // })
        })
      })


    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let source = options.source || 0,
      cartType = options.cartType || 0
    console.log(source);
    let btmHolder = wx.getStorageSync('btmHolder')

    btmHolder = btmHolder > 0 ? btmHolder : 12
    //选择地址
    //source 1 首页下单页   0 个人中心
    if (source == 1) {
      let addressInfo = wx.getStorageSync('addressInfo')
      addressInfo = addressInfo && JSON.parse(addressInfo)
      this.setData({
        addressId: addressInfo.id,
        addressTxt: addressInfo.address + addressInfo.address_detail
      })
    }
    this.setData({
      btmHolder: btmHolder,
      cartType: cartType,
      source: source
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
    this.getAddress()
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