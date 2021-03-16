//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer = null,
  proNum = 0,
  trueStock = {}, //真实购物车数量
  typeTagInfo = {}, //标签索引
  canCheck = false; //加载中 是否允许点击
//重构代码
let proList = {}; //商品信息变量

let debug = 1;//服务器结构错误屏蔽循环
let debugTime;
Page({
  data: {
    curProId: -1,
    cakeTagName: '',
    share: {
      tit: "原麦山丘",
      path: "/pages/index/index",
      imageUrl: ''
    },

    hideCount: true, //角标初始是隐藏的
    count: 0, //角标数
    hide_good_box: true,
    curPro: "",

    showLoading: true,
    cornerTagStyle: '', //加号角标样式
    //掉入购物车开关
    toCart: 0,
    //最大销售数量
    order_max_bread: 99,
    // canCheck:false,
    //重构代码
    // currentTag: null, //统一特殊处理tag值
    currentTab: null,
    //定义容器
    showList: {},
    showCategory: {},
    showStock: {},
    //定义控制变量
    // canAddBtn: {
    //   '1': true

    // }, //允许添加购物车按钮
    cateChosed: {}, //小分类选中项
    pageInfo: {}, //分页变量

  },
  switchTab: util.debounce(function (e) {
    console.log('switchTab')
    console.log(this.data.showStock)
    // if (!canCheck) {
    //   return false;
    // }

    var currentId = e.currentTarget.dataset.tabid
    app.globalData.proType = currentId
    if (this.data.currentTab == currentId) {
      console.log('switchTab-2')
      return false;
    } else {
      console.log('switchTab-3')
      //更新列表
      // this.getProList();
      //缓存操作
      let currentTab = currentId
      let currentTag = null;
      console.log('this.data.showList', this.data.showList, 'this.data.showTags', this.data.showTags);
      let pagelist = this.getCachePage(1, currentTab, currentTag)
      let noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0
      console.log('noMoreData:', noMoreData, "currentTab: ", currentTab, 'currentTag:', currentTag, 'pagelist::', pagelist)
      this.setData({
        currentTag: currentTag,
        currentTab: currentTab,
        showLoading: false,
        ['showList[' + currentTab + '][0]']: pagelist['pagelist'],
      });
      return;
    }
  }, 200, true),
  selectCategory(e) {
    var cateId = e.currentTarget.dataset.id
    cateId = cateId == 'null' ? null : cateId;
    let currentTab = this.data.currentTab
    if (this.data.cateChosed[currentTab] == cateId) {
      return false;
    }
    console.log(cateId, currentTab)
    console.log(this.data.cateChosed)
    //初始化
    this.setData({
      // currentTag: currentTag,
      ['showList[' + currentTab + ']']: [],
      ['cateChosed[' + currentTab + ']']: cateId,
      showLoading: true,
    })

    //特殊化处理 保留 后期须要特殊化 开启
    // switch (currentTab) {
    //   case 1:
    //     // currentTag = tagId;
    //     console.log('s - 1');
    //     break;
    //   case 2:
    //     console.log('s - 2');
    //     // currentTag = tagName;
    //     break;
    //   case 3:
    //     console.log('s - 3');
    //     break;
    //   case 4:
    //     console.log('s - 4');
    //     break;
    // }

    let pagelist = this.getCachePage(1, currentTab, cateId)
    console.log("currentTab： ", currentTab, 'cateId:', cateId, 'pagelist::', pagelist, 'pagelist 分类：', pagelist['pagelist'])
    let noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0;
    this.setData({
      showLoading: false,
      ['showList[' + currentTab + '][0]']: pagelist['pagelist'],
      // 'noMoreData':noMoreData,
    });
    return true;
  },
  freshData: function () {
    this.getProList()
  },
  addChartPreView(idx, itemIdx, totalNum) {
    let tempBread = this.data.breadList[idx][itemIdx];
    let prostock = this.data.breadInfo.stock[tempBread.meal_id] || 0;
    if (tempBread.selected >= prostock) {
      let msg = '该商品库存不足';
      if (tempBread.selected >= this.data.order_max_bread) {
        msg = '该商品已达到最大购买数量';
      }
      wx.showToast({
        icon: "none",
        title: msg
      })
      return false;
    }

    tempBread.selected = parseInt(tempBread.selected) + 1;
    let selectNumberLength = tempBread.selected > 0 ? tempBread.selected.toString().length : 0;
    let style = "";

    switch (selectNumberLength) {
      case 1:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px;width:5px;";
        break;
      case 2:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
        break;
      default:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
        break;
    }
    tempBread['cornerTagStyle'] = style;
    tempBread['selectNumberLength'] = selectNumberLength;
    util.setTabBarBadge(totalNum)
    this.setData({
      ['breadList[' + idx + '][' + itemIdx + ']']: tempBread,
    })
    return true;
  },
  addCart: function (e) {
    let proId = e.currentTarget.dataset.id,
      img = e.currentTarget.dataset.img,
      idx = e.currentTarget.dataset.idx,
      itemIdx = e.currentTarget.dataset.itemidx

    //存储真实库存
    if (typeof (trueStock[proId]) == 'undefined') {
      trueStock[proId] = false;
    }
    for (let tval of breadList) {
      if (trueStock[proId] === false && tval['meal_id'] == proId) {
        trueStock[proId] = tval.selected;
      }
    }

    let pageNum = parseInt(this.data.breadInfo.pageNum)
    let index = pageNum - 1
    this.data.totalNum = this.data.totalNum + 1;
    let {
      currentTab,
      breadTag,
      curProId,
      stock,
      city_id,
      totalNum
    } = this.data

    let tocartParams = {};
    totalNum = parseInt(totalNum)
    let curStock = parseInt(this.data.breadInfo.stock[proId])
    if (proId != curProId) {
      proNum = 0
      this.setData({
        curProId: proId
      })
    }
    if (currentTab == "1") {
      if (proNum < curStock) {
        if (!this.data.hide_good_box) return;
        proNum++
      } else {
        wx.showToast({
          icon: "none",
          title: `库存暂时不足`
        })
        proNum = curStock
      }
    }

    //前置 样式处理
    let flag = this.addChartPreView(idx, itemIdx, totalNum);
    if (!flag) {
      return false;
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      //多余库存处理
      let tempBread = this.data.breadList[idx][itemIdx];
      let prostock = this.data.breadInfo.stock[tempBread.meal_id] || 0;
      let data = {
        city_id: city_id,
        type: currentTab,
        tab_id: proId,
        number: proNum
      }
      if (tempBread.selected >= prostock) {
        data.number = prostock - trueStock[proId];
        if (data.number <= 0) {
          return false;
        }
      }
      proNum = 0
      api.setChart(data).then(res => {
        if (res) {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'none',
            duration: 2000
          })
          //更新数量
          for (let tval of breadList) {
            if (tval['meal_id'] == proId) {
              tval['selected'] = parseInt(tval.selected);
              let selectNumberLength = tval.selected > 0 ? tval.selected.toString().length : 0;
              tval['selectNumberLength'] = selectNumberLength;
              let style = "";
              switch (selectNumberLength) {
                case 1:
                  style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px;width:5px;";
                  break;
                case 2:
                  style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
                  break;
                default:
                  style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
                  break;
              }
              tval['cornerTagStyle'] = style;
              break;
            }
          }
          util.setTabBarBadge(totalNum)
          wx.setStorageSync("total_num", totalNum)
          // console.log(idx, currentTab, breadTag)
          let pagelist = this.getCachePage(idx + 1, currentTab, breadTag);
          this.setData({
            totalNum: totalNum,
            ['breadList[' + idx + ']']: pagelist['pagelist'],
          })
          trueStock[proId] = false;
        } else {
          console.log(res)
          wx.showToast({
            title: '该商品已达到最大购买量',
            icon: 'none',
            duration: 2000
          })

          // this.setData({
          //   ['breadList[' + index + '][' + idx + '].soldStat']: 1
          // })
        }
      })
    }, 300)
  },
  getMoreCacheData() {
    let currentTab = parseInt(this.data.currentTab);
    let curentCate = this.data.cateChosed[currentTab] || null;
    let tmpCateInfo = curentCate === null ? 'all' : curentCate;
    let pageNum = this.data.pageInfo[currentTab][tmpCateInfo]['cpage'] || 1
    let nextPage = pageNum + 1;
    let pagelist = this.getCachePage(nextPage, currentTab, curentCate);
    if (pagelist === false) {
      return false
    }
    this.setData({
      ['showList[' + currentTab + '][' + nextPage + ']']: pagelist.pagelist,
    })
    return
  },
  getCachePage(pageNum, type, tag) {
    // console.log("开始分页：", 'pageNum:', pageNum, 'type:', type, 'tag:', tag)
    type = parseInt(type);
    if (!proList[type]) {
      console.log('getcachePage , !proList[type]不存在。调用接口 getProList（）。')
      this.getProList();
      return false;
    }

    let tempQuoteList;
    let pageList = [];
    let pagesize = 10;
    let tempList = [];
    if (tag === null) {
      //全部
      for (let key in proList[type]) {
        tempList.push(key)
      }
    } else {
      //tag
      tag = type == 1 ? parseInt(tag) : tag;
      tempList = typeTagInfo[type][tag];
    }
    if (typeof (tempList) == "undefined") {
      tempList = [];
    }

    let count = tempList.length;
    let pageCount = Math.ceil(count / pagesize);
    if (pageNum > pageCount) {
      console.log('已达最大页数')
      return false; //已达最大页数
    }

    if (pageNum <= 0) {
      pageNum = 1;
    }
    let tempPageList = tempList.slice((pageNum - 1) * pagesize, pageNum * pagesize)
    tempQuoteList = proList[type];
    for (let key in tempPageList) {
      pageList.push(tempQuoteList[tempPageList[key]])
    }

    //设置分页变量
    let tmp = tag === null ? 'all' : tag;
    if (!this.data.pageInfo.hasOwnProperty(type)) {
      this.data.pageInfo[type] = {}
      this.data.pageInfo[type][tmp] = {}
    }

    if (this.data.pageInfo[type].hasOwnProperty(tmp)) {
      this.data.pageInfo[type][tmp] = {}
    }

    this.data.pageInfo[type][tmp] = {
      'pageCount': pageCount,
      'count': count,
      'pagesize': pagesize,
      'cpage': pageNum,
    };

    this.setData({
      pageInfo: this.data.pageInfo
    })
    // console.log('分页变量：：',this.data.pageInfo)
    return {
      'type': type,
      'tag': tag,
      'pageCount': pageCount,
      'count': count,
      'pagesize': pagesize,
      page: pageNum,
      pagelist: pageList
    };
  },
  toProInfo: function (e) {
    let proId = e.currentTarget.dataset.proid
    let spuId = e.currentTarget.dataset.spuid
    let type = e.currentTarget.dataset.type
    let url = "/pages/" + (type == 1 ?'proInfo/proInfo':'cakeInfo/cakeInfo') + "?proId=" + (type == 1 ? proId : spuId) + "";
    wx.navigateTo({
      url: url
    })
  },
  onPullDownRefresh() { //下拉刷新
    this.freshData()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMoreCacheData();
    // this.getMoreData()
  },
  getCartInfo() {
    let total_num = wx.getStorageSync("total_num")
    this.setData({
      totalNum: total_num || 0
    })
    util.setTabBarBadge(total_num)
  },
  refreshTypeTagInfo(type, list) {
    type = parseInt(type)
    //初始化
    let typeTagInfoRe = {};
    typeTagInfo[type] = {};
    typeTagInfoRe[type] = {}
    for (let key in list) {
      for (let cateKey in list[key]['category_id']) {
        if (!typeTagInfoRe[type].hasOwnProperty(list[key]['category_id'][cateKey])) {
          typeTagInfoRe[type][list[key]['category_id'][cateKey]] = [];
          typeTagInfoRe[type][list[key]['category_id'][cateKey]].push(key)
        } else {
          typeTagInfoRe[type][list[key]['category_id'][cateKey]].push(key)
        }
      }
    }

    typeTagInfo[type] = typeTagInfoRe[type] || [];
    console.log('初始化标签索引：typeTagInfo', typeTagInfo)
    return true;
  },
  getProList: function (cityid, refresh = false) {
    //服务器结构错误 处理
    if(debug >5){
      wx.showToast({
        title:'服务器繁忙'
      });
      return false;
    }
    debugTime = setTimeout(function () {
      debug= 0;
      console.log("debug-----")
      }, 1000)
    debug++;
    let {
      city_id,
    } = this.data
    let count, noMoreData, currentTab = app.globalData.proType
    city_id = cityid ? cityid : city_id
    let data = {
      city_id: city_id
    }
    let setData = {};
    if (!currentTab) {
      data.tag = 0
      data.type = ""
      setData['showList'] = null;
    } else {
      data.type = currentTab;
      setData['showList[' + currentTab + ']'] = null;
    }
    //初始化数据
    setData['showLoading'] = true;
    setData['currentTag'] = null;
    this.setData(setData)
    
    api.getProList(data).then(res => {
      this.setData({
        showLoading: false
      })

      // console.log(res);
      if (!res) {
        return false
      }
      let menu = res.type;
      console.log(app.globalData.proType)

      //防止出现更新
      if (app.globalData.proType != '' && app.globalData.proType != res.choose_type) {
        console.log('=========防更新========')
        return false;
      }
      let currentTab = app.globalData.proType = res.choose_type;
      //初始化
      let setData = {
        menu: menu,
        currentTab: app.globalData.proType,
        order_max_bread: res.order_max_bread,
        ['cateChosed[' + res.choose_type + ']']: null,
      };

      //重置数据
      if (refresh) {
        proList = {};
        setData['showList'] = {};
        setData['showTags'] = {};
        setData['showStock'] = {};
        setData['cateChosed'] = {};
        setData['pageInfo'] = {};
      }

      this.setData(setData)
      proList[app.globalData.proType] = [];
      proList[app.globalData.proType] = res.list;
      // console.log('接口返回：', res, 'prolist:', proList);

      //特殊处理
      // console.log('app.globalData.proType', app.globalData.proType)
      switch (app.globalData.proType) {
        case 1:
          // console.log('switch  = 1')
          for (let tmpVal of proList[app.globalData.proType]) {
            let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
            tmpVal['selectNumberLength'] = selectNumberLength;
            let style = "";
            switch (selectNumberLength) {
              case 1:
                style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px;width:5px;";
                break;
              case 2:
                style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
                break;
              default:
                style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
                break;
            }
            tmpVal['cornerTagStyle'] = style;
            // console.log(selectNumberLength);
          }
          break;
        case 2:
          // console.log('switch  = 2')
          break;
        case 3:

          // console.log('switch  = 3')
          break;
        case 4:
          // console.log(4)
          break;
      }

      this.refreshTypeTagInfo(res.choose_type, proList[app.globalData.proType]);
      let pagel = this.getCachePage(1, res.choose_type, null)
      console.log('proList', proList, 'pagel', pagel);

      setData = {};
      if (!pagel) {
        this.setData({
          ['showList[' + res.choose_type + '][0]']: null,
          ['showStock[' + res.choose_type + ']']: res.stock,
          ['showCategory[' + res.choose_type + ']']: res.category,
        });
        return false;
      }

      count = pagel.count;
      // noMoreData = pagel.count - pagel.page * pagel.pagesize <= 0;

      //渲染页面
      this.setData({
        ['showList[' + res.choose_type + '][0]']: pagel['pagelist'],
        ['showStock[' + res.choose_type + ']']: res.stock,
        ['showCategory[' + res.choose_type + ']']: res.category,
      });
      // console.log('this.data.showCategory', this.data.showCategory, 'this.data.showList', this.data.showList)
      // console.log(this.data.showList[currentTab], 'currentTab', currentTab);
      wx.stopPullDownRefresh() //停止下拉刷新
    })

  },
  onShow() {
    canCheck = false;
    //自定义tabbar选中
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    let proType = app.globalData.proType
    //默认不存在的城市 显示全国
    city_id = city_id == 0 ? '10216' : city_id;
    this.setData({
      // cakeList: null,
      // breadList: null,
      currentTab: proType,
      city_id: city_id || '10216',
      showLoading: true
    })
    // console.log(this.data.city_id)
    trueStock = {};
    this.getCartInfo()
    this.getProList(this.data.city_id, true);
  },
  onPageScroll(e) {
    // console.log(e.scrollTop);
    let stop = e.scrollTop
    if (stop > 46) {
      this.setData({
        isFixed: true
      })
    } else {
      this.setData({
        isFixed: false
      })
    }
  },
  onLoad: function () {
    let sysInfo = null
    if (app.globalSystemInfo) {
      sysInfo = app.globalSystemInfo
    } else {
      sysInfo = wx.getSystemInfoSync()
    }
    //可视窗口x,y坐标
    // console.log(sysInfo.screenHeight)
    this.busPos = {};
    this.busPos['x'] = sysInfo.screenWidth * .6;
    this.busPos['y'] = sysInfo.screenHeight * .85;
    // let addressInfo = wx.getStorageSync("addressInfo")
    // let city_id = addressInfo&&JSON.parse(addressInfo).city_id
    let btmHolder = wx.getStorageSync('btmHolder')

    //设置临时页面分类等
    // this.setTempTypeTag(1,0);

    this.setData({
      //city_id:city_id,
      btmHolder: btmHolder || 0
    })
    //this.getProList();

    util.setWatcher(this);
  },
  watch: {
    'city_id': function (value, oldValue) {
      // console.log("watch");

      if (value == oldValue || this.data.currentTab == '') {
        return
      }
      breadList = null
      cakeList = null
      // app.globalData.proType = ''
      this.setData({
        breadList: null,
        cakeList: null,
        currentTab: '',
        currentTag: '',

        breadInfo: {
          count: 0,
          pageNum: 1,
          noMoreData: false
        },
        cakeInfo: {
          count: 0,
          pageNum: 1,
          noMoreData: false
        },

        breadTag: '',
        cakeTag: '',
      })
      this.getProList(value);
      console.log(value);
    }
  }

})