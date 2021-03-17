//index.js
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const app = getApp()
let syncflag = true; //异步数据开关
let lastWord = ''; //异步搜索对比字符
let getWord = ''; //触发存储搜索关键字
let timer = null;
Page({
  customData: {
    scrollTop: 0,
  },
  data: {
    currentKeyword: '',
    keywordTag: {},
    searchList: {},
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
  addCart(e) {
    console.log('start  addCart');
    console.log(this.data.searchList);

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
  },
  onShow: function () {

    // this.setData({
    //   fixedTop: fixedTop
    // })
  },

  onLoad: function (option) {
    //请求记录接口
    this.flashTap();
    this.toCart = this.selectComponent('#toCartId');
  },
})