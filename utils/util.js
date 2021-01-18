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
        console.log(result)
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
//乘积保留小数位
// const accMul = function (arg1, arg2, fix) {
//   if (!parseInt(fix) == fix) {
//     return;
//   }
//   var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
//   try { m += s1.split(".")[1].length } catch (e) { }
//   try { m += s2.split(".")[1].length } catch (e) { }
//   if (m > fix) {
//     return (Math.round(Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m - fix)) / Math.pow(10, fix));
//   } else if (m <= fix) {
//     return (Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)).toFixed(fix);
//   } else {
//     return (arg1 * arg2).toFixed(fix);
//   }
// }

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
      type: 'gcj02 ',
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
  formatePrice
}
