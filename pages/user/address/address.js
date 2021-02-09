const api = require('../../../utils/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startX: 0, //开始坐标
    startY: 0,
    page: 1,
    address: [],
    source:0
  },
  touchE: function (e) {
    // console.log(e);
    var that = this
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > 168 / 2 ? 336 : 0;

      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;

      //更新列表的状态
      that.setData({
        ['address['+index+'].txtStyle']: txtStyle
      });
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
      //address: this.data.address
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    let address = this.data.address,txtStyle = 0
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
      
      if (touchMoveX < startX){
        txtStyle = startX - touchMoveX
        that.setData({
          ['address['+index+'].txtStyle']: txtStyle
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
  toAdddata(e){
    let type = e.currentTarget.dataset.type
    if(type==1){
      let idx = e.currentTarget.dataset.idx
      let rawAddress = this.data.address[idx]
      let address = {
        city_id:rawAddress.old_city_id,
        id:rawAddress.id,
        name:rawAddress.name,
        city_name:rawAddress.city_name+','+rawAddress.area_name,
        mobile:rawAddress.mobile,
        address:rawAddress.address,
        location:rawAddress.location,
        address_detail:rawAddress.address_detail,
        is_default:rawAddress.is_default,
        user_id:rawAddress.rawAddress,
        title:rawAddress.building,
        is_ziti:rawAddress.is_ziti
      }
      wx.setStorageSync('address', JSON.stringify(address))
    }else{
      wx.setStorageSync('address', '{}')
    }
    wx.navigateTo({
      url:"/pages/user/adddata/adddata?type="+type
    })
  },
  setDefAddress(e){
    let id = e.currentTarget.dataset.id,
    idx = e.currentTarget.dataset.idx
    let addressLi = this.data.address
    let data = {
      address_id:id
    }
    api.setDefAddress(data).then(res => {
      console.log(res);
      if(res){
        let selectAddress = addressLi[idx]
        let {address:addresstxt,id,area_id,area_name,old_city_id,city_name,address_detail,is_default,mobile,name,is_ziti} = selectAddress
        console.log(addresstxt)
        console.log(selectAddress)
        let addressInfo = {
          address: addresstxt,
          id: id,
          area_id: area_id,
          area_name: area_name,
          city_id: old_city_id,
          city_name: city_name,
          address_detail:address_detail,
          is_default:is_default,
          mobile:mobile,
          name:name,
          is_ziti:is_ziti
        }
        wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
        this.getAddress()
        wx.showToast({
          title: '设置成功',
          icon: 'none',
          duration: 3000
        })
      }else{
        wx.showToast({
          title: '设置失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  delAddress(e){
    let id = e.currentTarget.dataset.id,
    idx = e.currentTarget.dataset.idx
    let addressLi = this.data.address
    let data = {
      address_id:id
    }
    api.delAddress(data).then(res => {
      console.log(res);
      if(res){
        let selectAddress = addressLi[idx]
        if(selectAddress.is_default=='1'){
          wx.setStorageSync("addressInfo", '{city_id:10216}')
        }
        this.getAddress()
      }else{
        wx.showToast({
          title: '删除失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  getAddress(){
    api.getAddress().then(res => {
      console.log(res);
      if(res){
        this.setData({
          address:res
        })
      }

      //wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
  selectAdd(e){
    let idx = e.currentTarget.dataset.idx,
    id = e.currentTarget.dataset.id
    let {source,address:addressLi,cartType} = this.data
    
    if(source!=0){
      let  data = {
        address_id:id,
        cart_type:cartType
      }
      api.checkAddress(data).then(res=>{
        console.log(res);
        if(!res){
          wx.hideToast()

          wx.showModal({
            title: '',
            content: '暂无法配送到地址',
            cancelText:"重选地址",
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
        let {address:addresstxt,id,area_id,area_name,old_city_id,city_name,address_detail,is_default,mobile,name} = selectAddress
        console.log(addresstxt)
        console.log(selectAddress)
        let addressInfo = {
          address: addresstxt,
          id: id,
          area_id: area_id,
          area_name: area_name,
          city_id: old_city_id,
          city_name: city_name,
          address_detail:address_detail,
          is_default:is_default,
          mobile:mobile,
          name:name,
          is_ziti:res.is_ziti
        }
        wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
        wx.navigateBack({
          delta: 1
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

    let btmHolder = wx.getStorageSync('btmHolder')

    //选择地址
    //source 1 下单页
    this.setData({
      btmHolder:btmHolder||0,
      cartType:cartType,
      source:source
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