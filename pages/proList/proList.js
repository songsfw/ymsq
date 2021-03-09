//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer = null,
  proNum = 0,
  breadList = null,
  cakeList = null,
  timer1 = null,
  trueStock = {}, //真实购物车数量
  typeTagInfo = {},//标签索引
  canCheck = false;//加载中 是否允许点击
Page({
  data: {
    curProId: -1,
    currentTab: '',
    breadList: [],
    cakeList: [],

    proNum: 0,

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
  },
  switchTab: util.debounce(function (e) {
    if(!canCheck){
      return false;
    }
    var currentId = e.currentTarget.dataset.tabid
    app.globalData.proType = currentId
    if (this.data.currentTab == currentId) {
      return false;
    } else {
      //更新列表
      // this.getProList();

      //缓存操作
      var tagId = '全部'
      var tagName = '全部'
      let currentTab = currentId
      let currentTag;

      if (currentTab == 1) {
        currentTag = '';
        this.setData({
          breadInfo: {
            count: 0,
            pageNum: 1,
            noMoreData: false
          },
          breadTag: tagId,
          breadList: [],
          showLoading: true,
        })
      } else {
        currentTag = tagId == '全部' ? '' : tagId
        let currentTagName = tagName; //cakeTagName
        this.setData({
          cakeInfo: {
            count: 0,
            pageNum: 1,
            noMoreData: false
          },
          cakeTag: currentTag,
          cakeTagName: currentTagName,
          cakeList: [],
          showLoading: true
        })
        currentTag = currentTagName == '全部' ? '' : currentTagName;
      }
      let pagelist = this.getCachePage(1, currentTab, currentTag)
      // console.log("select tag: ", currentTab, currentTag, 'pagelist::', pagelist, 'pagelist 分类：', pagelist['pagelist'])

      let noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0
      if (currentTab == 1) {
        this.setData({
          breadInfo: {
            count: pagelist['count'],
            pageNum: 1,
            noMoreData: noMoreData,
            pageCount: pagelist['pageCount'],
          },
          showLoading: noMoreData,
          ['breadList[0]']: pagelist['pagelist'],
          currentTag: currentTag,
          currentTab:currentTab,
          breadTag:'',
        });
      } else {
        this.setData({
          cakeInfo: {
            count: pagelist['count'],
            pageNum: 1,
            noMoreData: false,
            pageCount: pagelist['pageCount'],
          },
          showLoading: false,
          ['cakeList[0]']: pagelist['pagelist'],
          currentTag: currentTag,
          currentTab:currentTab,
        });
      }
      return false;
    }
  }, 200, true),
  selectTag(e) {
    var tagId = e.currentTarget.dataset.id
    var tagName = e.currentTarget.dataset.tagname
    let currentTab = this.data.currentTab
    let currentTag;

    if (currentTab == 1) {
      currentTag = tagId == '全部' ? '' : tagId
      this.setData({
        breadInfo: {
          count: 0,
          pageNum: 1,
          noMoreData: false
        },
        breadTag: currentTag,
        breadList: [],
        showLoading: true,
      })
    } else {
      currentTag = tagId == '全部' ? '' : tagId
      let currentTagName = tagName; //cakeTagName
      this.setData({
        cakeInfo: {
          count: 0,
          pageNum: 1,
          noMoreData: false
        },
        cakeTag: currentTag,
        cakeTagName: currentTagName,
        cakeList: [],
        showLoading: true
      })
      currentTag = currentTagName == '全部' ? '' : currentTagName;
    }
    let pagelist = this.getCachePage(1, currentTab, currentTag)
    // console.log("select tag: ", currentTab, currentTag, 'pagelist::', pagelist, 'pagelist 分类：', pagelist['pagelist'])
    let noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0
    if (currentTab == 1) {
      this.setData({
        breadInfo: {
          count: pagelist['count'],
          pageNum: 1,
          noMoreData: noMoreData,
          pageCount: pagelist['pageCount'],
        },
        showLoading: noMoreData,
        ['breadList[0]']: pagelist['pagelist'],
        currentTag: currentTag,
      });
    } else {
      this.setData({
        cakeInfo: {
          count: pagelist['count'],
          pageNum: 1,
          noMoreData: false,
          pageCount: pagelist['pageCount'],
        },
        showLoading: false,
        ['cakeList[0]']: pagelist['pagelist'],
        currentTag: currentTag,
      });
    }

    return true;
  },
  getStock() {
    let {
      city_id
    } = this.data
    let data = {
      city_id: city_id,
    }
    api.getProList(data).then(res => {
      console.log(res);
      if (!res) {
        return false
      }
      let stock = res.stock
      this.setData({
        stock: stock,
      })
    })
  },

  // getCurrList(list, pageNum) {
  //   return list.slice(pageNum * 10 - 10, pageNum * 10)
  // },
  freshData: function () {
    this.getProList()
  },
  addChartPreView(idx, itemIdx, totalNum) {
    let tempBread = this.data.breadList[idx][itemIdx];
    let prostock = this.data.stock[tempBread.meal_id] || 0;
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
  addChart: function (e) {
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
    let curStock = parseInt(stock[proId])
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
      let prostock = this.data.stock[tempBread.meal_id] || 0;
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
    let pageNum
    let {
      currentTab,
      breadInfo,
      cakeInfo,
      breadTag,
      cakeTag
    } = this.data
    currentTab = parseInt(currentTab)
    let pagelist;
    switch (currentTab) {
      case 1:
        pageNum = breadInfo.pageNum + 1
        pagelist = this.getCachePage(pageNum, currentTab, breadTag);
        if (pagelist === false) {
          return false
        }
        this.setData({
          ['breadInfo.pageNum']: pageNum,
          ['breadList[' + (pageNum - 1) + ']']: pagelist.pagelist,
        })

        break;
      case 2:
        pageNum = cakeInfo.pageNum + 1
        pagelist = this.getCachePage(pageNum, currentTab, cakeTag);
        if (pagelist === false) {
          return false
        }
        this.setData({
          ['cakeInfo.pageNum']: pageNum,
          ['cakeList[' + (pageNum - 1) + ']']: pagelist.pagelist,
        })
        break;
      default:
        break;
    }
  },
  // getMoreData() {
  //   let pageNum, noMoreData
  //   let {
  //     currentTab,
  //     breadInfo,
  //     cakeInfo
  //   } = this.data
  //   currentTab = parseInt(currentTab)
  //   switch (currentTab) {
  //     case 1:
  //       if (breadInfo.noMoreData) {
  //         return false
  //       }
  //       pageNum = breadInfo.pageNum + 1
  //       noMoreData = breadInfo.count - pageNum * 10 <= 0
  //       //设置的时候 breadInfo 设置 type  tag 的id 进行区分  重点是划分  count 与 pageNum

  //       this.setData({
  //         ['breadInfo.pageNum']: pageNum,
  //         ['breadInfo.noMoreData']: noMoreData,
  //         ['breadList[' + (pageNum - 1) + ']']: this.getCurrList(breadList, pageNum),
  //       })

  //       break;
  //     case 2:
  //       if (cakeInfo.noMoreData) {
  //         return false
  //       }
  //       pageNum = cakeInfo.pageNum + 1
  //       noMoreData = cakeInfo.count - pageNum * 10 <= 0
  //       this.setData({
  //         ['cakeInfo.pageNum']: pageNum,
  //         ['cakeInfo.noMoreData']: noMoreData,
  //         ['cakeList[' + (pageNum - 1) + ']']: this.getCurrList(cakeList, pageNum),
  //       })

  //       break;
  //     default:
  //       break;
  //   }
  // },
  getCachePage(pageNum, type, tag) {
    // console.log("开始分页：", pageNum, type, tag)
    type = parseInt(type);
    tag = tag == '' ? 0 : tag

    // breadList = null;
    // console.log(breadList);
    if ((type == 1 && !breadList) || (type == 2 && !cakeList)) {
      // console.log('------------')
      this.getProList();
      return false;
    }

    let tempQuoteList;
    let pageList = [];
    let pagesize = 10;
    let tempList = [];
    if (tag == 0) {
      //全部
      if (type == 1) {
        for (let key in breadList) {
          tempList.push(key)
        }
      } else if (type == 2) {
        for (let key in cakeList) {
          tempList.push(key)
        }
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
      return false; //已达最大页数
    }

    if (pageNum <= 0) {
      pageNum = 1;
    }
    let tempPageList = tempList.slice((pageNum - 1) * pagesize, pageNum * pagesize)
    tempQuoteList = type == 1 ? breadList : cakeList;
    for (let key in tempPageList) {
      pageList.push(tempQuoteList[tempPageList[key]])
    }
    return {
      'pageCount': pageCount,
      'count': count,
      'pagesize': pagesize,
      page: pageNum,
      pagelist: pageList
    };
  },
  toProInfo: function (e) {
    let proId = e.currentTarget.dataset.proid
    wx.navigateTo({
      url: '/pages/proInfo/proInfo?proId=' + proId
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
    console.log(list)
    let typeTagInfoRe = {};
    typeTagInfo[type] = {};

    switch (type) {
      case 1:
        //面包
        typeTagInfoRe[type] = {}
        for (let key in list) {
          if (!typeTagInfoRe[type].hasOwnProperty(list[key].category_id)) {
            typeTagInfoRe[type][list[key].category_id] = [];
            typeTagInfoRe[type][list[key].category_id].push(key)
          } else {
            typeTagInfoRe[type][list[key].category_id].push(key)
          }
        }
        // console.log(typeTagInfo)
        break;
      case 2:
        //蛋糕
        typeTagInfoRe[type] = {}
        // console.log(list)
        for (let key in list) {
          // console.log(list[key])
          for (let tagKey in list[key]['tags']) {
            // console.log(list[key]['tags'][tagKey])
            if (!typeTagInfoRe[type].hasOwnProperty(list[key]['tags'][tagKey])) {
              typeTagInfoRe[type][list[key]['tags'][tagKey]] = [];
              typeTagInfoRe[type][list[key]['tags'][tagKey]].push(key)
            } else {
              typeTagInfoRe[type][list[key]['tags'][tagKey]].push(key)
            }
          }
        }
        break;
    }
    typeTagInfo[type] = typeTagInfoRe[type];
    console.log('初始化==', typeTagInfo)
    return true;
  },
  getProList: function (cityid) {
    // console.log('getProList  --- start')
    let {
      city_id,
      breadTag,
      cakeTag,
      cakeTagName,
    } = this.data
    let count, noMoreData, currentTab = app.globalData.proType
    city_id = cityid ? cityid : city_id
    let data = {
      city_id: city_id
    }
    if (!currentTab) {
      data.tag = 0
      data.type = ""
    }
    if (currentTab == '1') {
      // data.tag = breadTag
      data.type = "1"

      this.setData({
        breadInfo: {
          count: 0,
          pageNum: 1,
          noMoreData: false
        },
        breadTag: breadTag,
        breadList: [],
        cakeList: [],
        showLoading: true,
      })
    }
    if (currentTab == '2') {
      // data.tag = cakeTag
      data.type = "2"
      this.setData({
        cakeInfo: {
          count: 0,
          pageNum: 1,
          noMoreData: false
        },
        cakeTag: cakeTag == '全部' ? '' : cakeTag,
        cakeTagName: cakeTagName,
        cakeList: [],
        breadList: [],
        showLoading: true
      })
    }

    api.getProList(data).then(res => {
      this.setData({
        showLoading: false
      })
      // console.log(res);
      if (!res) {
        return false
      }

      let menu = res.type,
        choose_type = res.choose_type
      if (!currentTab) {
        app.globalData.proType = choose_type
      }

      this.setData({
        menu: menu,
        currentTab: app.globalData.proType,
        order_max_bread: res.order_max_bread
      })

      if (app.globalData.proType == '1') {
        breadList = []
        breadList = res.list
        for (let breadVal of breadList) {
          let selectNumberLength = breadVal.selected > 0 ? breadVal.selected.toString().length : 0;
          breadVal['selectNumberLength'] = selectNumberLength;
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
          breadVal['cornerTagStyle'] = style;
          // console.log(selectNumberLength);
        }

        let stock = res.stock
        this.refreshTypeTagInfo(res.choose_type, breadList);
        let pagelist = this.getCachePage(1, res.choose_type, breadTag)
        if (!pagelist) {
          this.setData({
            breadList: null
          })
          return false;
        }
        count = pagelist.count;
        noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0
        this.setData({
          breadTags: res.tags,
          stock: stock,
          breadInfo: {
            count: count,
            pageNum: 1,
            noMoreData: noMoreData
          },
          'breadList[0]': pagelist['pagelist'],
        })
      }
      if (app.globalData.proType == '2') {
        cakeList = res.list
        let stock = res.stock
        this.refreshTypeTagInfo(res.choose_type, cakeList);
        let cakeTagTrue = cakeTag == "" ? cakeTag : cakeTagName;
        let pagelist = this.getCachePage(1, res.choose_type, cakeTagTrue)
        if (!pagelist) {
          this.setData({
            breadList: null
          })
          return false;
        }

        count = pagelist.count;
        noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0
        this.setData({
          cakeTags: res.tags,
          stock: stock,
          cakeInfo: {
            count: count,
            pageNum: 1,
            noMoreData: noMoreData
          },
          'cakeList[0]': pagelist['pagelist'],
        })
      }
      canCheck = true;
      wx.stopPullDownRefresh() //停止下拉刷新
    })

  },
  onShow() {
    canCheck =false;
    //自定义tabbar选中
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    let proType = app.globalData.proType

    this.setData({
      currentTab: proType,
      city_id: city_id || '10216',
      showLoading: true
    })
    trueStock = {};
    this.getCartInfo()
    this.getProList();
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
    console.log(sysInfo.screenHeight)
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
      console.log("watch");

      if (value == oldValue || this.data.currentTab == '') {
        return
      }
      breadList = null
      cakeList = null
      app.globalData.proType = ''
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