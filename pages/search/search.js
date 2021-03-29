//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()
let syncflag = true; //异步数据开关
let lastWord = ''; //异步搜索对比字符
let getWord = ''; //触发存储搜索关键字
let timer = null;

// 购物车相关
let lastTypeMealIdSpuId;
let proNum;
let testProNum = 0;
let trueStock = {}; //真实购物车数量
Page({
  customData: {
    scrollTop: 0,
  },
  data: {
    showLoading:true,
    inputHidden: false,
    currentKeyword: '',
    keywordTag: {},
    recommendList: [{
        'id': 1,
        name: "商品1"
      },
      {
        'id': 2,
        name: "商品2"
      },
    ],
    order_max_bread: 100,
    totalNum: 0,
    totalNumStyle: "",
    skuNum: 1,
    pop: 0, //角标初始是隐藏的
    confirmCakeItemIdx: null, //蛋糕所在列表序号

    //test
    watchNumer: 0,
    watchContainer: [],
    prePushWatchlist: [], //预处理栈
    prePushWatchHash: {}, //预处理堆

    focus: true,
  },
  onPageScroll: function (e) {
    this.customData.scrollTop = e.scrollTop;
  },
  //取消
  cancle: function () {
    getWord = '';
    app.data.SearchSearch_SearchList = {};
    this.setData({
      currentKeyword: '',
      searchList: app.data.SearchSearch_SearchList,
      inputHidden: false,
    })
    this.flashTap();
  },
  //onblur
  getWords: function (e) {
    let val = e.detail.value
    getWord = val;
    if (getWord == '') {
      app.data.SearchSearch_SearchList = {};
      this.setData({
        currentKeyword: '',
        searchList: app.data.SearchSearch_SearchList,
      })
      this.flashTap();
    }
  },
  toInput() {
    if(this.data.showLoading){
      return false;
    }
    console.log(1111)

    this.setData({
      inputHidden: false,
      focus: true,
    })
  },
  //搜索按钮事件
  search: function (e) {
    this.setData({showLoading:true});
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      syncflag = true;
      this.toSearch(getWord)
    }, 100)
    return;
  },
  //标签点击
  clickTap(e) {
    this.setData({
      showLoading: true,
    })
    let word = e.currentTarget.dataset.word
    getWord = word;
    syncflag = true;
    this.toSearch(word)
  },
  clickClearHistory(e) {
    wx.showModal({
      title: '',
      content: '确定清除所有历史搜索吗？',
      cancelText: "再想想",
      confirmText: "确定",
      confirmColor: "#C1996B",
      success: res => {
        if (res.confirm) {
          this.flashTap(true)
        } else if (res.cancel) {
          return
        }
      }
    })

    
  },
  //主体搜索
  toSearch(word) {
    lastWord = word;
    if (!word) {
      syncflag = false;
      app.data.SearchSearch_SearchList = {};
      this.setData({
        currentKeyword: '',
        searchList: app.data.SearchSearch_SearchList,
      })
      this.flashTap();
      return false
    }

    // //关闭搜索列表
    this.setData({
      currentKeyword: word,
      inputHidden: true,
    })

    let cityId = JSON.parse(wx.getStorageSync("addressInfo")).city_id;
    cityId = cityId == 0 ? '10216' : cityId;
    let data = {
      keyword: word,
      city_id: cityId || '10216'
    }

    // if(clearHis){
    //   data['action'] = "delete";
    // }
    console.log(data)
    api.keywordSearch(data).then(res => {
      if (!syncflag || lastWord != word) {
        console.log('syncflag:', syncflag, 'lastWord:', lastWord, 'word:', word)
        return false;
      }
      let searchList = {};
      searchList['list'] = res['list'];
      searchList['stock'] = res['stock'];

      // if(word != getWord){
      //快速编辑重置解决 暂时等待确定是否解决
      // word = getWord
      // }

      //重置小标样式
      for (let tmpIndex in searchList['list']) {
        let tmpVal = searchList['list'][tmpIndex];
        let selectNumberLength = tmpVal.selected > 0 ? tmpVal.selected.toString().length : 0;
        tmpVal['selectNumberLength'] = selectNumberLength;
        tmpVal['cornerTagStyle'] = this.getAddTapNumStyle(tmpVal.selected);
        let ctabTypeMealIdSpuId =  tmpVal['type'] + '_' + tmpVal['meal_id'] + "_" + tmpVal['spu_id'];
        app.data.SearchSearch_SearchListIndex[ctabTypeMealIdSpuId] = tmpIndex;
      }
      // 设置搜索结果
      app.data.SearchSearch_SearchList = searchList;
      this.setData({
        currentKeyword: word,
        searchList: app.data.SearchSearch_SearchList,
        order_max_bread: res['order_max_bread'] || 99,
        inputHidden: true,
        showLoading: false,
      })
    })
  },
  //更新标签
  flashTap(clearHis) {
    let data = {};
    if (clearHis) {
      data['action'] = 'delete';
    }
    api.keywordList(data).then(res => {
      if (res) {
        console.log('this.flashTap();')
        this.setData({
          keywordTag: res,
          showLoading: false,
        })
      }
    })
  },

  toProInfo: function (e) {
    let proId = e.currentTarget.dataset.proid
    let spuId = e.currentTarget.dataset.spuid
    let type = e.currentTarget.dataset.type
    let url = "/pages/" + (type == 1 ? 'proInfo/proInfo' : 'cakeInfo/cakeInfo') + "?proId=" + (type == 1 ? proId : spuId) + "";
    url += '&ctabTypeMealIdSpuId=' + type +"_"+proId+"_"+spuId;
    wx.navigateTo({
      url: url
    })
  },
  addChartPreView(itemIdx) {
    let tempList = app.data.SearchSearch_SearchList['list'][itemIdx];
    let proStock = tempList.type == 1 ? app.data.SearchSearch_SearchList['stock'][tempList['meal_id']] : this.data.order_max_bread;

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
    tempList['cornerTagStyle'] = this.getAddTapNumStyle(tempList.selected);;
    tempList['selectNumberLength'] = selectNumberLength;
    // util.setTabBarBadge(totalNum)
    //此处报错。
    this.setData({
      searchList: app.data.SearchSearch_SearchList,
      totalNum: this.data.totalNum,
      totalNumStyle: this.getTotalNumStyle(this.data.totalNum),
    })
    return true;
  },
  addCart(e) {
    let proId = e.currentTarget.dataset.id,
      img = e.currentTarget.dataset.img,
      typeMealIdSpuId = e.currentTarget.dataset.typemealidspuid,
      itemIdx = e.currentTarget.dataset.itemidx,
      curType = e.currentTarget.dataset.type;
    //如果是蛋糕触发函数
    if (curType == 2) {
      this.showPop(e);
      return
    }

    //存储真实库存
    if (typeof (trueStock[typeMealIdSpuId]) == 'undefined') {
      trueStock[typeMealIdSpuId] = false;
    }

    if (trueStock[typeMealIdSpuId] === false) {
      //确认第一次操作赋值已加入购物车数量
      trueStock[typeMealIdSpuId] = parseInt(app.data.SearchSearch_SearchList['list'][itemIdx].selected) || 0; //30
    }

    //当前库存
    let curStock = app.data.SearchSearch_SearchList['stock'][proId] || this.data.order_max_bread;
    this.data.totalNum++
    //前置样式处理 && 库存限制处理
    let flag = this.addChartPreView(itemIdx);
    if (!flag) {
      return false;
    }

    if (typeof (this.data.prePushWatchHash[typeMealIdSpuId]) == "undefined") {
      this.data.prePushWatchlist.push(typeMealIdSpuId);
      this.data.prePushWatchHash[typeMealIdSpuId] = {
        addNum: 1,
        curStock: curStock,
        curType: curType,
        proId: proId,
        typeMealIdSpuId: typeMealIdSpuId,
        cityId: this.data.city_id,
        selected: app.data.SearchSearch_SearchList['list'][itemIdx].selected,
        itemIdx: itemIdx,
      };
    } else {
      this.data.prePushWatchHash[typeMealIdSpuId]['addNum'] += 1;
    }

    //追加操作
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
          cityId: this.data.prePushWatchHash[info]['cityId'],
          selected: this.data.prePushWatchHash[info]['selected'],
          maxStock: this.data.prePushWatchHash[info]['curStock'],
        })
        this.data.watchNumer = this.data.watchNumer + this.data.prePushWatchHash[info]['addNum']
        delete this.data.prePushWatchHash[info];
      }
      return
    }, 200)
    return;
  },
  showPop(e) {
    let proId = e.currentTarget.dataset.id,
      img = e.currentTarget.dataset.img,
      typeMealIdSpuId = e.currentTarget.dataset.typemealidspuid,
      proInPage = e.currentTarget.dataset.idx, //当前商品所在页
      itemIdx = e.currentTarget.dataset.itemidx,
      curType = e.currentTarget.dataset.type,
      curSpuid = e.currentTarget.dataset.spuid; //当前商品所在页序号

    let product = app.data.SearchSearch_SearchList['list'][itemIdx];
    console.log('app.data.SearchSearch_SearchList[list]',app.data.SearchSearch_SearchList['list'], 'itemIdx', itemIdx, product)
    let cakeTempParams = {
      proId: proId,
      proInPage,
      itemIdx,
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
          confirmCakeItemIdx: itemIdx,
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
  confirmCake: util.debounce(function (e) {
    let proId = e.currentTarget.dataset.sku;
    let itemIdx = e.currentTarget.dataset.idx;
    // console.log(itemIdx)
    let {
      city_id,
      skuNum,
      totalNum
    } = this.data

    let data = {
      city_id: city_id,
      type: '2',
      tab_id: proId,
      number: skuNum
    }
    totalNum = totalNum + skuNum;
    this.data.totalNum = totalNum;
    api.setChart(data).then(res => {
      if (res) {
        // util.setTabBarBadge(totalNum)
        wx.setStorageSync('total_num', totalNum)
        wx.showToast({
          icon: "none",
          title: '加入购物车成功'
        })

        let tempList = app.data.SearchSearch_SearchList['list'][itemIdx];
        tempList.selected = parseInt(skuNum) + parseInt(tempList.selected);
        let selectNumberLength = tempList.selected > 0 ? tempList.selected.toString().length : 0;
        tempList['selectNumberLength'] = selectNumberLength;
        tempList['cornerTagStyle'] = this.getAddTapNumStyle(tempList.selected);

        // let pagelist = this.getCachePage(proInPage + 1, currentTab, this.data.currentCategory);
        this.setData({
          totalNum: this.data.totalNum,
          searchList: app.data.SearchSearch_SearchList,
          pop: 0,
          totalNumStyle: this.getTotalNumStyle(this.data.totalNum),
        })
      }
    })
  }, 300, true),
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
  getTotalNumStyle(num) {
    let selectNumberLength = num ? num.toString().length : 0;
    let style = "";
    switch (selectNumberLength) {
      case 1:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px;width:5px;";
        break;
      case 2:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:50%;line-height:5px";
        break;
      default:
        style += "padding:4px 4px;right:7px;top:5px;border-radius:40rpx;line-height:5px";
        break;
    }
    return style;
  },
  toCartPage(e) {
    let url = "/pages/cart/cart/cart";
    console.log(url)
    wx.navigateTo({
      url: url
    })
  },
  //同步库存
  syncTocart(params) {
    console.log('syncTocart:', params);
    let data = {
      city_id: params['cityId'],
      type: params['curType'],
      tab_id: params['proId'],
      number: params['addNum'],
    }

    api.setChart(data).then(res => {
      if (res) {
        wx.showToast({
          title: '加入购物车成功',
          icon: 'none',
          duration: 2000
        })
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

  //购物车返回处理 将废弃
  cartPageSyncList(params) {
    console.log(params)
    if (typeof(params['type']) == "undefined" || typeof(params['proId']) == "undefined" || typeof(params['selected']) == "undefined") {
      return
    }
    console.log(params)
    console.log(app.data.SearchSearch_SearchList);
    if (this.data.searchList['list'] && this.data.searchList['list'].length > 0) {
      for (let value of this.data.searchList['list']) {
        if (value['type'] == params['type']) {
          let tmpListProId = value['type'] == 2 ? value['spu_id'] : value['meal_id'];
          if (tmpListProId == params['proId']) {
            value['selected'] = params['selected'];
            value['cornerTagStyle'] = this.getAddTapNumStyle(params['selected']);
            this.setData({
              searchList: this.data.searchList,
              totalNum: wx.getStorageSync('total_num') || 0
            })
          }
        }
      }
    }
  },
  onShow: function (e) {
    this.data.watchNumer = 0;
    if(this.data.currentKeyword){
      let totalNumber = wx.getStorageSync('total_num') || 0;
      this.setData({
        searchList:app.data.SearchSearch_SearchList,
        totalNum:totalNumber,
        totalNumStyle: this.getTotalNumStyle(totalNumber) || '',
      });
    }
    
  },
  onLoad: function (option) {
    console.log('onload')
    //请求记录接口
    this.flashTap();
    // this.toCart = this.selectComponent('#toCartId');
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    //默认不存在的城市 显示全国
    city_id = city_id == 0 ? '10216' : city_id;
    let totalNumber = wx.getStorageSync('total_num') || 0;
    this.setData({
      city_id: city_id || '10216',
      totalNum: totalNumber,
      totalNumStyle: this.getTotalNumStyle(totalNumber) || '',
      keyword:'',
    })

    util.setWatcher(this);
  },
  watch: {
    'watchNumer': function (value, oldValue) {
      if (value == 0) {
        return false;
      }

      if (this.data.watchNumer >= (Number.MAX_SAFE_INTEGER - 1000)) {
        this.data.watchNumer = 0;
      }

      let info = this.data.watchContainer.shift();
      console.log(value, oldValue, Number.MAX_SAFE_INTEGER, info)
      this.syncTocart(info)
    }
  },
  toLocal(e) {
    console.log("-------")
    wx.navigateTo({
      url: "/pages/localTest/localTest",
    })
  }
})