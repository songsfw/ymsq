const util = require('../../utils/util.js')
const ajax = require('../../utils/request.js')
const auth = require('../../utils/auth.js')

const app = getApp()
// pages/share/share
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips: '/image/savebtn.png',
    shareInfo:{}
  },
  getHdData:function(){
    let hd = {
      location:wx.getStorageSync("location"),
      userCode: wx.getStorageSync("userCode")
    }
    return hd
  },
  initData:function(){
    let orderCode = this.data.orderCode
    
    let sysInfo = wx.getStorageSync('sysInfo')
    if (sysInfo) {
      this.setData({
        sysInfo: sysInfo
      })
    } else {
      this.getSysInfo()
    }

    let hd = this.getHdData()
    this.getShareInfo(hd)
  },
  getSysInfo() {
    let hd = this.getHdData()
    ajax.GET("/index/getSysModel", {}, hd).then(res => {
      console.log(res)
      if (res.data.status == 0) {
        let info = res.data.data
        wx.setStorageSync("sysInfo", info)
        this.setData({
          sysInfo: sysInfo
        })
      }
    })
  },
  //授权用户信息
  onGotUserInfo: function (e) {
    var that = this
    if (e.detail.userInfo) {//同意授权
      auth.login.call(that,e.detail).then(res=>{
        console.log("初始登录",res)
        this.initData()
      })
      //隐藏登录弹窗
      this.setData({
        isShowAuth: false
      })
      
    }
  },
  getShareInfo(hd){
    let body = {
      orderCode: this.data.orderCode
    }
    ajax.GET("/OrderList/getShareEntity", body, hd).then(res => {
      console.log(res)
      if (res.data.status == 0) {
        let info = res.data.data
        this.setData({
          shareInfo:info
        })
        util.loadImg(info.img)
        .then(res => {
          this.setData({
            mainImg: res.path
          })
          return util.loadImg(this.data.sysInfo.qrcode.value)
        })
        .then(res => {
          this.setData({
            qrCode: res.path
          })
          return util.loadImg(info.user.avatarUrl)
        })
        .then(res => {
          this.setData({
            face: res.path
          })
          this.imageShow(this.data.mainImg, this.data.face, this.data.qrCode)
          this.ctx.draw()
        })

      }else if(res.data.status == -1){
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  imageShow(img,face,qrcode) {
    // unit适配
    let self = this;
    let shareInfo = this.data.shareInfo

    let unit = ''
    const ctx = wx.createCanvasContext('myCanvas');
    self.ctx = ctx
    wx.getSystemInfo({
      success: function (res) {
        unit = res.windowWidth / 375
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 310 * unit, 600 * unit)
        // 画直线
        // ctx.moveTo(20 * unit, 310 * unit);
        // ctx.lineTo(290 * unit, 310 * unit);
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = "#E5E5E5";
        // ctx.stroke();
        ctx.moveTo(0, 368 * unit);
        ctx.lineTo(310 * unit, 368 * unit);
        ctx.lineWidth = 4 * unit;
        ctx.strokeStyle = "#666666";
        ctx.stroke();
        // 主图
        ctx.drawImage(img, 0, 0, 310 * unit, 257 * unit);
        ctx.save()
        ctx.beginPath()//开始创建一个路径
        ctx.arc(36 * unit, 284 * unit, 17 * unit, 0, 2 * Math.PI, false)//画一个圆形裁剪区域
        ctx.stroke();
        ctx.clip();//裁剪
        ctx.drawImage(face, 20 * unit, 267 * unit, 35 * unit, 35 * unit); // 头像
        ctx.restore();
        ctx.setFillStyle('#333333')//文字颜色
        ctx.setFontSize(14)//设置字体大小，默认10
        ctx.fillText(shareInfo.user.nickName, 70 * unit, 284 * unit)//绘制名字
        ctx.fillText("累计打卡", 20 * unit, 330 * unit)//绘制文本
        ctx.fillText("今日运动", 110 * unit, 330 * unit)//绘制文本
        ctx.fillText("消耗", 210 * unit, 330 * unit)//绘制文本
        ctx.fillText("舞肆主场出品 篮球就在身边", 20 * unit, 390 * unit)//绘制文本
        ctx.setFontSize(14)//设置字体大小，默认10
        ctx.fillText(shareInfo.daySum, 20 * unit, 356 * unit)//绘制文本
        ctx.fillText(shareInfo.fenzhong, 110 * unit, 356 * unit)//绘制文本
        ctx.fillText(shareInfo.daka, 210 * unit, 356 * unit)//绘制文本
        ctx.setFontSize(14)//设置字体大小，默认10
        ctx.fillText("天", 60 * unit, 356 * unit)//绘制文本
        ctx.fillText("分钟", 134 * unit, 356 * unit)//绘制文本
        ctx.fillText("大卡", 240 * unit, 356 * unit)//绘制文本
        ctx.setFillStyle('#999999')//文字颜色
        ctx.setFontSize(10)//设置字体大小，默认10
        ctx.fillText("刚刚在" + shareInfo.brandString + "完成了打卡", 70 * unit, 300 * unit)//绘制文本
        ctx.drawImage(qrcode, 230 * unit, 370 * unit, 60 * unit, 60 * unit);//绘制二维码
        ctx.drawImage(self.data.tips, 20 * unit, 400 * unit, 118 * unit, 23 * unit);//绘制提示

        return ctx
      },
    })
    
  },
  save(){
    var _this = this
    wx.getSetting({
      success(res) {
        console.log("getSetting: success", res);
        if (res.authSetting['scope.writePhotosAlbum'] === false) {
          wx.showModal({
            title: '提示',
            content: '未授权相册保存,请到设置中开启',
            showCancel: false
          });
        } else {
          _this.ctx.draw(true, setTimeout(function () {
            wx.getSystemInfo({
              success: function (res) {
                let deviceInfo = res
                wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width: 310,
                  height: 438,
                  destWidth: 310 * deviceInfo.pixelRatio,
                  destHeight: 440 * deviceInfo.pixelRatio,
                  canvasId: "myCanvas",
                  success: function (res) {
                    console.log(res)
                    wx.saveImageToPhotosAlbum({
                      filePath: res.tempFilePath,
                      success(res) {
                        wx.showToast({
                          title: '保存成功',
                        });
                        setTimeout(function () {
                          wx.navigateBack({
                            delta: 1
                          })
                        },1000)
                      },

                    })
                    _this.setData({ show: false })
                  },
                  fail: function (res) {
                    console.log(res)
                  }
                }, _this)
              }
            })

          }, 100))
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderCode = options.orderCode
    this.setData({
      orderCode: orderCode
    })
    //判断是否有登录授权
    auth.isAuth.call(this)
    .then(res => {
      console.log(res)
      return auth.login.call(this, res)
    })
    .then(res => {
      this.initData()
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
  // onShareAppMessage: function () {

  // }
})

