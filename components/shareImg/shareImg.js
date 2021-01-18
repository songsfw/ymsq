// pages/shareImg/shareImg.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sharedata: {            // 属性名
      type: Object,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ''     // 属性初始值（可选），如果未指定则会根据类型选择一个
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show:true,
    touxiang:'',
    codeimg:'',
    imgcar:''
  },
  ready:function(){
    var _this = this
    wx.getImageInfo({
      src: _this.data.sharedata.carimg,
      success(res1) {
        console.log(res1,_this)
        var imgcar = res1.path
        wx.getImageInfo({
          src: _this.data.sharedata.avatarUrl,
          success(res2) {
            
            var touxiang = res2.path
            wx.getImageInfo({
              src: _this.data.sharedata.code,
              success(res3) {
                console.log(res3)
                var codeimg = res3.path
            _this.drowcode(imgcar,touxiang, codeimg)
                _this.setData({
                  touxiang:touxiang,
                  codeimg:codeimg,
                  imgcar: imgcar
                })
                _this.ctx.draw()


              }
            }, _this)
          }
        }, _this)
      }
    }, _this)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    close:function(){
      this.setData({ show: false })
      this.triggerEvent('myevent')
    },
    save:function(){
      var _this = this
      this.drowcode(_this.data.imgcar,_this.data.touxiang,_this.data.codeimg)
      wx.getSetting({
        success(res) {
          console.log("getSetting: success",res);
          if (res.authSetting['scope.writePhotosAlbum'] === false) { 
            wx.showModal({
              title: '提示',
              content:'未授权相册保存,请到设置中开启',
              showCancel:false
            });
           }else{
            _this.ctx.draw(true, setTimeout(function () {
              wx.getSystemInfo({
                success: function (res) {

                  wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: res.windowWidth,
                    height: res.windowHeight,
                    destWidth: res.windowWidth * 4,
                    destHeight: res.windowHeight * 4,
                    canvasId: "myCanvas",
                    success: function (res) {
                      console.log(res)



                      wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(res) {
                          wx.showToast({
                            title: '保存成功',
                          });
                        },
                        
                      })
                      _this.setData({show:false})
                      _this.triggerEvent('myevent')
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

    drowcode: function (imgcar,touxiang, codeimg){

      var _this = this
      const ctx = wx.createCanvasContext('myCanvas', _this);
      _this.ctx = ctx
      
      wx.getSystemInfo({
        success: function (res) {
          
          //获取屏幕宽度高度
          var winW = res.windowWidth;
          var winH = res.windowHeight;
          //背景绘制
          ctx.beginPath();
          var bg = "../../image/share-bg.png";
          ctx.drawImage(bg, 0, 0, winW, winH); // 推进去图片
          //车图图片       
          ctx.save();
          ctx.beginPath();
          var photo = imgcar;//主头像
          ctx.arc(winW / 2, winH / 6.88, winW / 5.6, 0, Math.PI * 2);
          ctx.setShadow(0, 5, 10, '#b8a6dc');
          ctx.fill();
          ctx.clip();//画了圆 再剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
          ctx.drawImage(photo, winW / 3.1, winH / 29, winW / 2.8, winW / 2.8); // 推进去图片
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制


          // 优惠车系文字
          ctx.beginPath();
          ctx.setFontSize(18);
          ctx.setFillStyle("#999999");
          ctx.setTextAlign('center');
          ctx.fillText(_this.data.sharedata.carname.substring(0, 15), winW / 2, winH / 3.3);
          ctx.setFillStyle("#999999");
          //优惠信息文字
          ctx.beginPath();
          ctx.setFontSize(20);
          ctx.setFillStyle("#ff4b3c");
          ctx.setTextAlign('center');
          ctx.fillText('每人优惠' + _this.data.sharedata.subinfo + '元', winW / 2, winH / 2.85);

          //分隔线
          ctx.beginPath();
          ctx.rect(winW / 5.56, winH / 2.65, winW / 1.56, 1)
          ctx.setFillStyle('#e5e5e5')
          ctx.fill()

          
          //问号图片4
          ctx.save();
          ctx.beginPath();
          var photo1 = '../../image/touxiang-3.png';
          ctx.arc(winW / 1.42, winH / 2.32, winW / 17.86, 0, Math.PI * 2);
          ctx.fill();
          ctx.clip();//画了圆 再剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
          ctx.drawImage(photo1, winW / 1.54, winH / 2.53, winW / 8.93, winW / 8.93); // 推进去图片
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制
          //问号图片3
          ctx.save();
          ctx.beginPath();
          var photo1 = '../../image/touxiang-3.png';
          ctx.arc(winW / 1.65, winH / 2.32, winW / 17.86, 0, Math.PI * 2);
          ctx.fill();
          ctx.clip();//画了圆 再剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
          ctx.drawImage(photo1, winW / 1.82, winH / 2.53, winW / 8.93, winW / 8.93); // 推进去图片
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制
          //问号图片2
          ctx.save();
          ctx.beginPath();
          var photo1 = '../../image/touxiang-3.png';
          ctx.arc(winW / 1.95, winH / 2.32, winW / 17.86, 0, Math.PI * 2);
          ctx.fill();
          ctx.clip();//画了圆 再剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
          ctx.drawImage(photo1, winW / 2.19, winH / 2.53, winW / 8.93, winW / 8.93); // 推进去图片
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制
          //问号图片1
          ctx.save();
          ctx.beginPath();
          var photo1 = '../../image/touxiang-3.png';
          ctx.arc(winW / 2.39, winH / 2.32, winW / 17.86, 0, Math.PI * 2);
          ctx.fill();
          ctx.clip();//画了圆 再剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
          ctx.drawImage(photo1, winW / 2.78, winH / 2.53, winW / 8.93, winW / 8.93); // 推进去图片
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制

          //抽奖图像绘制
          ctx.save();
          ctx.beginPath();
          var photo = touxiang;
          ctx.arc(winW / 3.15, winH / 2.32, winW / 17.86, 0, Math.PI * 2);
          ctx.strokeStyle = '#ff4b3c';
          ctx.setLineWidth(2)
          ctx.stroke();
          ctx.clip();//画了圆 再剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内
          ctx.drawImage(photo, winW / 3.85, winH / 2.53, winW / 8.93, winW / 8.93); // 推进去图片
          ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制


          //拼团者姓名
          ctx.beginPath();
          ctx.setFontSize(12);
          ctx.setFillStyle("#ff4b3d");
          ctx.setTextAlign('right');
          
          if (_this.data.sharedata.nickName.length>4){
            ctx.fillText(_this.data.sharedata.nickName.substring(0, 4)+"...", winW / 3.4, winH / 2);
          }else{
            ctx.fillText(_this.data.sharedata.nickName, winW / 3.4, winH / 2);
          }
          
          //正在拼团
          ctx.beginPath();
          ctx.setFontSize(12);
          ctx.setFillStyle("#666");
          ctx.setTextAlign('right');
          ctx.fillText('正在易车网旗下小程序车拼购组团买车', winW / 1.15, winH / 2);

          //加入他
          ctx.beginPath();
          ctx.setFontSize(12);
          ctx.setFillStyle("#666");
          ctx.setTextAlign('center');
          ctx.fillText('加入他', winW / 2, winH / 1.89);


          //一起买每人立享3000元购车返现
          ctx.beginPath();
          ctx.setFontSize(12);
          ctx.setFillStyle("#666");
          ctx.setTextAlign('center');
          ctx.fillText('一起买每人立享' + _this.data.sharedata.money + '元购车返现', winW / 2, winH / 1.79);






          //二维码绘制
          ctx.beginPath();
          var code = codeimg;
          ctx.drawImage(code, winW / 2.78, winH / 1.52, winW / 3.85, winW / 3.85); // 推进去图片

          //长按小程序二维码，立即入团
          ctx.beginPath();
          ctx.setFontSize(12);
          ctx.setFillStyle("#000");
          ctx.setTextAlign('center');
          ctx.fillText('长按小程序二维码 立即入团', winW / 2, winH / 1.17);
          // ctx.draw();
          return ctx

        },
      })
      
      
    }


  },

})
