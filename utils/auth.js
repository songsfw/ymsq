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

function getUserProfile(userInfo){
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '为了您更便捷购物，请先微信授权',
      success:res=>{
        let timestamp = (new Date()).valueOf()
        console.log(res);
        let data = {
          encryptedData: res.encryptedData,
          iv: res.iv,
          openid: userInfo.openid,
          uname:"wxxcx",
          timestamp:timestamp
        }
        api.appLogin(data)
        .then(res=>{
          console.log(res);
          if(!res){
            return
          }
          let result = res.data.result
          let user_info = result.user_info
          if(user_info){
            userInfo.is_authed=result.is_authed
            userInfo.nickname=user_info.nickname
            userInfo.photo=user_info.head_url

            wx.setStorageSync("userInfo", JSON.stringify(userInfo))
            resolve(userInfo)
          }
          
        })
      },
      fail:err=>{
        wx.showToast({
          icon:"none",
          title:"为了您更便捷购物，请先微信授权"
        })
        console.log(err);
      }
    })
  })
}

module.exports = {
  getUserProfile:getUserProfile,
  getLoginInfo:getLoginInfo,
  wxLogin: wxLogin,
  //appLogin: appLogin
};