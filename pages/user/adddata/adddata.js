const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
const app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{
      name:null,
      mobile:null,
      address:null,
      address_detail:null,
      is_default:0
    },
    is_default:0
    
  },
  setDefault(){
    let checked = this.data.is_default
    console.log(checked);
    checked==1?checked=0:checked=1
    this.setData({
      is_default:checked
    })
  },
  selectAdd(){
    let {address,type}=this.data
    console.log(address)
    //未提交情况下保存未填完信息
    wx.setStorageSync('address', JSON.stringify(address))
    wx.navigateTo({
      url:"/pages/user/selectAdd/selectAdd?type="+type
    })
  },
  checkAddress(id,cart_type){
    let data = {
      address_id: id,
    }
    if(cart_type&&cart_type!=0){
      data.cart_type = cart_type
    }
    return api.checkAddress(data)
  },
  addAddress(){
    console.log(this.data.address)
    let {id,address, address_detail, mobile, name,location,district,province,title,city_id} = this.data.address
    let is_default = this.data.is_default
    console.log(this.data)
    let source = this.data.source
    let newAdd = {address:address}

    if(!name){
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!mobile){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }else if(!util.isMobile(mobile)){
      wx.showToast({
        title: '请填写正确的手机号，如:13012345678',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!address){
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(!address_detail){
      wx.showToast({
        title: '请填写详细收货地址',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    location = JSON.parse(location)
    // if(this.data.type=="1"){
    //   let city_area = this.data.address.city_name.split(',')
    //   newAdd['province']= city_area[0]
    //   newAdd['district']= city_area[1]
    // }else{
      newAdd['province']=this.data.address.province;
      newAdd['district']=this.data.address.district;
    //}
   
    newAdd.location = location
    newAdd.title=title
    newAdd = JSON.stringify(newAdd)

    let data = {
      name:name,
      address:newAdd,
      address_detail:address_detail,
      is_default:is_default,
      mobile:mobile,
      title:title,
    }
    wx.showLoading({mask:true})
    //修改
    if(this.data.type=="1"){
      data.id = id
      console.log(data)
      api.editAddress(data).then(res => {
        wx.hideLoading()
        console.log(res);
        if(res){
          
          let addressInfo = {
            address: address,
            id: id,
            city_id: res.city_id,
            address_detail:address_detail,
            is_default:is_default,
            mobile:mobile,
            name:name,
            is_ziti:res.is_ziti
          }
          if(source=='1'){
            //订单结算页
            //切换城市后 重置所选商品类型 1 面包 2 蛋糕
            app.globalData.proType=''
            wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 3];//上一个页面
            //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
            // prevPage.setData({
            //   changedId: id
            // })
            prevPage.hasChangeAddress&&prevPage.hasChangeAddress()
            wx.navigateBack({
              delta: 2
            })
          }else{
            if(is_default==1){
              wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
            }
            wx.navigateBack({
              delta: 1
            })
          }

        }
      })
    }else{
      console.log(data)
      api.addAddress(data).then(res => {
        console.log(res);
        wx.hideLoading()
        if(res){
          
          let addressInfo = {
            address: address,
            id: res.address_id,
            city_id: res.city_id,
            address_detail:address_detail,
            is_default:is_default,
            mobile:mobile,
            name:name,
            is_ziti:res.is_ziti
          }
          if(source=='1'){
            //切换城市后 重置所选商品类型 1 面包 2 蛋糕
            app.globalData.proType=''
            wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 3];//上一个页面
            //直接调用上一个页面的更改订单结算地址显示
            // prevPage.setData({
            //   changedId: ''
            // })
            prevPage.hasChangeAddress&&prevPage.hasChangeAddress()
            wx.navigateBack({
              delta: 2
            })
          }else{
            if(is_default==1){
              wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
            }
            wx.navigateBack({
              delta: 1
            })
          }

        }
      })
    }
  },
  inputName:function(e){
    this.setData({
      'address.name':e.detail.value
    })
    console.log(this.data.address.name)
  },
  inputMobi:function(e){
    this.setData({
      'address.mobile':e.detail.value
    })
  },
  inputAdd:function(e){
    this.setData({
      'address.address_detail':e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    console.log(currPage)
    let options = currPage.options

    //合并新老options
    options = Object.assign(options,currPage.__data__.options || {})

    //中途跳出到地图选址页后带参数返回来
    let newAddress = options.address,lng=options.lng,lat=options.lat,type=options.type,province = options.province,district=options.district,title=options.title
    console.log(options);
    let source = options.source
    if(type==1){
      wx.setNavigationBarTitle({
        title: '修改地址' 
      })
    }else{
      wx.setNavigationBarTitle({
        title: '添加地址' 
      })
    }

    let oldAddress = this.data.address
    console.log(oldAddress);

    let address = wx.getStorageSync('address') || '{}'
    console.log(address);

    address = JSON.parse(address)
    //地图选址页返回后
    if(newAddress){
      address.address = newAddress
      address.province = province
      address.district = district
      address.location = `{"lng":${lng},"lat":${lat}}`
      address.title=title
    }
    //合并新老地址信息
    Object.assign(oldAddress,address)
    console.log(oldAddress);
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    this.setData({
      is_default:address.is_default,
      source:source,
      btmHolder:btmHolder,
      type:type,
      address:oldAddress,
    })

    console.log(this.data.options);
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