const ajax = require('request.js')
var baseUrl = 'http://api-beta.withwheat.com/v1'
const app = getApp()

//微信登录
function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
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

//获取登录信息
async function getLoginInfo(){
  const res = await wxLogin();
  console.log(res);
  let data = {
    code: res
  };
  return ajax.POST(baseUrl + "/user/xcx-check-login", data,false);
}

//小程序登录  
function appLogin(loginData) {
  return new Promise((resolve, reject) => {
    ajax.POST(baseUrl + "/user/xcx-add-user", loginData)
      .then((res) => {
        console.log("loginInfo", res);
        resolve(res)
      })
      .catch(res => {
        wx.showModal({
          title: '网络错误',
          content: '登录接口错误',
          showCancel: false
        })
      })
  })
}

module.exports = {
  getLoginInfo:getLoginInfo,
  wxLogin: wxLogin,
  appLogin: appLogin
};