//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer = null,
  proNum = 0, //全局当前点击商品数量
  lastTypeMealIdSpuId = "", //最后一次点击的唯一标识
  trueStock = {}, //真实购物车数量
  typeTagInfo = {}, //标签索引
  canCheck = false; //加载中 是否允许点击
// curIndexInShowlist = null;//容器中商品索引
//重构代码
let proList = {}; //商品信息容器

let debug = 1; //服务器结构错误屏蔽循环
let debugTime;
Page({
  data: {
    cakeTagName: '',
    share: {
      tit: "原麦山丘",
      path: "/pages/index/index",
      imageUrl: ''
    },

    pop: 0, //角标初始是隐藏的
    showLoading: true,
    cornerTagStyle: '', //加号角标样式
    //掉入购物车开关
    toCart: 0,
    //最大销售数量
    order_max_bread: 99,
    // canCheck:false,
    //重构代码
    totalNum: 0,
    currentTab: null,
    currentCategory: null,
    //定义容器
    showList: {}, //显示列表分页容器
    showCategory: {},
    showStock: {},
    cateChosed: {}, //小分类选中项
    pageInfo: {}, //分页变量

    //弹框
    skuNum: 1,
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
    // console.log(cateId, currentTab)
    // console.log(this.data.cateChosed)
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
    // console.log("currentTab： ", currentTab, 'cateId:', cateId, 'pagelist::', pagelist, 'pagelist 分类：', pagelist['pagelist'])
    this.setData({
      currentCategory: cateId,
      showLoading: false,
      ['showList[' + currentTab + '][0]']: pagelist['pagelist'],
    });
    return true;
  },
  freshData: function () {
    this.getProList()
  },
  addChartPreView(currentTab, idx, itemIdx, totalNum) {
    let tempList = this.data.showList[currentTab][idx][itemIdx];
    let proStock = tempList.type == 1 ? this.data.showStock[currentTab][tempList['meal_id']] : this.data.order_max_bread;

    // console.log(tempList, 'tempList.selected', tempList.selected, 'proStock', proStock)
    tempList.selected = parseInt(tempList.selected);
    if (tempList.selected >= proStock) {
      let msg = '该商品库存不足';
      if (tempList.selected >= this.data.order_max_bread) {
        msg = '该商品已达到最大购买数量';
      }
      wx.showToast({
        icon: "none",
        title: msg
      })
      return false;
    }
    tempList.selected = parseInt(tempList.selected) + 1;
    let selectNumberLength = tempList.selected > 0 ? tempList.selected.toString().length : 0;
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
    tempList['cornerTagStyle'] = style;
    tempList['selectNumberLength'] = selectNumberLength;
    util.setTabBarBadge(totalNum)
    this.setData({
      ['showList[' + currentTab + '][' + idx + '][' + itemIdx + ']']: tempList,
    })
    return true;
  },
  addCart: function (e) {
    let proId = e.currentTarget.dataset.id,
      img = e.currentTarget.dataset.img,
      typeMealIdSpuId = e.currentTarget.dataset.typemealidspuid,
      proInPage = e.currentTarget.dataset.idx, //当前商品所在页
      itemIdx = e.currentTarget.dataset.itemidx,
      curType = e.currentTarget.dataset.type,
      curSpuid = e.currentTarget.dataset.spuid; //当前商品所在页序号
    //如果是蛋糕触发函数
    if (curType == 2) {
      this.showPop(e);
      return
    }

    let {
      currentTab,
      city_id,
    } = this.data


    //如果切换商品，重置统一变量添加数量
    // console.log(lastTypeMealIdSpuId,'-',typeMealIdSpuId)
    if (lastTypeMealIdSpuId != typeMealIdSpuId) {
      proNum = 0;
    }
    lastTypeMealIdSpuId = typeMealIdSpuId;
    // console.log(proId, proInPage, itemIdx,currentTab,'typeMealIdSpuId',typeMealIdSpuId);
    //存储真实库存
    if (typeof (trueStock[typeMealIdSpuId]) == 'undefined') {
      trueStock[typeMealIdSpuId] = false;
    }

    for (let tIndex in this.data.showList[currentTab][proInPage]) {
      let tmpIDName = this.data.showList[currentTab][proInPage][tIndex].type + "_" + this.data.showList[currentTab][proInPage][tIndex].meal_id + "_" + this.data.showList[currentTab][proInPage][tIndex].spu_id;
      if (trueStock[typeMealIdSpuId] === false && tmpIDName == typeMealIdSpuId) {
        trueStock[typeMealIdSpuId] = this.data.showList[currentTab][proInPage][tIndex].selected || 0;
      }
    }
    //需要更新页码 序号  proInPage 0起

    //容器中当前点击商品的 curIndexInShowlist
    //当前库存
    let curStock;
    if (curType == 1) {
      curStock = this.data.showStock[currentTab][proId];
    } else {
      curStock = this.data.showStock[currentTab][curSpuid] || this.data.order_max_bread;
    }

    //验证变量数量是否超过 库存上限
    if (proNum > curStock) {
      wx.showToast({
        icon: "none",
        title: `库存暂时不足`
      })
      proNum = curStock
    } else {
      proNum++;
      this.data.totalNum++
    }

    //前置样式处理 && 库存限制处理
    let flag = this.addChartPreView(currentTab, proInPage, itemIdx, this.data.totalNum);
    if (!flag) {
      return false;
    }

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      //多余库存处理
      let tempList = this.data.showList[currentTab][proInPage][itemIdx];
      let proStock = tempList.type == 1 ? this.data.showStock[currentTab][tempList['meal_id']] : this.data.order_max_bread;
      proStock = parseInt(proStock);
      let data = {
        city_id: city_id,
        type: curType,
        tab_id: proId,
        number: proNum
      }

      let refNum = proNum;
      if (tempList.selected >= proStock) {
        data.number = proStock - trueStock[typeMealIdSpuId];
        refNum = data.number;
        if (data.number <= 0) {
          return false;
        }
      }
      console.log(tempList.selected, proStock, trueStock[typeMealIdSpuId], refNum)
      proNum = 0
      api.setChart(data).then(res => {
        if (res) {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'none',
            duration: 2000
          })
          util.setTabBarBadge(this.data.totalNum)
          wx.setStorageSync("total_num", this.data.totalNum)
          //全局更新

          this.refreshProList(proId, curSpuid, curType, (parseInt(refNum)+parseInt(trueStock[typeMealIdSpuId])));
          // let pagelist = this.getCachePage(proInPage + 1, currentTab, this.data.currentCategory);
          this.setData({
            totalNum: this.data.totalNum,
            // ['showList[' + currentTab + '][' + proInPage + ']']: pagelist['pagelist'],
          })
          trueStock[typeMealIdSpuId] = false;
        } else {
          console.log(res)
          wx.showToast({
            title: '该商品已达到最大购买量',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }, 300)
    return
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
      ['showList[' + currentTab + '][' + pageNum + ']']: pagelist.pagelist,
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
    let url = "/pages/" + (type == 1 ? 'proInfo/proInfo' : 'cakeInfo/cakeInfo') + "?proId=" + (type == 1 ? proId : spuId) + "";
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
    console.log(total_num)
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
    if (debug > 5) {
      wx.showToast({
        title: '服务器繁忙'
      });
      return false;
    }
    debugTime = setTimeout(function () {
      debug = 0;
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
      switch (parseInt(app.globalData.proType)) {
        case 1:
          console.log('switch  = 1-------------')
          for (let tmpVal of proList[app.globalData.proType]) {
            // console.log(tmpVal)
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
          console.log('switch  = 2')
          for (let tmpVal of proList[app.globalData.proType]) {
            console.log(tmpVal)
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
        case 3:
          console.log('switch  = 3')
          for (let tmpVal of proList[app.globalData.proType]) {
            console.log(tmpVal)
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

      wx.stopPullDownRefresh() //停止下拉刷新
    })

  },
  showPop(e) {
    let proId = e.currentTarget.dataset.id,
      img = e.currentTarget.dataset.img,
      typeMealIdSpuId = e.currentTarget.dataset.typemealidspuid,
      proInPage = e.currentTarget.dataset.idx, //当前商品所在页
      itemIdx = e.currentTarget.dataset.itemidx,
      curType = e.currentTarget.dataset.type,
      curSpuid = e.currentTarget.dataset.spuid; //当前商品所在页序号
    let {
      currentTab
    } = this.data
    let product = this.data.showList[currentTab][proInPage][itemIdx];
    let cakeTempParams = {
      proId: proId,
      proInPage,
      proInPage,
      itemIdx,
      itemIdx,
      curType,
      curType,
      curSpuid,
      selected: product.selected
    };


    let data = {
      spu_id: curSpuid
    }
    api.getCakeProInfo(data).then(res => {
      wx.stopPullDownRefresh()
      console.log(res)
      let selectSku = Object.assign({}, res.sku_list[res.sku_id])
      if (res) {
        this.setData({
          proInfo: res,
          selectSku: selectSku,
          pop: 'cake-panel',
          cakeTempParams: cakeTempParams,
        })
      }
    })
    // console.log(proId, product)
    // console.log(111111)
    // this.setData({
    //   product: product,
    //   pop: 'cake-panel'
    // })
  },
  close() {
    this.setData({
      pop: 0
    })
  },
  addFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    skuNum++
    this.setData({
      skuNum: skuNum
    })
  }),
  //改变商品数量
  minusFitting: util.debounce(function () {
    let skuNum = this.data.skuNum
    if (skuNum == 1) {
      this.setData({
        skuNum: 1
      })
      return
    }
    skuNum--
    this.setData({
      skuNum: skuNum
    })
  }),
  selectSku(e) {
    let skuid = e.currentTarget.dataset.skuid
    let sku_list = this.data.proInfo.sku_list
    let selectSku = Object.assign({}, sku_list[skuid])
    this.setData({
      'selectSku.sku_id': skuid,
      selectSku: selectSku
    })
  },
  confirmCake: util.debounce(function (e) {
    let proId = e.currentTarget.dataset.sku
    let {
      city_id,
      skuNum,
      action,
      totalNum
    } = this.data

    let data = {
      city_id: city_id,
      type: '2',
      tab_id: proId,
      number: skuNum
    }
    totalNum = totalNum + skuNum
    api.setChart(data).then(res => {
      if (res) {
        util.setTabBarBadge(totalNum)
        wx.setStorageSync('total_num', totalNum)
        wx.showToast({
          icon: "none",
          title: '加入购物车成功'
        })

        this.refreshProList(this.data.cakeTempParams.proId, this.data.cakeTempParams.curSpuid, this.data.cakeTempParams.curType, (parseInt(skuNum)+parseInt(this.data.cakeTempParams.selected)))
        this.setData({
          totalNum: totalNum,
          pop: 0
        })
        // if (action == 1) {
        //   app.globalData.proType = "2"
        //   wx.navigateTo({
        //     url: "/pages/cart/cart/cart"
        //   })
        // }
      }
    })
  }, 300, true),
  refreshProList(mealId, spuId, typeId, num = null) {
    console.log(mealId, spuId, typeId);
    let tmpId = mealId + '_' + spuId + '_' + typeId;
    for (let key1 in proList) {
      for (let value of proList[key1]) {
        if (tmpId == (value.meal_id + "_" + value.spu_id + "_" + value.type)) {
          console.log('key1', key1, 'value', value)
          if (num !== null) {
            console.log(num, value)
            value.selected = parseInt(num);
          }
          let selectNumberLength = value.selected > 0 ? value.selected.toString().length : 0;
          value['selectNumberLength'] = selectNumberLength;
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
          value['cornerTagStyle'] = style;
        }
      }
    }
    this.setData({
      showList: this.data.showList
    })
    console.log(proList);
    return
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
      showLoading: true,
      skuNum: 1
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
      proList={}
      // app.globalData.proType = ''
      proList = {};
      let setData = {};
      setData['showList'] = {};
      setData['showTags'] = {};
      setData['showStock'] = {};
      setData['cateChosed'] = {};
      setData['pageInfo'] = {};
      this.setData(setData)
      this.getProList(value);
      console.log(value);
    }
  }

})