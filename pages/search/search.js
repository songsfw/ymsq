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
let trueStock = {}; //真实购物车数量
Page({
  customData: {
    scrollTop: 0,
  },
  data: {
    currentKeyword: '',
    keywordTag: {},
    searchList: {},
    recommendList:[
      {'id':1,name:"商品1"},
      {'id':2,name:"商品2"},
    ],
    order_max_bread:100,
    totalNum:0,
  },
  onPageScroll: function (e) {
    this.customData.scrollTop = e.scrollTop;
  },
  //取消
  cancle: function () {
    getWord = '';
    this.setData({
      currentKeyword: '',
      searchList: {},
    })
    this.flashTap();
  },
  //onblur
  getWords: function (e) {
    let val = e.detail.value
    getWord = val;
    if (getWord == '') {
      this.setData({
        currentKeyword: '',
        searchList: {},
      })
      this.flashTap();
    }
  },
  //搜索按钮事件
  search: function (e) {
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
    let word = e.currentTarget.dataset.word
    getWord = word;
    syncflag = true;
    this.toSearch(word)
  },
  //主体搜索
  toSearch(word) {
    lastWord = word;
    if (!word) {
      syncflag = false;
      this.setData({
        currentKeyword: '',
        searchList: {},
      })
      this.flashTap();
      return false
    }

    // //关闭搜索列表
    this.setData({
      currentKeyword: word,
    })

    let cityId = JSON.parse(wx.getStorageSync("addressInfo")).city_id;
    cityId = cityId == 0 ? '10216' : cityId;
    // console.log(JSON.parse(wx.getStorageSync("addressInfo")))
    //延迟请求 也可以关闭凭借点击
    api.keywordSearch({
      keyword: word,
      city_id: cityId || '10216'
    }).then(res => {
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
      console.log(searchList)
      // 设置搜索结果
      this.setData({
        currentKeyword: word,
        searchList: searchList,
        order_max_bread:res['order_max_bread'] || 99,
      })
    })
  },
  //更新标签
  flashTap() {
    api.keywordList().then(res => {
      if (res) {
        console.log('this.flashTap();')
        this.setData({
          keywordTag: res
        })
      }
    })
  },

  toProInfo: function (e) {
    let proId = e.currentTarget.dataset.proid
    let spu = e.currentTarget.dataset.spu;
    let url = "/pages/" + (proId == 0 ? 'cakeInfo/cakeInfo' : 'proInfo/proInfo') + "?proId=" + (proId == 0 ? spu : proId) + "";
    console.log(url);
    wx.navigateTo({
      url: url
    })
  },
  addChartPreView(itemIdx, totalNum) {
    let tempList = this.data.searchList['list'][itemIdx];
    let proStock = tempList.type == 1 ? this.data.searchList['stock'][tempList['meal_id']] : this.data.order_max_bread;

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
    // util.setTabBarBadge(totalNum)
    //此处报错。
    this.setData({
      searchList:this.data.searchList
      // ['searchList["list"]["' + itemIdx + '"]']: tempList,
    })
    return true;
  },
  addCart(e) {
    console.log('start  addCart');
 

    let proId = e.currentTarget.dataset.id,
      img = e.currentTarget.dataset.img,
      typeMealIdSpuId = e.currentTarget.dataset.typemealidspuid,
      // proInPage = e.currentTarget.dataset.idx, //当前商品所在页
      itemIdx = e.currentTarget.dataset.itemidx,
      curType = e.currentTarget.dataset.type,
      curSpuid = e.currentTarget.dataset.spuid; //当前商品所在页序号
    //如果是蛋糕触发函数
    if (curType == 2) {
      this.showPop(e);
      return
    }

    let {
      city_id,
    } = this.data


    //如果切换商品，重置统一变量添加数量
    // console.log(lastTypeMealIdSpuId,'-',typeMealIdSpuId)
    if (lastTypeMealIdSpuId != typeMealIdSpuId) {
      proNum = 0;
    }
    lastTypeMealIdSpuId = typeMealIdSpuId;
    console.log(proId, itemIdx,'typeMealIdSpuId',typeMealIdSpuId,'this.data.searchList',this.data.searchList);
    //存储真实库存
    if (typeof (trueStock[typeMealIdSpuId]) == 'undefined') {
      trueStock[typeMealIdSpuId] = false;
    }
    console.log(this.data.searchList['list'][itemIdx]);

    if (trueStock[typeMealIdSpuId] === false) {
      trueStock[typeMealIdSpuId] = this.data.searchList['list'][itemIdx].selected || 0;
    }
    // console.log(trueStock,curType)
    // for (let tIndex in this.data.searchList[itemIdx]) {
    //   let tmpIDName = this.data.showList[currentTab][proInPage][tIndex].type + "_" + this.data.showList[currentTab][proInPage][tIndex].meal_id + "_" + this.data.showList[currentTab][proInPage][tIndex].spu_id;
    //   if (trueStock[typeMealIdSpuId] === false && tmpIDName == typeMealIdSpuId) {
    //     trueStock[typeMealIdSpuId] = this.data.showList[currentTab][proInPage][tIndex].selected || 0;
    //   }
    // }
    //需要更新页码 序号  proInPage 0起

    //容器中当前点击商品的 curIndexInShowlist
    //当前库存
    let curStock = this.data.searchList['stock'][proId] || this.data.order_max_bread;
    console.log(curStock);
    // if (curType == 1) {
    //   curStock = this.data.showStock[currentTab][proId];
    // } else {
    //   curStock = this.data.showStock[currentTab][curSpuid] || this.data.order_max_bread;
    // }

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
    let flag = this.addChartPreView(itemIdx, this.data.totalNum);
    if (!flag) {
      return false;
    }

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      //多余库存处理
      let tempList = this.data.searchList['list'][itemIdx];
      let proStock = this.data.searchList['stock'][tempList['meal_id']] || this.data.order_max_bread;
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
      // console.log(tempList.selected, proStock, trueStock[typeMealIdSpuId], refNum)
      // return;
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

          this.refreshProList(proId, curSpuid, curType, (parseInt(refNum) + parseInt(trueStock[typeMealIdSpuId])));
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
  onShow: function () {

    // this.setData({
    //   fixedTop: fixedTop
    // })
  },

  onLoad: function (option) {
    //请求记录接口
    this.flashTap();
    // this.toCart = this.selectComponent('#toCartId');
    let addressInfo = wx.getStorageSync("addressInfo")
    let city_id = addressInfo && JSON.parse(addressInfo).city_id
    //默认不存在的城市 显示全国
    city_id = city_id == 0 ? '10216' : city_id;
    this.setData({
      city_id: city_id || '10216',
    })
  },
  toLocal(e){
    console.log("-------")
    wx.navigateTo({
      url: "/pages/localTest/localTest",
    })
  }
})