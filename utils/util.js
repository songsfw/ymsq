const formatDate = date => {
  return date.split("-").join("/")
}

//验证手机正则
const isMobile = (mobile) => {
  return (/^(?:13\d|16\d|15\d|17\d|18\d|145|147)-?\d{5}(\d{3}|\*{3})$/.test(mobile));
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // const hour = date.getHours()
  // const minute = date.getMinutes()
  // const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/')
}

const getTime = function (date) {
  let currTime = new Date(date);
  const hour = currTime.getHours()
  const minute = currTime.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}

const getDate = function (date) {
  let currTime = new Date(date);
  const month = currTime.getMonth() + 1
  const day = currTime.getDate()

  return `${month}月${day}日`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//手机号校验正则
let mobileRegularPattern = /^1[345678]\d{9}$/

let mailReg = function (val) {
  var reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
  return reg.test(val)
}

function setTabBarBadge(num){
  let totalNum = num
  if(totalNum>0){
    if(totalNum>=100){
      totalNum = '99+';
    }
    wx.setTabBarBadge({ 
      index: 2,
      text: totalNum.toString()
    })
  }else{
    wx.removeTabBarBadge({
      index: 2
    })
  }
}

let getQueryRandValue = function () {
  var currDate = new Date();
  return currDate.getTime();
}

let countDowns = function (curTime, endTime) {
  var _this = this
  var str;
  let newTime = curtime;

  if (endTime - newTime > 0) {
    let time = (endTime - newTime) / 1000;
    // 获取天、时、分、秒
    let day = parseInt(time / (60 * 60 * 24));
    let hou = parseInt(time % (60 * 60 * 24) / 3600);
    let min = formatNumber(parseInt(time % (60 * 60 * 24) % 3600 / 60));
    let sec = formatNumber(parseInt(time % (60 * 60 * 24) % 3600 % 60));

    if (day > 0) {
      str = day + '天' + hou + '小时' + min + '分钟' + sec + '秒'
    } else {
      str = hou + '小时' + min + '分钟' + sec + '秒'
    }
    newTime = newTime + 1000
  } else {//活动已结束，全部设置为'00'
    str = '已结束'
  }

  _this.setData({
    countDowntxt: str,
  })

  let timer = setTimeout(function () {
    countDowns()
  }, 1000);

}

function formatePrice(num){
  let price = num.toString()
  let rs = price.indexOf('.'); 
  if (rs < 0) { 
    rs = price.length; 
    price += '.'; 
  } 
  while (price.length <= rs + 2) { 
    price += '0'; 
  }
  return price
}

function floatObj() {

  /*
   * 判断obj是否为一个整数
   */
  function isInteger(obj) {
    return Math.floor(obj) === obj
  }

  /*
   * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
   * @param floatNum {number} 小数
   * @return {object}
   *   {times:100, num: 314}
   */
  function toInteger(floatNum) {
    var ret = { times: 1, num: 0 }
    if (isInteger(floatNum)) {
      ret.num = floatNum
      return ret
    }
    var strfi = floatNum + ''
    var dotPos = strfi.indexOf('.')
    var len = strfi.substr(dotPos + 1).length
    var times = Math.pow(10, len)
    var intNum = parseInt(floatNum * times + 0.5, 10)
    ret.times = times
    ret.num = intNum
    return ret
  }

  /*
   * 核心方法，实现加减乘除运算，确保不丢失精度
   * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
   *
   * @param a {number} 运算数1
   * @param b {number} 运算数2
   * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
   * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
   *
   */
  function operation(a, b, digits=2, op) {
    var o1 = toInteger(a)
    var o2 = toInteger(b)
    var n1 = o1.num
    var n2 = o2.num
    var t1 = o1.times
    var t2 = o2.times
    var max = t1 > t2 ? t1 : t2
    var result = null
    switch (op) {
      case 'add':
        if (t1 === t2) { // 两个小数位数相同
          result = n1 + n2
        } else if (t1 > t2) { // o1 小数位 大于 o2
          result = n1 + n2 * (t1 / t2)
        } else { // o1 小数位 小于 o2
          result = n1 * (t2 / t1) + n2
        }
        return toFixed(result / max,digits)
      case 'subtract':
        if (t1 === t2) {
          result = n1 - n2
        } else if (t1 > t2) {
          result = n1 - n2 * (t1 / t2)
        } else {
          result = n1 * (t2 / t1) - n2
        }
        return toFixed(result / max,digits)
      case 'multiply':
        result = (n1 * n2) / (t1 * t2)
        return toFixed(result,digits)
      case 'divide':
        result = (n1 / n2) * (t2 / t1)
        return toFixed(result,digits)
    }
  }

  // 加减乘除的四个接口
  function add(a, b, digits) {
    return operation(a, b, digits, 'add')
  }
  function subtract(a, b, digits) {
    return operation(a, b, digits, 'subtract')
  }
  function multiply(a, b, digits) {
    return operation(a, b, digits, 'multiply')
  }
  function divide(a, b, digits) {
    return operation(a, b, digits, 'divide')
  }

  // exports
  return {
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide
  }
}
function toFixed(num, s) {
  var times = Math.pow(10, s)
  var des = num * times + 0.5
  des = parseInt(des, 10) / times
  return des + ''
}

const loadImg = function (url) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success(res) {
        resolve(res)
      }
    })
  })
}

//获取指定区间的随机整数
const getRandom = (lowerValue, upperValue, isFormat) => {
  const num = Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
  if (isFormat) {
    return formatNumber(num);
  } else {
    return num
  }
}
//节流函数
const throttle = (func, interval = 250) => {
  let timeout;
  let startTime = new Date();
  return function (event) {
    clearTimeout(timeout);
    let curTime = new Date();
    if (curTime - startTime <= interval) {
      //小于规定时间间隔时，用setTimeout在指定时间后再执行
      timeout = setTimeout(() => {
        func.call(this, event);
      }, interval)
    } else {
      //重新计时并执行函数
      startTime = curTime;
      func.call(this, event);
    }
  }
}

function debounce(func, wait = 250, immediate = false) {
  let timer;
  return function () {
    let context = this,
      args = arguments;

    if (timer) clearTimeout(timer);
    if (immediate) {
      let callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      if (callNow) func.apply(context, args);
    } else {
      timer = setTimeout(() => {
        func.apply(context, args)
      }, wait)
    }
  }
}

function getLocation() {
  return new Promise((resolve, reject) => {

    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        let location = {
          latitude: latitude,
          longitude: longitude
        }
        resolve(location)
      },
      fail(err) {
        wx.showToast({
          icon:"none",
          title:"定位失败，默认到北京"
        })
        let location = {
          latitude: '39.8999',
          longitude: '116.3980'
        }
        console.log(err)
        reject(location)
      }
    })
  })
}

function getLocaltionSet() {
  wx.getSetting({
    success: res => {
      if (res.authSetting['scope.userLocation']) {
        return getLocation()
      } else {
        return openLocationSet()
      }
    }
  })
}

//拒绝位置授权之后呼起权限设置
function openLocationSet() {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '',
      content: '需要先授权定位才可获得您的位置信息',
      confirmText: "打开定位",
      success(res) {
        if (res.confirm) {
          wx.openSetting({
            success(data) {
              if (data.authSetting['scope.userLocation']) {
                resolve(true)
              }
            }
          })
        }
      }
    })
  })
}

function charLen(inputVal){    
    //去除首尾空格    
    let inputValinputVal = inputVal.replace(/^\s*|\s*$/g,"");    
    //零长字串不作处理    
    if ( inputVal.length == 0 )    
    {    
        return;    
    }    
    //只能匹配数字,字母或汉字    
    var _match = inputVal.match(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/g);    
    //匹配数字或字母(包括大小写)    
    var codeMatch = inputVal.match(/[a-zA-Z0-9]/g);    
    //匹配汉字    
    var charMatch = inputVal.match(/[\u4e00-\u9fa5]/g);    
    //数字或字母个数    
    var codeNum = codeMatch ? codeMatch.length : 0;    
    //汉字个数    
    var charNum = charMatch ? charMatch.length : 0; 
    var len = _match && codeNum + 2*charNum   
    
    return len
}    

function bezier (points, times,arc) {
  // 0、以3个控制点为例，点A,B,C,AB上设置点D,BC上设置点E,DE连线上设置点F,则最终的贝塞尔曲线是点F的坐标轨迹。
  // 1、计算相邻控制点间距。
  // 2、根据完成时间,计算每次执行时D在AB方向上移动的距离，E在BC方向上移动的距离。
  // 3、时间每递增100ms，则D,E在指定方向上发生位移, F在DE上的位移则可通过AD/AB = DF/DE得出。
  // 4、根据DE的正余弦值和DE的值计算出F的坐标。
  // 邻控制AB点间距

  var bezier_points = [];
  var points_D = [];
  var points_E = [];
  const DIST_AB = Math.sqrt(Math.pow(points[1]['x'] - points[0]['x'], 2) + Math.pow(points[1]['y'] - points[0]['y'], 2));
  // 邻控制BC点间距
  const DIST_BC = Math.sqrt(Math.pow(points[2]['x'] - points[1]['x'], 2) + Math.pow(points[2]['y'] - points[1]['y'], 2));
  // D每次在AB方向上移动的距离
  const EACH_MOVE_AD = DIST_AB / times;
  // E每次在BC方向上移动的距离 
  const EACH_MOVE_BE = DIST_BC / times;
  // 点AB的正切
  const TAN_AB = (points[1]['y'] - points[0]['y']) / (points[1]['x'] - points[0]['x']);
  // 点BC的正切
  const TAN_BC = (points[2]['y'] - points[1]['y']) / (points[2]['x'] - points[1]['x']);
  // 点AB的弧度值
  const RADIUS_AB = Math.atan(TAN_AB);
  // 点BC的弧度值
  const RADIUS_BC = Math.atan(TAN_BC);
  // 每次执行
  for (var i = 1; i <= times; i++) {
    // AD的距离
    var dist_AD = EACH_MOVE_AD * i;
    // BE的距离
    var dist_BE = EACH_MOVE_BE * i;
    // D点的坐标
    var point_D = {};
    point_D['x'] = dist_AD * Math.cos(RADIUS_AB) + points[0]['x'];
    point_D['y'] = dist_AD * Math.sin(RADIUS_AB) + points[0]['y'];
    points_D.push(point_D);
    // E点的坐标
    var point_E = {};
    point_E['x'] = dist_BE * Math.cos(RADIUS_BC) + points[1]['x'];
    point_E['y'] = dist_BE * Math.sin(RADIUS_BC) + points[1]['y'];
    points_E.push(point_E);
    // 此时线段DE的正切值
    var tan_DE = (point_E['y'] - point_D['y']) / (point_E['x'] - point_D['x']);
    // tan_DE的弧度值
    var radius_DE = Math.atan(tan_DE);
    // 此时DE的间距
    var dist_DE = Math.sqrt(Math.pow((point_E['x'] - point_D['x']), 2) + Math.pow((point_E['y'] - point_D['y']), 2));
    // 此时DF的距离
    var dist_DF = (dist_AD / DIST_AB) * dist_DE;
    // 此时DF点的坐标
    var point_F = {};
    point_F['x'] = dist_DF * Math.cos(radius_DE) + point_D['x'];
    point_F['y'] = dist_DF * Math.sin(radius_DE) + point_D['y'];
    if(arc){
      bezier_points.unshift(point_F);
    }else{
      bezier_points.push(point_F);
    }
    
  }
  return {
    'bezier_points': bezier_points
  };
}

function setWatcher(page) {
  let data = page.data;
  let watch = page.watch;
  Object.keys(watch).forEach(v => {
    let key = v.split('.'); // 将watch中的属性以'.'切分成数组
    let nowData = data; // 将data赋值给nowData
    for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
      nowData = nowData[key[i]]; // 将nowData指向它的key属性对象
    }
    let lastKey = key[key.length - 1];
    // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
    let watchFun = watch[v].handler || watch[v]; // 兼容带handler和不带handler的两种写法
    let deep = watch[v].deep; // 若未设置deep,则为undefine
    observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
  })
}
/**
 * 监听属性 并执行监听函数
 */
function observe(obj, key, watchFun, deep, page) {
  var val = obj[key];
  // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
  if (deep && val != null && typeof val === 'object') {
    Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
      observe(val, childKey, watchFun, deep, page); // 递归调用监听函数
    })
  }
  let that = this;
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    set: function (value) {
      watchFun.call(page, value, val); // value是新值，val是旧值
      val = value;
      if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
        observe(obj, key, watchFun, deep, page);
      }
    },
    get: function () {
      return val;
    }
  })
}

module.exports = {
  isMobile: isMobile,
  loadImg: loadImg,
  mailReg: mailReg,
  floatObj: floatObj,
  throttle: throttle,
  debounce: debounce,
  getRandom: getRandom,
  formatNumber: formatNumber,
  getTime: getTime,
  formatTime: formatTime,
  countDowns: countDowns,
  getDate: getDate,
  getQueryRandValue: getQueryRandValue,
  getLocation: getLocation,
  getLocaltionSet: getLocaltionSet,
  openLocationSet: openLocationSet,
  setWatcher: setWatcher,
  formatDate: formatDate,
  toFixed,
  formatePrice,
  bezier,
  charLen,
  setTabBarBadge
}
