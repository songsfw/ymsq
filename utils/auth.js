const api = require('api.js')
//微信登录
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

//获取登录信息
async function getLoginInfo(){
  const res = await wxLogin();
  console.log(res);
  let data = {
    code: res
  };
  return api.getLoginInfo(data)
}

module.exports = {
  getLoginInfo:getLoginInfo,
  wxLogin: wxLogin,
  //appLogin: appLogin
};