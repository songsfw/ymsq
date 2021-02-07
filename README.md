### 关于请求封装

request.js  目前只封装了GET,POST

默认header里带上了openid

```js
const {GET,POST} = require('request.js')
//例
//参数 - obj
let params = {
    cityId:"2",
    proId:"2"
}

//GET(url, params)  =>  promise
GET(baseUrl2+"/home/home", params).then(res => returnData(res))
```

### 关于自定义导航栏 navBar

navBar

配置:

hasReturn : 是否显示返回按钮  boolean

title : 页面标题 string

hasHome : 是否显示回到首页按钮 boolean

//首页用到的

cityName : 定位地址/用户地址 string

```html
<navBar hasReturn="{{true}}" title="确认订单"></navBar>
```

### 关于 工具函数 tool.wxs

tool.wxs 为在WXML中执行的若干工具函数，对输出到wxml中的数据做进一步处理

formatNumber   单数字补0

hidenPhone   隐藏手机号中间4位

paseIntNum   返回整数

getDate("2020-06-06 12:12:12","MM月dd日") : 格式化时间

fixedFloatNum("add","0.1","0.2") : 修复js浮点数运算精度问题，目前只写了两数相加/乘

//引入
```html
<wxs module="filter" src="../../utils/tools.wxs"></wxs>

<view>{{filter.getDate(filmInfo.filmEndTime,"hh:mm")}}</view>
```


### 关于 util.js 工具函数js

formatDate   - 时间格式化 为 /

isMobile     验证手机

formatTime   传入时间(new Date())返回 / 分割的年月日

getTime      传入时间(2020/12/12 12:12:12)  返回 : 分割的时分

getDate      传入时间(2020/12/12 12:12:12)  返回12月12日

formatePrice  价格补零   12 => 12.00

floatObj     js小数运算精度修复 util.floatObj().add(a,b,digits)    支持 + - * /

toFixed    修复js toFixed精度

debounce   防抖

getLocation  获取经纬度，如果用户拒绝，默认北京

bezier     bezier (points, times,arc)   三个点坐标，时间，是否反向

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