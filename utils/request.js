import {md5} from './md5';

var WITHWHEAT_APPID = "withwheat-10000";
var WITHWHEAT_SECRET = 'b8158eb67da3211012b8ebd0fe76fc79'

// loading配置，请求次数统计
function startLoading() {
  wx.showLoading({ title: '加载中' })
}
function endLoading() {
  wx.hideLoading();
}
// 声明一个对象用于存储请求个数
var requestCount = 0;
function showLoading() {
  if (requestCount === 0) {
    startLoading();
  }
  requestCount++;
};
function hideLoading() {
  if (requestCount <= 0) return;
  requestCount--;
  if (requestCount === 0) {
    endLoading();
  }
};

const request = (method,url,data,needToken=true)=>{
  let timestamp = (new Date()).valueOf()
  let queryString = "";
  let defData = {
    app_id:WITHWHEAT_APPID,
    platform:'wxxcx',
    timestamp:timestamp
  }
  if(needToken){
    var userInfo = wx.getStorageSync("userInfo")
    if(userInfo){
      var openid=JSON.parse(userInfo).openid
    }
    console.log(openid)
    defData.openid = openid
  }
  Object.assign(defData, data)
  let keys = Object.keys(defData);
  keys.sort();

  keys.forEach((key, index) => {
    queryString += key + defData[key];
  })

  let sign = md5(queryString + WITHWHEAT_SECRET);
  defData.token = sign;

  return new Promise((resolve, reject) => {
    // if(!sign && needToken){
    //   return false
    // }
    showLoading()
    wx.request({
      url:url,
      method: method,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }, 
      data: defData,
      success: function (res) {
        resolve(res)
        hideLoading()
      },
      fail: function (res) {
        wx.showModal({
          title: '网络错误',
          content: '网络出错，请刷新重试',
          showCancel: false
        })
        reject(res)
        hideLoading()
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

module.exports = {
  GET: getReq,
  POST: postReq
};	