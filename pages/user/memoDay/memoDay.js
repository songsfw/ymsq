const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')

const date = new Date()
var monString = ["正","二","三","四","五","六","七","八","九","十","冬","腊"];
var numString = ["一","二","三","四","五","六","七","八","九","十"];
var start = date.getFullYear() - 100

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:0,
    years:[],
    year: date.getFullYear(),
    months:[],
    month: 2,
    days:[],
    day: 2,
    value: [100, 0, 0],
    dayLi:[
      {
        tit:"纪念日一",
        img:"../../../image/d1.png"
      },
      {
        tit:"纪念日二",
        img:"../../../image/d2.png"
      },
      {
        tit:"纪念日三",
        img:"../../../image/d3.png"
      },
    ],
    dateList : null,
    showbg:'',
  },
  onfocus(e){
    this.setData({
      showbg:e.currentTarget.dataset.id
    })
  },
  onblur(){
    this.setData({
      showbg:'',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let end = new Date().getFullYear()
    let userInfo = wx.getStorageSync('userInfo')
    let btmHolder = wx.getStorageSync('btmHolder')
    //btmHolder = btmHolder>0?btmHolder:12
    if(userInfo){
      userInfo = JSON.parse(userInfo)
    }
    console.log(end-100);
    this.setData({
      btmHolder:btmHolder,
      user_id:userInfo.user_id,
      start:end-100,
      end:end
    })
  },
  selectDate(e){
    let idx = e.currentTarget.dataset.idx
    let dateList = this.data.dateList
    let type = dateList[idx].type
    this.setData({
      showDate:true,
      currIdx:idx,
      type
    })
    this.getDateList()
  },
  confirmDate(){
    let {currIdx,year} = this.data
    let val = this.data.val || this.data.value
    let month = parseInt([val[1]])+1,day=parseInt([val[2]])+1
    let yearStr = `${year}-${month}-${day}`
    this.setData({
      ['dateList['+currIdx+'].date']:yearStr
    })
    this.closeDate()
  },
  closeDate(){
    this.setData({
      showDate:false
    })
  },
  getDateList(){
    let type = this.data.type,years=[],months=[],days=[],day=""
    for (let i = start; i <= date.getFullYear(); i++) {
      years.push(i)
    }
    if(type==0){
      for (let i = 1; i <= 12; i++) {
        months.push(i)
      }
      
      for (let i = 1; i <= 31; i++) {
        days.push(i)
      }
    }else{
      for (let i = 1; i <= 12; i++) {
        months.push(monString[i-1])
      }
      
      for (let i = 1; i <= 30; i++) {
        if(i<11){
          day="初"+numString[i-1]
        }
        if(i>=11 && i<20){
          day="十"+ numString[i%10-1] 
        }
        if(i>20){
          day="廿"+ numString[i%10-1] 
        }
        if(i==20){
          day="廿十"
        }
        if(i==30){
          day="三十"
        }
        days.push(day)
      }
    }
    this.setData({
      years:years,
      months:months,
      days:days
    })
  },
  inputName:util.debounce(function(e){
    let idx = e.target.dataset.idx
    this.setData({
      ['dateList['+ idx +'].title']: e.detail.value
    })
  },500),
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    const val = e.detail.value
    let month = val[1]+1,days=[]
    let year = this.data.year
    let dayLen = null
    let type = this.data.type
    if(type==0){
      if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
        dayLen=31
      } else if (month == 2) {
          if (year % 4 == 0 && year % 100 != 0) {
            dayLen=29
          } else if (year % 400 == 0) {
            dayLen=29
          } else {
            dayLen=28
          }
      } else {
        dayLen=30
      }
      for (let i = 1; i <= dayLen; i++) {
        days.push(i)
      }
      this.setData({
        days
      })
    }
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]],
      val
    })
  },
  changeType(){
    let type = this.data.type,val = this.data.val || this.data.value
    let currIdx = this.data.currIdx
    if(type==0){
      this.setData({
        type:1
      })
    }else{
      this.setData({
        type:0
      })
    }
    this.getDateList()
    this.setData({
      ['dateList['+ currIdx +'].type']:this.data.type,
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },
  getMemoDay(){
    api.getMemoDay().then(res=>{
      console.log(res);
      if(!res) return
      const { list, doc ,available_day} = res;
      let dateList = []
      list.forEach((item,index)=>{
        dateList[index] = item
      })
      this.setData({
        dateList:dateList,
        doc,
        available_day
      })
    })
  },
  showRule(){
    this.setData({
      popShow:true
    })
  },
  save(){
    
    let {dateList} = this.data

    let newdateLi = JSON.stringify(dateList)
    let data = {
      data :newdateLi
    }
    console.log(data)
    api.setMemoDay(data).then(res=>{
      console.log(res);
      if(!res) return
      wx.showToast({
        title: '纪念日设置成功'
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMemoDay()
    this.getDateList()
    this.setData({
      value:[100,0,0]
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})