import {md5} from './md5';

let ENV = 'pro'  //环境 pro:正式  dev:测试
var WITHWHEAT_APPID = "withwheat-10000";
var WITHWHEAT_SECRET = 'b8158eb67da3211012b8ebd0fe76fc79'
var platform = ENV == 'pro' ? 'xcx' : 'wxxcx'
// loading配置，请求次数统计
// function startLoading() {
//   wx.showLoading({ title: '加载中' })
// }
// function endLoading() {
//   wx.hideLoading();
// }
// // 声明一个对象用于存储请求个数
// var requestCount = 0;
// function showLoading() {
//   if (requestCount === 0) {
//     startLoading();
//   }
//   requestCount++;
// };
// function hideLoading() {
//   if (requestCount <= 0) return;
//   requestCount--;
//   if (requestCount === 0) {
//     endLoading();
//   }
// };

const request = (method,url,data,needToken=true)=>{
  var userInfo = wx.getStorageSync("userInfo")
  var openid = userInfo && JSON.parse(userInfo).openid
  let timestamp = (new Date()).valueOf()
  let queryString = "";
  let defData = {
    app_id:WITHWHEAT_APPID,
    platform:platform,
    timestamp:timestamp
  }
  if(needToken && userInfo){
    defData.openid = openid
  }
  console.log(openid)
  Object.assign(defData, data)
  let keys = Object.keys(defData);
  keys.sort();

  keys.forEach((key, index) => {
    queryString += key + defData[key];
  })

  let sign = md5(queryString + WITHWHEAT_SECRET);
  defData.token = sign;

  return new Promise((resolve, reject) => {
    if(!openid && needToken){
      return false
    }
    //showLoading()
    wx.request({
      url:url,
      method: method,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }, 
      data: defData,
      success: function (res) {
        console.log(url)
        console.log('---成功--',res);
        resolve(res)
        //hideLoading()
      },
      fail: function (res) {
        console.log(url)
        console.log("---失败---",res);
        wx.showModal({
          title: '网络错误',
          content: '网络出错，请刷新重试',
          showCancel: false
        })
        //hideLoading()
      }
    })
  })
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        console.log(res);
        let code = res.code
        resolve(code)
      },
      fail: function () {
        wx.showModal({
          title: '登录失败',
          content: '登录失败，请刷新重试',
          showCancel: false
        })
      }
    })
  })
}
function getLoginInfo() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        console.log(res);
        let code = res.code
        resolve(code)
      },
      fail: function () {
        wx.showModal({
          title: '登录失败',
          content: '登录失败，请刷新重试',
          showCancel: false
        })
      }
    })
  })
}

function getReq(url, data = {}, needToken) {
  
  return request("GET",url,data,needToken)
}
function postReq(url, data = {}, needToken) {
  return request("POST",url,data,needToken)
}
// async function postReq(url, data = {}, needToken) {

//   return request("POST",url,data,needToken)
// }

module.exports = {
  GET: getReq,
  POST: postReq,
  ENV:ENV
};	