//index.js
const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
const app = getApp()

Page({
  data: {

    share: {
      tit: "原麦山丘咖啡",
      path: "/pages/caffee/home/home",
      imageUrl: ''
    },
    pop: 0,
    skuNum:1,
    //本页全局计数
    totalNum:0,
    curMenu:0
  },
  changeShop(){
    //let userShop = wx.getStorageSync('userShop')
    // if(!userShop){
    //   wx.showModal({
    //     title: '',
    //     content: '未授权位置，去授权',
    //     cancelText: "取消",
    //     confirmText: "确定",
    //     confirmColor: "#C1996B",
    //     success: res => {
    //       if (res.confirm) {
    //         data.number = -1
    //         this.setCartNum(data)
    //       } else if (res.cancel) {
    //         return
    //       }
    //     }
    //   })
    // }
    this.getShopList()
    this.showShop()
  },
  selectShop(e){
    let id = e.currentTarget.dataset.id
    let initShopInfo = this.data.initShopInfo
    let userShop = initShopInfo.find(item=>{
      return item.id == id
    })
    this.setData({
      userShop:userShop
    })
  },
  confirmShop(){
    let {userShop} = this.data
    wx.setStorageSync('userShop',userShop)
    this.getShopInfo()
    this.setData({
      pop:''
    })
  },
  getShopInfo(){
    let {userShop} = this.data
    let shop_id = userShop?userShop.id:0
    let data = {
      shop_id:shop_id
    }
    api.coffeeList(data).then(res=>{
      console.log(res);
      let {category,spu_data,shop_info} = res
      if(!spu_data){
        wx.showToast({
          icon:"none",
          title:"暂无商品"
        })
        this.setData({
          category,
          proList:[]
        })
        return 
      }
      let proList=[]
      category.forEach((citem,index)=>{
        let pro = {}
        pro.cId = citem.id
        pro.name = citem.name
        pro.list = []
        spu_data.forEach(item=>{
          if(item.category_id == citem.id){
            pro.list.push(item)
          }
        })
        proList.push(pro)
      })
      console.log(proList);
      this.setData({
        category,
        proList
      },()=>{
        let query = wx.createSelectorQuery();
        proList.forEach(item=>{
          query.select('#c-'+item.cId).boundingClientRect();
        })
        query.exec((res)=> {
          console.log(res);
          let posList = []
          res.forEach(item=>{
            posList.push(item.top)
          })
          this.setData({
            posList
          })
        });
      })
      
    })
  },
  getShopList(){
    api.coffeeList().then(res=>{
      console.log(res);
      let {shop_info} = res
      if (shop_info && shop_info.length > 0){
        this.getDistance(shop_info).then(res=>{
          console.log(res);
        }).catch(err=>{
          console.log(err);
        })
      }else{
        wx.showToast({
          icon:"none",
          title:"未获取门店信息"
        })
      }
      
    })
  },
  getDistance(shop_info){
    let _this = this
    let locationList = []
    let userShop = wx.getStorageSync('userShop')
    shop_info.forEach(item=>{
      let location = JSON.parse(item.location)
      let initLocal = {latitude:location.lat,longitude:location.lng}
      locationList.push(initLocal)
    })
    return new Promise((reslove,reject)=>{
      qqmapsdk.calculateDistance({
        from: '', //若起点有数据则采用起点坐标，若为空默认当前地址
        to: locationList, //终点坐标
        success: function(res) {
          console.log(res);
          var distArr = res.result.elements
          distArr.forEach((item,idx)=>{
            shop_info[idx].distance = item.distance
            shop_info[idx].local = item.to
          })
          
          shop_info.sort(function(a,b){
            return a.distance - b.distance
          })
          shop_info.forEach(item=>{
            let dist = item.distance
            dist = dist<1000?dist+'米':util.toFixed(dist/1000,2)+'公里'
            item.distance = dist
          })
          console.log(shop_info);
          
          reslove(shop_info)
          if(!userShop){
            userShop = shop_info[0]
            wx.setStorageSync('userShop',userShop)
          }
          
          _this.setData({
            initShopInfo:shop_info,
            userShop:userShop
          })
        },
        fail: function(error) {
          console.error(error);
          wx.showToast({
            icon:"none",
            title:"位置授权失败"
          })
          reject(shop_info)
          let userShop = shop_info[0]
          _this.setData({
            initShopInfo:shop_info,
            userShop:userShop
          })
        }
      });
    })
    
  },
  toLocation:function(e){
    wx.openLocation({
      latitude: parseFloat(e.currentTarget.dataset.lat),
      longitude: parseFloat(e.currentTarget.dataset.lng),
      name: e.currentTarget.dataset.name,
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  listScroll:util.throttle(function(e){
    let scrollTop = e.detail.scrollTop
    let posList = this.data.posList
    let curMenu = posList.findIndex(item=>{
      return scrollTop<item
    })
    console.log(curMenu);
    this.setData({
      curMenu
    })
  },300),
  getOrder: util.debounce(function () {
    wx.navigateTo({
      url: "/pages/coffee/payOrder/payOrder?shopId="+this.data.userShop.id
    })
    // if (parseFloat(totalPrice) == 0) {
    //   wx.showToast({
    //     icon: "none",
    //     title: "您还没有选择商品哦"
    //   })
    //   return false
    // }
    // api.commitChart(data).then(res => {
    //   wx.hideLoading()
    //   console.log(res)
    //   if (res) {
    //     wx.navigateTo({
    //       url: "/pages/coffee/payOrder/payOrder"
    //     })
    //   }
    // })

  },500,true),
  showCart(){
    this.setData({
      pop: 'cake-panel'
    })
  },
  showShop(e) {
    
    this.setData({
      pop: 'shop-panel'
    })
  },
  handleTouchMove(e){
    e.stopPropagation()
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  onShareAppMessage: function (res) {
    let {proInfo} = this.data
    return {
      title: `原麦山丘咖啡`
    }
  },
  confirmCake:util.debounce(function(e){
    let proId = e.currentTarget.dataset.sku
    let {city_id,skuNum,action,totalNum}=this.data

    let data = {
      city_id: city_id,
      type:'2',
      tab_id:proId,
      number:skuNum
    }

    totalNum = totalNum+skuNum
    api.setChart(data).then(res => {
      console.log(res);
      if(res){
        wx.setStorageSync('total_num',totalNum)
        wx.showToast({
          icon:"none",
          title:'加入购物车成功'
        })
        this.data.proNum = skuNum;
        this.data.totalNum = totalNum;
        this.setData({
          totalNum:totalNum,
          pop:0
        })

        if(this.data.ctabTypeMealIdSpuId){
          app.refreshList(this.data.ctabTypeMealIdSpuId,skuNum);
        }
        
        if(action==1){
          this.data.backNum = 0;
          app.globalData.proType = "2"
          wx.navigateTo({
            url:"/pages/cart/cart/cart"
          })
        }
      }
    })
    wx.reportAnalytics('addcart', {
      type: '蛋糕',
      tab_id: proId,
      city_id: city_id,
      source:'详情页'
    });
  },300,true),
  selectSku(e){
    let skuid = e.currentTarget.dataset.skuid
    let sku_list = this.data.proInfo.sku_list
    let selectSku = Object.assign({},sku_list[skuid])
    console.log(selectSku);
    this.setData({
      //'selectSku.sku_id':skuid,
      selectSku:selectSku
    })
  },
  onPullDownRefresh() { //下拉刷新
    this.getProInfo()
  },
  getProInfo(){
    let data = {
      spu_id:this.data.proId
    }
    wx.showLoading({mask:true})
    api.getCakeProInfo(data).then(res=>{
       wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log(res)
      if(res){
        let selectSku = Object.assign({},res.sku_list[res.sku_id])
        this.setData({
          is_show: true,
          proInfo:res,
          selectSku:selectSku
        })
      }
    })
  },
  onShow(){
    
  },
  async onLoad(options){
    let userInfo = wx.getStorageSync('userInfo')
    let loginInfo = null
    if(!userInfo){
      wx.showLoading({mask:true,title:"登录中..."})
      loginInfo = await app.wxLogin()
      wx.hideLoading()
    }
    qqmapsdk = new QQMapWX({
      key: 'PFTBZ-RUYWU-I64VW-2A3XS-AVAS7-4YBUB'
    });
    let btmHolder = wx.getStorageSync('btmHolder')
    let userShop = wx.getStorageSync('userShop')
    this.setData({
      btmHolder:btmHolder||0,
    })
    if(!userShop){
      let {shop_info} = await api.coffeeList()
      if (shop_info && shop_info.length > 0){
        
        try {
          await this.getDistance(shop_info)
        } catch (error) {
          console.log(error[0]);
        }
        this.getShopInfo()
      }else{
        wx.showToast({
          icon:"none",
          title:"未获取门店信息"
        })
      }
    }else{
      this.getShopInfo()
      this.setData({
        userShop
      })
    }
    
  },
  onUnload: function (e) {
    
  }

})