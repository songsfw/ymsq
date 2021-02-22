const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
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
    }
    
  },
  setDefault(){
    let checked = this.data.address.is_default
    console.log(checked);
    checked==1?checked=0:checked=1
    this.setData({
      'address.is_default':checked
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
  addAddress(){
    console.log(this.data.address)
    let {id,address, address_detail, mobile, name,is_default,location,district,province,title,is_ziti,city_id} = this.data.address
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
    newAdd.location = location
    newAdd.title=title
    newAdd.province=province
    newAdd.district=district
    newAdd = JSON.stringify(newAdd)
    console.log(newAdd)

    let data = {
      name:name,
      address:newAdd,
      address_detail:address_detail,
      is_default:is_default,
      // city_name:city_name,
      mobile:mobile,
      title:title
    }

    //修改
    if(this.data.type=="1"){
      data.id = id
      console.log(data)
      api.editAddress(data).then(res => {
        console.log(res);
        if(res){
          if(is_default==1){
            let addressInfo = {
              address: address,
              id: id,
              city_id: res.city_id,
              // city_name: city_name,
              address_detail:address_detail,
              is_default:is_default,
              mobile:mobile,
              name:name,
              is_ziti:res.is_ziti
            }
            wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
          }
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }else{
      console.log(data)
      api.addAddress(data).then(res => {
        console.log(res);
        if(res){
          if(is_default==1){
            let addressInfo = {
              address: address,
              id: id,
              city_id: res.city_id,
              //city_name: city_name,
              address_detail:address_detail,
              is_default:is_default,
              mobile:mobile,
              name:name,
              is_ziti:res.is_ziti
            }
            wx.setStorageSync("addressInfo", JSON.stringify(addressInfo))
          }
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
  },
  inputName:util.debounce(function(e){
    this.setData({
      'address.name':e.detail.value
    })
    console.log(this.data.address.name)
  },300),
  inputMobi:util.debounce(function(e){
    this.setData({
      'address.mobile':e.detail.value
    })
  },300),
  inputAdd:util.debounce(function(e){
    this.setData({
      'address.address_detail':e.detail.value
    })
  },300),
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
    let options = currPage.options
    options = Object.assign(options,currPage.__data__.options || {}) 
    let newAddress = options.address,lng=options.lng,lat=options.lat,type=options.type,province = options.province,district=options.district,title=options.title
    console.log(options);

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
    let address = wx.getStorageSync('address') || '{}'
    address = JSON.parse(address)
    if(newAddress){
      address.address = newAddress
      address.province = province
      address.district = district
      address.location = `{"lng":${lng},"lat":${lat}}`
      address.title=title
    }
    Object.assign(oldAddress,address)
    console.log(oldAddress);
    let btmHolder = wx.getStorageSync('btmHolder')
    btmHolder = btmHolder>0?btmHolder:12
    this.setData({
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
  onShareAppMessage: function () {

  }
})