// 是否可点击，控制点击频率
let canClick = true
let isMove=false
let itemW=164   //rpx,包括margin
Component({
  properties: {
    movies: {
      type: Array,
      value: [],
    },
    defaultSelectID: {
      type: String,
      value: ''
    }
  },
  data: {
    movie: null, //选中的电影
    size: 0, //电影item的大小（包括margin）
    i: 0, //当前电影的索引
    screenRate: 2,
    animationData: {},
    pos:0
  },
  lifetimes: {
    attached: function () {
      let systemInfo = getApp().globalSystemInfo
      // 750除以屏幕宽度，得到转换比。因为API用的和得到的大部分的单位都是px，所以还是要转一下
      let screenRate = 750 / systemInfo.screenWidth
        
      let size=parseInt(itemW/screenRate)  //px
      this.setData({
        size:size,
        screenRate: screenRate
      })
      let animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
      })
      this.animation = animation
    }
  },
  observers: {
    'movies': function() { 
      this.initMovie()
    }
  },
  methods: {
    initMovie(){
      let {movies} = this.data
      if(!movies || movies.length==0){
        return
      }
      let index = movies.findIndex(item => item.film.filmId == this.properties.defaultSelectID)
      index = index==-1?0:index
      console.log(index);
      this.selectMovie(null,index)
    },
    //选中电影
    selectMovie(e,i) {
      let movieIdx = ( e&&e.currentTarget.dataset.movieidx+'' ) || i
      let movie = this.data.movies[movieIdx]
  
      if(e && movieIdx==this.data.curIdx){
        return
      }

      this.animation.translateX(-(this.data.size * movieIdx)).step()
      this.setData({
        curIdx:movieIdx,
        i:movieIdx,
        movie,
        animationData: this.animation.export()
      })
      
      this.triggerEvent('selectMovie', {
        movie
      })
    },
    touchstart(e){
      let touch = e.touches[0].pageX
      this.setData({
        left:touch
      })
    },
    touchmove(e) {
      // 频率控制，一次移动完成后，才能进行下一次
      if (this.isMove) {
        return
      }
      let moveLength = Math.floor((e.touches[0].pageX - this.data.left) * this.data.screenRate)
      console.log(moveLength);
      moveLength = moveLength > 60 ? 60 : moveLength
      moveLength = moveLength < -60 ? -60 : moveLength
      let rate = moveLength / 60
      if (rate == 1) { //从右往左滑
        this.tapLeft()
      } else if (rate == -1) { //从左往右滑
        this.tapRight()
      }
    },
    // 往左移
    tapLeft() {
      let i = this.data.i
      if(i==0){
        return
      }
      i--
      this.selectMovie(null,i)
      this.isMove = true
    },

    tapRight() {
      let i = this.data.i
      if(i==this.data.movies.length-1){
        return
      }
      i++
      this.selectMovie(null,i)
      this.isMove = true
    },
    animationend(){
      this.isMove = false
      //this.canClick = true
    }

  }
})