//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()

let timer = null,
  trueStock = {}, //真实购物车数量
  typeTagInfo = {}, //标签索引
  canCheck = false; //加载中 是否允许点击
// curIndexInShowlist = null;//容器中商品索引

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
    canshow: true,
    allCakeCateImg: "/image/dgqb.png",
    //文章默认页
    articleDefaultPage: 1,

    //
    watchNumer: 0,
    watchContainer: [],
    prePushWatchlist: [], //预处理栈
    prePushWatchHash: {}, //预处理堆

    backFrom: 0, //1为详情页
    trueCityId: 0,
  },
  switchTab: util.debounce(function (e) {
    var currentId = e.currentTarget.dataset.tabid
    if (currentId == 2) {
      this.setData({
        allCakeCateImg: '/image/dgqb.png',
      })
    } else {
      this.setData({
        allCakeCateImg: '',
      })
    }

    // console.log('switchTab')
    app.globalData.proType = currentId
    if (this.data.currentTab == currentId) {
      return false;
    } else {
      // this.setData({
      //   showLoading: true
      // })
      console.log('switchTab-3')
      //更新列表
      // this.getProList();
      //缓存操作
      let currentTab = currentId
      let currentTag = this.data.cateChosed[currentTab];
      let pagelist = this.getCachePage(1, currentTab, currentTag)
      // let noMoreData = pagelist.count - pagelist.page * pagelist.pagesize <= 0
      // console.log('noMoreData:', noMoreData, "currentTab: ", currentTab, 'currentTag:', currentTag, 'pagelist::', pagelist)
      this.setData({
        currentTag: currentTag,
        currentTab: currentTab,
        // showLoading: false,
        ['showList[' + currentTab + '][0]']: pagelist['pagelist'],
      });

      if (currentId == 1 || currentId == 2) {
        if (!this.data.cAnimatPosition) {
          this.data.cAnimatPosition = {};
        }

        console.log(this.data.cAnimatPosition)
        if (this.data.cAnimatPosition.hasOwnProperty(currentId)) {
          console.log(currentId, '======');
          let aniOffsetLeft = this.data.cAnimatPosition[currentId][0];
          let aniIdx = this.data.cAnimatPosition[currentId][1];
          this.categoryAnimat(aniOffsetLeft, aniIdx);
        } else {
          this.categoryAnimat(0, 0);
        }
      }
      return;
    }
  }, 200, true),

  //选中偏移值，   选中的id
  categoryAnimat(offsetLeft, idx, id) {
    idx = idx == 'null' ? 0 : idx;
    if (idx) {
      let preId = 0;
      for (let i in this.data.showCategory[this.data.currentTab]) {
        if (this.data.showCategory[this.data.currentTab][i].tid == idx) {
          console.log(this.data.showCategory[this.data.currentTab][i])
          let preIndex = i > 0 ? i - 1 : 0;
          preId = this.data.showCategory[this.data.currentTab][preIndex].tid;
        }
      }
      preId = preId == idx ? 0 : preId;
      this.setData({
        categoryId: 'cate_' + preId
      })
    } else {
      this.setData({
        categoryId: 'cate_0'
      })
    }
  },
  selectCategory(e) {
    var cateId = e.currentTarget.dataset.id
    cateId = cateId == 'null' ? null : cateId;
    let currentTab = this.data.currentTab
    if (this.data.cateChosed[currentTab] == cateId) {
      return false;
    }

    //初始化
    this.setData({
      // currentTag: currentTag,
      ['showList[' + currentTab + ']']: [],
      ['cateChosed[' + currentTab + ']']: cateId,
      showLoading: true,
    })

    let aniId = e.currentTarget.dataset.id;
    console.log(e, e.currentTarget.dataset)
    let aniOffsetLeft = e.currentTarget.offsetLeft;
    let tmpAniPos = [
      aniOffsetLeft,
      aniId
    ]
    if (!this.data.cAnimatPosition) {
      this.data.cAnimatPosition = {};
      this.data.cAnimatPosition[currentTab] = tmpAniPos;
    } else {
      this.data.cAnimatPosition[currentTab] = tmpAniPos;
    }
    this.categoryAnimat(aniOffsetLeft, aniId, e.currentTarget.id);

    let re = this.choseTagData(currentTab, cateId);
    return re;
  },
  choseTagData: function (currentTab, cateId) {
    // console.log(currentTab, cateId);
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
    if (this.data.trueCityId == 0) {
      wx.showToast({
        icon: "none",
        title: '当前配送地址暂不支持购买此商品！'
      })
      return false;
    }

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
    app.inCartRefreshList({
      type: tempList.type,
      proId: tempList.meal_id,
      selected: tempList.selected
    });
    this.setData({
      showList: this.data.showList,
    })
    try {
      util.setTabBarBadge(totalNum)
    } catch (err) {
      console.log(err.description)
    }

    return true;
  },
  addCart: function (e) {
    let proId = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name,
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
    console.log(city_id);

    if (this.data.showStock[currentTab][proId] == 0) {
      return
    }


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

    //当前库存
    let curStock;
    if (curType == 1) {
      curStock = this.data.showStock[currentTab][proId];
    } else {
      curStock = this.data.showStock[currentTab][curSpuid] || this.data.order_max_bread;
    }

    this.data.totalNum++
    //前置样式处理 && 库存限制处理
    let flag = this.addChartPreView(currentTab, proInPage, itemIdx, this.data.totalNum);
    if (!flag) {
      return false;
    }

    let curPro = this.data.showList[currentTab][proInPage][itemIdx];
    // console.log(curPro);
    //每次点击都压入
    // console.log(this.data.prePushWatchHash[typeMealIdSpuId]);
    if (typeof (this.data.prePushWatchHash[typeMealIdSpuId]) == "undefined") {
      this.data.prePushWatchlist.push(typeMealIdSpuId);
      this.data.prePushWatchHash[typeMealIdSpuId] = {
        addNum: 1,
        curStock: curStock,
        curType: curType,
        proId: proId,
        typeMealIdSpuId: typeMealIdSpuId,
        cityId: city_id,
        name:name,
        selected: curPro.selected,
        itemIdx: itemIdx,
        trueCityId: this.data.trueCityId,
      };
    } else {
      this.data.prePushWatchHash[typeMealIdSpuId]['addNum'] += 1;
    }
    // this.data.prePushWatchHash[typeMealIdSpuId] = obj;
    // console.log(this.data.prePushWatchlist,this.data.prePushWatchHash)
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      let info;
      while (info = this.data.prePushWatchlist.shift()) {
        this.data.watchContainer.push({
          addNum: this.data.prePushWatchHash[info]['addNum'],
          itemIdx: this.data.prePushWatchHash[info]['itemIdx'],
          curType: this.data.prePushWatchHash[info]['curType'],
          proId: this.data.prePushWatchHash[info]['proId'],
          typeMealIdSpuId: this.data.prePushWatchHash[info]['typeMealIdSpuId'],
          name:this.data.prePushWatchHash[info]['name'],
          cityId: this.data.prePushWatchHash[info]['cityId'],
          selected: this.data.prePushWatchHash[info]['selected'],
          maxStock: this.data.prePushWatchHash[info]['curStock'],
          trueCityId: this.data.prePushWatchHash[info]['trueCityId'],
        })
        this.data.watchNumer = this.data.watchNumer + this.data.prePushWatchHash[info]['addNum']
        delete this.data.prePushWatchHash[info];
      }
      return
    }, 200)
    return
  },
  // testAsync() {
  //   console.log("jinru testAsync")
  //   setTimeout(() => {
  //     console.log("yibu  处理中......")
  //     console.log(this.data.showList);
  //   }, 5000)
  // },
  syncTocart(params) {
    console.log('syncTocart:', params);
    let data = {
      city_id: params['trueCityId'],
      type: params['curType'],
      tab_id: params['proId'],
      number: params['addNum'],
    }

    api.setChart(data).then(res => {
      if (res) {
        wx.setStorageSync("total_num", this.data.totalNum)
        wx.showToast({
          title: '加入购物车成功',
          icon: 'none',
          duration: 2000
        })
        wx.reportAnalytics('addcart', {
          type: params['curType']==1?"面包":"蛋糕",
          tab_id: params['proId'],
          proname:params['name'],
          city_id: params['trueCityId'],
          source:'列表页'
        });
      } else {
        console.log(res)
        wx.showToast({
          title: '该商品已达到最大购买量',
          icon: 'none',
          duration: 2000
        })
      }
    })
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
    tag = typeof (tag) == 'undefined' ? null : tag;
    // console.log("开始分页：", 'pageNum:', pageNum, 'type:', type, 'tag:', tag)
    type = parseInt(type);
    if (!app.data.ProductList_ProList[type]) {
      console.log('getcachePage , !app.data.ProductList_ProList[type]不存在。调用接口 getProList（）。')
      this.getProList();
      return false;
    }

    let tempQuoteList;
    let pageList = [];
    let pagesize = 10;
    //文章兼容
    if (type == 4) {
      pagesize = this.data.pageInfo[type]['all']['pagesize'];
    }
    // console.log(app.data.ProductList_ProList);
    let tempList = [];
    if (tag === null) {
      //全部
      for (let key in app.data.ProductList_ProList[type]) {
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
      this.setData({
        showLoading: false
      })
      return false; //已达最大页数
    }

    if (pageNum <= 0) {
      pageNum = 1;
    }
    let tempPageList = tempList.slice((pageNum - 1) * pagesize, pageNum * pagesize)
    tempQuoteList = app.data.ProductList_ProList[type];
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
      pageInfo: this.data.pageInfo,
      showLoading: false,
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
    let idx = e.currentTarget.dataset.idx
    let itemidx = e.currentTarget.dataset.itemidx
    let spuId = e.currentTarget.dataset.spuid
    let type = e.currentTarget.dataset.type
    let currenttab = e.currentTarget.dataset.currenttab
    let url = "/pages/" + (type == 1 ? 'proInfo/proInfo' : 'cakeInfo/cakeInfo') + "?proId=" + (type == 1 ? proId : spuId) + "";
    url += '&ctabTypeMealIdSpuId=' + currenttab + "_" + type + "_" + proId + "_" + spuId;
    // url+="&_um_campaign=60657afd18b72d2d2441584b&_um_channel=60657afd18b72d2d2441584c"
    console.log(url)
    wx.navigateTo({
      url: url
    })
  },
  onPullDownRefresh() { //下拉刷新
    this.data.isPullDownRefresh = true;
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
    console.log('-----------------------', total_num)
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
    }, 5000)
    debug++;
    // console.log(debug)
    let {
      city_id,
    } = this.data
    let count, noMoreData, currentTab = app.globalData.proType
    city_id = cityid ? cityid : city_id
    let data = {
      city_id: city_id
    }
    let setData = {};
    console.log(this.data)
    console.log(currentTab);
    if (!currentTab) {
      data.tag = 0
      data.type = ""
      setData['showList'] = null;
    } else {
      data.type = currentTab;
      setData['showList[' + currentTab + ']'] = null;
    }

    //文章兼容
    if (currentTab == 4) {
      data.page = this.data.articleDefaultPage
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
      };
      console.log(this.data, this.data.cateChosed)
      if (!this.data.isPullDownRefresh) {
        setData[['cateChosed[' + res.choose_type + ']']] = null;
      }
      // console.log(app.data.ProductList_ProList)
      //重置数据
      if (refresh) {
        app.data.ProductList_ProList = {};
        app.data.ProductList_ProListIndex = {};
        setData['showList'] = {};
        setData['showTags'] = {};
        setData['showStock'] = {};
        setData['cateChosed'] = {};
        setData['pageInfo'] = {};
      }

      this.setData(setData)
      app.data.ProductList_ProList[app.globalData.proType] = [];
      if (app.globalData.proType == 4) {
        //文章
        app.data.ProductList_ProList[app.globalData.proType] = res.article;
      } else {
        app.data.ProductList_ProList[app.globalData.proType] = res.list;
      }

      // console.log('接口返回：', res, 'prolist:', proList);

      //特殊处理
      // console.log('app.globalData.proType', app.globalData.proType)
      // console.log('app.data.ProductList_ProList', app.data.ProductList_ProList)
      switch (parseInt(app.globalData.proType)) {
        case 1:
          console.log('switch  = 1-------------')
          for (let tmpKey in app.data.ProductList_ProList[app.globalData.proType]) {
            let tmpVal = app.data.ProductList_ProList[app.globalData.proType][tmpKey];
            let ctabTypeMealIdSpuId = app.globalData.proType + '_' + tmpVal['type'] + '_' + tmpVal['meal_id'] + "_" + tmpVal['spu_id'];
            app.data.ProductList_ProListIndex[ctabTypeMealIdSpuId] = tmpKey;
            let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
            tmpVal['selectNumberLength'] = selectNumberLength;
            tmpVal['cornerTagStyle'] = this.getAddTapNumStyle(tmpVal.selected);
          }
          break;
        case 2:
          console.log('switch  = 2')
          for (let tmpKey in app.data.ProductList_ProList[app.globalData.proType]) {
            let tmpVal = app.data.ProductList_ProList[app.globalData.proType][tmpKey];
            let ctabTypeMealIdSpuId = app.globalData.proType + '_' + tmpVal['type'] + '_' + tmpVal['meal_id'] + "_" + tmpVal['spu_id'];
            app.data.ProductList_ProListIndex[ctabTypeMealIdSpuId] = tmpKey;
            let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
            tmpVal['selectNumberLength'] = selectNumberLength;
            tmpVal['cornerTagStyle'] = this.getAddTapNumStyle(tmpVal.selected);
          }
          break;
        case 3:
          console.log('switch  = 3')
          for (let tmpKey in app.data.ProductList_ProList[app.globalData.proType]) {
            let tmpVal = app.data.ProductList_ProList[app.globalData.proType][tmpKey];
            let ctabTypeMealIdSpuId = app.globalData.proType + '_' + tmpVal['type'] + '_' + tmpVal['meal_id'] + "_" + tmpVal['spu_id'];
            app.data.ProductList_ProListIndex[ctabTypeMealIdSpuId] = tmpKey;
            // console.log(tmpVal)
            let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
            tmpVal['selectNumberLength'] = selectNumberLength;
            tmpVal['cornerTagStyle'] = this.getAddTapNumStyle(tmpVal.selected);
          }
          break;
        case 4:
          console.log(4)
          break;
      }
      if (app.globalData.proType == 4) {
        if (!this.data.pageInfo.hasOwnProperty(app.globalData.proType)) {
          this.data.pageInfo[app.globalData.proType] = {}
          this.data.pageInfo[app.globalData.proType]['all'] = {}
        }

        if (this.data.pageInfo[app.globalData.proType].hasOwnProperty('all')) {
          this.data.pageInfo[app.globalData.proType]['all'] = {}
        }
        this.data.pageInfo[app.globalData.proType]['all'] = {
          'pageCount': res.page_config.pages, //页总数
          'pagesize': res.page_config.limit,
          'cpage': res.page_config.page,
          'total': res.page_config.total,
        };
        this.setData({
          pageInfo: this.data.pageInfo,
          ['showList[' + app.globalData.proType + '][0]']: app.data.ProductList_ProList[app.globalData.proType],
          showLoading: false,
        });
        // console.log(this.data.showList[app.globalData.proType]);
        // console.log(this.data.pageInfo)
        wx.stopPullDownRefresh()
        return true;
      }
      this.refreshTypeTagInfo(res.choose_type, app.data.ProductList_ProList[app.globalData.proType]);
      let pagel = this.getCachePage(1, res.choose_type, null)
      console.log('proList', app.data.ProductList_ProList, 'pagel', pagel);

      setData = {};
      if (!pagel) {
        this.setData({
          ['showList[' + res.choose_type + '][0]']: null,
          ['showStock[' + res.choose_type + ']']: res.stock,
          ['showCategory[' + res.choose_type + ']']: res.category,
          showLoading: false,
        });
        return false;
      }

      count = pagel.count;
      // noMoreData = pagel.count - pagel.page * pagel.pagesize <= 0;

      if (this.data.isPullDownRefresh) {
        this.choseTagData(res.choose_type, this.data.cateChosed[res.choose_type]);
        // this.setData({
        //   ['cateChosed[' + res.choose_type + ']']: this.data.currentCategory,
        // });
        this.data.isPullDownRefresh = false;
      } else {
        //渲染页面 暂定 看情况
        this.setData({
          ['showList[' + res.choose_type + '][0]']: pagel['pagelist'],
          ['showStock[' + res.choose_type + ']']: res.stock,
          ['showCategory[' + res.choose_type + ']']: res.category,
          showLoading: false,
        });
      }




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
    console.log(selectSku)
    this.setData({
      'selectSku.sku_id': skuid,
      selectSku: selectSku
    })
  },
  confirmCake: util.debounce(function (e) {
    let proId = e.currentTarget.dataset.sku,name = e.currentTarget.dataset.name
    let {
      city_id,
      skuNum,
      action,
      totalNum
    } = this.data

    let data = {
      city_id: this.data.trueCityId,
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

        this.refreshProList(this.data.cakeTempParams.proId, this.data.cakeTempParams.curSpuid, this.data.cakeTempParams.curType, (parseInt(skuNum) + parseInt(this.data.cakeTempParams.selected)))
        this.setData({
          totalNum: totalNum,
          pop: 0
        })
        wx.reportAnalytics('addcart', {
          type: '蛋糕',
          tab_id: proId,
          proname:name,
          city_id: this.data.trueCityId,
          source:'列表页'
        });
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
    // console.log(mealId, spuId, typeId);
    let tmpId = mealId + '_' + spuId + '_' + typeId;
    for (let key1 in app.data.ProductList_ProList) {
      for (let value of app.data.ProductList_ProList[key1]) {
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
    // console.log(proList);
    return
  },
  toLink(e) {
    let url = e.currentTarget.dataset.link;
    let type = e.currentTarget.dataset.linktype
    console.log('toLink', url, 'type', type);
    if (type == 3) {
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.navigateTo({
        url: "/pages/web/web?url=" + url + "",
      })
    }

  },
  getAddTapNumStyle(num) {
    let selectNumberLength = num > 0 ? num.toString().length : 0;
    // tempList['selectNumberLength'] = selectNumberLength;
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
    return style;
  },
  // onPageScroll(e) {
  //   // console.log(e.scrollTop);
  //   let stop = e.scrollTop
  //   if (stop > 46) {
  //     this.setData({
  //       isFixed: true
  //     })
  //   } else {
  //     this.setData({
  //       isFixed: false
  //     })
  //   }
  // },
  async onShow() {
    let userInfo = wx.getStorageSync('userInfo')
    if(!userInfo){
      userInfo = await app.wxLogin()
    }

    if (this.data.backFrom == 1) {
      console.log("详情")
      util.setTabBarBadge(wx.getStorageSync("total_num"));
      this.setData({
        showList: this.data.showList,
      })
      this.data.backFrom = 0;
      return true;
    }

    canCheck = false;
    //自定义tabbar选中
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    let proType = app.globalData.proType
    this.data.trueCityId = city_id;
    //默认不存在的城市 显示全国
    city_id = city_id == 0 ? '10216' : city_id;
    this.setData({
      // cakeList: null,
      // breadList: null,
      currentTab: proType,
      cateChosed: {},
      city_id: city_id || '10216',
      showLoading: true,
      skuNum: 1,
    })
    trueStock = {};
    this.getCartInfo()
    console.log(this.data);
    this.getProList(this.data.city_id, true);
    //重置category动画样式
    this.data.cAnimatPosition = {};
    this.categoryAnimat(0);
  },
  //确认返回途径
  setDetailBack(backNum = 0) {
    this.data.backFrom = backNum;
  },
  onLoad: function () {
    let sysInfo = null
    if (app.globalSystemInfo) {
      sysInfo = app.globalSystemInfo
    } else {
      sysInfo = wx.getSystemInfoSync()
    }
    let fixedTop = sysInfo.navBarHeight;
    let addressInfo = wx.getStorageSync("addressInfo")
    console.log(addressInfo)
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    let btmHolder = wx.getStorageSync('btmHolder')

    //设置临时页面分类等
    // this.setTempTypeTag(1,0);

    this.setData({
      city_id: city_id,
      fixedTop: fixedTop,
      btmHolder: btmHolder || 0,
    })
    //this.getProList();

    util.setWatcher(this);
  },
  onReady() {

  },
  onUnload() {

  },
  watch: {
    'city_id': function (value, oldValue) {
      // console.log("watch");

      if (value == oldValue || this.data.currentTab == '') {
        return
      }
      // app.globalData.proType = ''
      app.data.ProductList_ProList = {};
      let setData = {};
      setData['showList'] = {};
      setData['showTags'] = {};
      setData['showStock'] = {};
      setData['cateChosed'] = {};
      setData['pageInfo'] = {};
      this.setData(setData)
      this.getProList(value);
      console.log(value);
    },
    'watchNumer': function (value, oldValue) {
      console.log(value, oldValue)
      if (value == 0) {
        return false;
      }

      if (this.data.watchNumer >= (Number.MAX_SAFE_INTEGER - 10000)) {
        this.data.watchNumer = 0;
      }

      let info = this.data.watchContainer.shift();
      // console.log(value, oldValue, Number.MAX_SAFE_INTEGER, info)
      this.syncTocart(info)
    }
  }

})