#saoLei

### 关于授权 

app.js中已处理授权，同时将token存入缓存

获取token : wx.getStorageSync("token")   //实际上request.js里默认带上了token

未授权会自动跳转到授权页(login)

其他页面不用再考虑授权情况

### 关于请求封装

request.js  目前只封装了GET,POST

默认header里带上了token

```js
const {GET,POST} = require('request.js')
//例
//参数 - obj
let params = {
    cityId:"2",
    filmId:"2"
}
//个性化header - obj
let header = {
    'Content-Type': 'application/x-www-form-urlencoded'
}
//GET(url, params,header)  =>  promise
GET(baseUrl2+"/api/cinema/getShowSeats", params,header).then(res => returnData(res))
```

### 关于自定义导航栏 navBar

navBar

配置:

hasReturn : 是否显示返回按钮  boolean

title : 页面标题 string

hasHome : 是否显示回到首页按钮 boolean

hasCallback : 返回按钮是否有回调函数 boolean

    bindcallback : hasCallback==true 时 监听callback自定义事件,触发回调

//首页用到的

cityName : 所选城市 string

isFold : 是否折叠城市和搜索框 boolean

```html
<navBar hasReturn="{{true}}" hasCallback="{{true}}" title="确认订单" bindcallback="cancelOrder"></navBar>
```

```js
cancelOrder() {
    wx.showModal({
        title: '提示',
        cancelText: "返回",
        confirmText: "继续支付",
        confirmColor: "#F73950",
        content: '返回将取消订单，释放座位',
        success(res) {
        if (res.confirm) {
            console.log('用户点击确定')

        } else if (res.cancel) {
            wx.navigateBack({//返回
            delta: 2
            })
            console.log('用户点击取消')
        }
        }
    })
},
```

### 关于 工具函数 tool.wxs

tool.wxs 为在WXML中执行的若干工具函数，对输出到wxml中的数据做进一步处理

getDate("2020-06-06 12:12:12","MM月dd日") : 格式化时间

fixedFloatNum("add","0.1","0.2") : 修复js浮点数运算精度问题，目前只写了两数相加/乘

//引入
```html
<wxs module="filter" src="../../utils/tools.wxs"></wxs>

<view>{{filter.getDate(filmInfo.filmEndTime,"hh:mm")}}</view>
```


### 关于 util.js 工具函数js

- setWatcher  监听data中属性值变化，类似于vue中的watch方法

onLoad中引入

util.setWatcher(this);

新建方法

```js
watch:{
    'selectCityId':function (value, oldValue){
      if(value==oldValue){
        return
      }
      console.log(value, oldValue);
      this.setData({
        noMoreData: false,
        pageNum: 1,
        nearCinema: null,
        usualCinema: null
      })
      console.log("watch");
      this.getCinema({ cityId: value, areaId: '' })
    }
}
```