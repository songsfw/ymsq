const {GET,POST,ENV} = require('request.js')
console.log(ENV);
//var baseUrl = 'https://api-beta.withwheat.com/v1'
var baseUrl = ENV == 'pro' ? 'https://api.withwheat.com/v1' : 'https://api-beta.withwheat.com/v1'

const returnData = (res,needToast=false)=>{
  if(res.statusCode == 200){
    let data = res.data
    console.log(data)
    if(data.status==0){
      var result = data.result
      return result
    }else if(data.status==-5){
      return false
    }else if(data.status==1001){
      
    }else if(data.status==1022){
      console.log('未绑定手机');
      return '1022'
    }else if(data.status==5016){
      return false
    }else{
      //特殊状态特殊处理
      if(needToast){
        return data
      }
      //特殊状态统一处理
      if(data.message){
        wx.showToast({
          icon:"none",
          title:data.message,
          duration:2000
        })
      }
      console.log("111");
      return false
    }
  }else if(res.statusCode == 500){
    // wx.showModal({
    //   title: '网络繁忙',
    //   content: '网络繁忙，请刷新重试',
    //   showCancel: false
    // })
    console.log('500：接口/参数错误');
  }
}

//微信登录
const getLoginInfo = (data) => {
  console.log(data);
  return POST(baseUrl+"/user/xcx-check-login", data,false)
}

//用户登录
const appLogin = (data) => {
  return POST(baseUrl+"/user/xcx-add-user", data).catch(e=>{
    console.log(e);
  })
}

//首页信息
const getIndexInfo = (data) => {
  return POST(baseUrl+"/home/home", data).then(res => returnData(res))
}

//获取会员卡
const getVipCard = () => {
  return POST(baseUrl + "/user/user-card").then(res => returnData(res))
}

//用户地址列表
const getAddress = (data) => {
  
  return POST(baseUrl+"/user-address/list", data).then(res => returnData(res))
}

//是否可配送
const checkAddressInMap = (data) => {
  
  return POST(baseUrl+"/user-address/check-address", data).then(res => returnData(res))
}

//添加地址
const addAddress = (data) => {
  return POST(baseUrl+"/user-address/create", data).then(res => returnData(res))
}

//验证地址
const checkAddress = (data) => {
  return POST(baseUrl+"/user-address/choose-address", data).then(res => returnData(res))
}

//修改地址
const editAddress = (data) => {
  return POST(baseUrl+"/user-address/update", data).then(res => returnData(res))
}

//设为默认配送地址
const setDefAddress = (data) => {
  return POST(baseUrl+"/user-address/set-default", data).then(res => returnData(res))
}

//删除地址
const delAddress = (data) => {
  return POST(baseUrl+"/user-address/delete", data).then(res => returnData(res))
}

//余额首页
const getAccount = () => {
  return POST(baseUrl+"/user-balance/index").then(res => returnData(res))
}

//我的首页
const getUserCenter = () => {
  return POST(baseUrl+"/user/user-center").then(res => returnData(res))
}

//充值列表
const chargeList = () => {
  return POST(baseUrl+"/user-balance/recharge-rule").then(res => returnData(res))
}

//流水列表
const balanceList = (data) => {
  return POST(baseUrl+"/user-balance/list",data).then(res => returnData(res))
}

//配送城市
const getCity = (data) => {
  
  return POST(baseUrl+"/user-address/get-allow-city", data).then(res => returnData(res))
}

//微信充值
const wxCharge = (data) => {
  
  return POST(baseUrl+"/user-balance/pre-pay", data).then(res => returnData(res))
}

//纪念日
const getMemoDay = () => {
  
  return POST(baseUrl+"/user-big-day/list").then(res => returnData(res))
}

//修改纪念日
const setMemoDay = (data) => {
  
  return POST(baseUrl+"/user-big-day/update", data).then(res => returnData(res))
}

//免密首页
const freePayInfo = () => {
  
  return POST(baseUrl+"/user/free-password-config").then(res => returnData(res))
}

//优惠券列表
const getCoupon = () => {
  
  return POST(baseUrl+"/user-promotion/list").then(res => returnData(res))
}

//充值卡
const chashCharge = (data) => {
  return POST(baseUrl+"/user-balance/recharge-cash-card",data).then(res => returnData(res))
}

//校验密码
const verifyPwd = (data) => {
  return POST(baseUrl+"/user/check-pay-pwd",data).then(res => returnData(res))
}

//更改免密支付状态
const changeFreePay = (data) => {
  return POST(baseUrl+"/user/change-free-status",data).then(res => returnData(res))
}

//设置免密金额
const setAmount = (data) => {
  return POST(baseUrl+"/user/set-free-amount",data).then(res => returnData(res))
}

//修改密码
const setNewPwd = (data) => {
  return POST(baseUrl+"/user/update-password",data).then(res => returnData(res))
}

//设置密码
const setPwd = (data) => {
  return POST(baseUrl+"/user/set-password",data).then(res => returnData(res))
}

//获取验证码
const getCode = (data) => {
  return POST(baseUrl+"/user/mobile-verify",data).then(res => returnData(res))
}

//验证验证码
const verifyCode = (data) => {
  return POST(baseUrl+"/user/valid-code",data).then(res => returnData(res))
}

//绑定手机
const bindPhone = (data) => {
  return POST(baseUrl+"/user/bind-mobile",data).then(res => returnData(res))
}

//产品列表
const getProList = (data) => {
  return POST(baseUrl+"/product/list",data).then(res => returnData(res))
}

//添加购物车
const setChart = (data) => {
  return POST(baseUrl+"/cart/add",data).then(res => returnData(res))
}
//购物车数据
const getChartData = (data) => {
  return POST(baseUrl+"/cart/list",data).then(res => returnData(res))
}

//选中/不选
const selectPro = (data) => {
  return POST(baseUrl+"/cart/select",data).then(res => returnData(res))
}

//全选/全不选
const selectAllPro = (data) => {
  return POST(baseUrl+"/cart/select-all",data).then(res => returnData(res))
}

//删除商品
const deletePro = (data) => {
  return POST(baseUrl+"/cart/delete",data).then(res => returnData(res))
}

//验证购物车是否可提交
const commitChart = (data) => {
  return POST(baseUrl+"/cart/commit",data).then(res => returnData(res))
}

//混合订单
const getMixOrder = (data) => {
  return POST(baseUrl+"/order/cart",data).then(res => returnData(res))
}

//面包订单
const getOrderBread = (data) => {
  return POST(baseUrl+"/order/bread-cart",data).then(res => returnData(res))
}
//蛋糕订单
const getOrderCake = (data) => {
  return POST(baseUrl+"/order/cake-cart",data).then(res => returnData(res))
}

//提交订单
const submmitOrder = (data) => {
  return POST(baseUrl+"/order/submit-order",data).then(res => returnData(res,true))
}

//支付
const payOrder = (data) => {
  return POST(baseUrl+"/order/pay-order",data).then(res => returnData(res))
}

//使用现金卡
const useCard = (data) => {
  return POST(baseUrl+"/order/cash-card",data).then(res => returnData(res))
}

//分享订单信息
const preShareOrder = (data) => {
  return POST(baseUrl+"/share/pre-share-order",data).then(res => returnData(res))
}

//分享订单
const shareOrder = (data) => {
  return POST(baseUrl+"/share/share-order",data).then(res => returnData(res))
}

//生成海报
const createPoster = (data) => {
  return POST(baseUrl+"/share/create-poster",data).then(res => returnData(res))
}

//详情页
const getProInfo = (data) => {
  return POST(baseUrl+"/product/bread",data).then(res => returnData(res))
}
const getCakeProInfo = (data) => {
  return POST(baseUrl+"/product/cake",data).then(res => returnData(res))
}

const getUserLocation = (data) => {
  console.log(data)
  return POST(baseUrl+"/home/get-city",data).then(res => returnData(res))
}

//订单列表
const orderList = (params) => {
  console.log(JSON.stringify(params))
  return POST(baseUrl + "/order/list", params)
  .then(res => returnData(res))
}

//订单详情
const getOrderInfo = (params) => {
  console.log(JSON.stringify(params))
  return POST(baseUrl + "/order/order-detail", params).then(res => returnData(res))
}

//取消订单
const cancleOrder = (params) => {
  console.log(JSON.stringify(params))
  return POST(baseUrl + "/order/cancel-order", params).then(res => returnData(res))
}

//添加配件
const addFittings = (params) => {
  console.log(JSON.stringify(params))
  return POST(baseUrl + "/cart/add-fittings", params).then(res => returnData(res))
}

//麦点
const maidian = (params) => {
  return POST(baseUrl + "/user-point/list", params).then(res => returnData(res))
}

//配送范围
const deliveryList = () => {
  return POST(baseUrl + "/user-address/delivery-list").then(res => returnData(res))
}

//配送范围
const deliveryPoints = (data) => {
  return POST(baseUrl + "/user-address/get-points",data).then(res => returnData(res))
}

//评论
const getComment = (data) => {
  return POST(baseUrl + "/share/pre-order-comment",data).then(res => returnData(res))
}

//评论
const setComment = (data) => {
  return POST(baseUrl + "/share/order-comment",data).then(res => returnData(res))
}

//评论列表
const getCommitList = (params) => {
  return POST(baseUrl + "/comment/list", params).then(res => returnData(res))
}

//领取列表
const hongbao = (data) => {
  return POST(baseUrl + "/share/receive-list",data).then(res => returnData(res))
}

//领取红包
const getHongbao = (data) => {
  return POST(baseUrl + "/share/get-red-package",data).then(res => returnData(res))
}

//反馈
const feedBack = (data) => {
  return POST(baseUrl + "/user-feedback/create",data).then(res => returnData(res))
}
//跟新用户信息
const changeUserInfo = (data) => {
  return POST(baseUrl + "/user/change-user-info",data).then(res => returnData(res))
}

//门店券
const storeCoupon = (data) => {
  return POST(baseUrl + "/user-promotion/promotion-use-shop",data).then(res => returnData(res))
}

//配送详情
const deliveryInfo = (data) => {
  return POST(baseUrl + "/order/delivery-detail",data).then(res => returnData(res))
}

//说明
const getIntroduction = () => {
  return POST(baseUrl + "/base/instructions").then(res => returnData(res))
}

//绑定微信手机
const wxPhone = (data) => {
  return POST(baseUrl + "/user/wx-bind-mobile",data).then(res => returnData(res))
}

const submitOrder = (params) => {
  console.log(JSON.stringify(params))
  //如果需要自定义不同code对应的msg,可以不用在这调用then，去具体的方法中处理不同的code
  return POST(baseUrl + "/order/submitOrder", params)
}

const keywordList = (params) => {
  //热词与历史列表
  return POST(baseUrl + "/product/search-keyword", params).then(res => returnData(res));
}

const keywordSearch = (params) => {
  //关键字搜索
  return POST(baseUrl + "/product/search-list", params).then(res => returnData(res));
}

const getGameInfo = (params) => {
  //游戏信息
  return POST(baseUrl + "/lottery/info", params).then(res => returnData(res));
}

const getGift = (params) => {
  //抽奖
  return POST(baseUrl + "/lottery/take-out", params).then(res => returnData(res));
}

const getGiftList = (params) => {
  //中奖记录
  return POST(baseUrl + "/lottery/lottery-history", params).then(res => returnData(res));
}

const startGame = (params) => {
  //校验游戏开始
  return POST(baseUrl + "/lottery/before-take-out", params).then(res => returnData(res,true));
}

const exChangeCoupon = (params) => {
  //兑换优惠券
  return POST(baseUrl + "/user-promotion/convert-code", params).then(res => returnData(res,true));
}

const getDeliveryLocal = (params) => {
  //兑换优惠券
  return POST(baseUrl + "/order/get-dispatcher-location", params).then(res => returnData(res,true));
}

module.exports = {
  getIndexInfo:getIndexInfo,
  getUserLocation:getUserLocation,
  getAddress:getAddress,
  delAddress:delAddress,
  getAccount:getAccount,
  getUserCenter:getUserCenter,
  getMemoDay:getMemoDay,
  chargeList:chargeList,
  setMemoDay:setMemoDay,
  freePayInfo:freePayInfo,
  getCoupon:getCoupon,
  getCity:getCity,
  addAddress:addAddress,
  editAddress:editAddress,
  balanceList:balanceList,
  setDefAddress:setDefAddress,
  getVipCard:getVipCard,
  wxCharge:wxCharge,
  chashCharge:chashCharge,
  verifyPwd,
  changeFreePay,
  setAmount,
  setNewPwd,
  getCode,
  verifyCode,
  setPwd,
  getProList,
  setChart,
  getChartData,
  selectPro,
  selectAllPro,
  commitChart,
  deletePro,
  getOrderBread,
  getOrderCake,
  submmitOrder,
  useCard,
  payOrder,
  shareOrder,
  preShareOrder,
  createPoster,
  getProInfo,
  getCakeProInfo,
  orderList,
  getOrderInfo,
  cancleOrder,
  addFittings,
  checkAddress,
  maidian,
  deliveryList,
  deliveryPoints,
  getComment,
  setComment,
  hongbao,
  getHongbao,
  bindPhone,
  getLoginInfo,
  appLogin,
  feedBack,
  storeCoupon,
  deliveryInfo,
  wxPhone,
  getIntroduction,
  keywordSearch,
  keywordList,
  getCommitList,
  changeUserInfo,
  getGameInfo,
  getGift,
  getGiftList,
  startGame,
  exChangeCoupon,
  getDeliveryLocal,
  checkAddressInMap,
  getMixOrder
}
