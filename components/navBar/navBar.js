// components/navBar/navBar.js
Component({
  options:{
    styleIsolation:"apply-shared"
  },
  properties: {
    hasAddress: { // 属性名
      type: Boolean,
      value: false
    },
    hasReturn: { // 属性名
      type: Boolean,
      value: false
    },
    hasBg:{ // 属性名
      type: Boolean,
      value: false
    },
    hasCallback:{ // 属性名
      type: Boolean,
      value: false
    },
    isFold:{
      type: Boolean,
      value: false
    },
    titColor:{
      type:String,
      value:"#222"
    },
    navType:String,
    cityName:Object,
    title:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },
  created: function() {
    this.getSystemInfo();
  },
  attached: function() {
    this.setStyle(); //设置样式
  },
  pageLifetimes: {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    return:function(e){
      let pages = getCurrentPages()
      if(pages.length==1){
        wx.switchTab({
          url: '/pages/index/index'
        })
      }else{
        wx.navigateBack({//返回
          delta: 1
        })
      }
    },
    // 关闭分享
    hideshare: function() {
      this.setData({
        'showmask': false,
        'showshare': false,
      })

      this.triggerEvent('myevent')
    },

    onMyEvent: function() {
      this.setData({
        'showmask': false,
      })
      this.triggerEvent('myevent')
    },
    setStyle: function(life) {
      const {
        statusBarHeight,
        navBarHeight,
        capsulePosition,
        ios,
        windowWidth
      } = getApp().globalSystemInfo;

      let rightDistance = windowWidth - capsulePosition.right; //胶囊按钮右侧到屏幕右侧的边距
      let leftWidth = windowWidth - capsulePosition.left; //胶囊按钮左侧到屏幕右侧的边距
      let statusHeight = statusBarHeight

      let navWarpStyle = [
        `height:${navBarHeight - statusBarHeight}px`,
        `padding-right:${leftWidth}px`,
      ].join(';');

      this.setData({
        navWarpStyle,
        navBarHeight,
        statusHeight,
        capsulePosition,
        ios
      });

    },

    getSystemInfo() {
      var app = getApp();
      if (app.globalSystemInfo && !app.globalSystemInfo.ios) {
        return app.globalSystemInfo;
      } else {
        let systemInfo = wx.getSystemInfoSync();
        let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
        console.log(systemInfo.system)
        let rect;
        try {
          rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
          if (rect === null) {
            throw 'getMenuButtonBoundingClientRect error';
          }
          //取值为0的情况  有可能width不为0 top为0的情况
          if (!rect.width || !rect.top || !rect.left || !rect.height) {
            throw 'getMenuButtonBoundingClientRect error';
          }
        } catch (error) {
          let gap = ''; //胶囊按钮上下间距 使导航内容居中
          let width = 96; //胶囊的宽度
          
          if (systemInfo.platform === 'android') {
            gap = 8;
            width = 96;
          } else if (systemInfo.platform === 'devtools') {
            if (ios) {
              gap = 5.5; //开发工具中ios手机
            } else {
              gap = 7.5; //开发工具中android和其他手机
            }
          } else {
            gap = 4;
            width = 88;
          }
          if (!systemInfo.statusBarHeight) {
            //开启wifi的情况下修复statusBarHeight值获取不到
            systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
          }
          rect = {
            //获取不到胶囊信息就自定义重置一个
            bottom: systemInfo.statusBarHeight + gap + 32,
            height: 32,
            left: systemInfo.windowWidth - width - 10,
            right: systemInfo.windowWidth - 10,
            top: systemInfo.statusBarHeight + gap,
            width: width
          };
          console.log('error', error);
          console.log('rect', rect);
        }
        let navBarHeight = '',navBarExtendHeight=0
        
        if (!systemInfo.statusBarHeight) {
          systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
          navBarHeight = (function() {
            let gap = rect.top - systemInfo.statusBarHeight;
            return 2 * gap + rect.height;
          })();
          
          systemInfo.statusBarHeight = 0;
          navBarExtendHeight = 4; //下方扩展4像素高度 防止下方边距太小
        } else {
          if (ios) {
            navBarExtendHeight = 4; //下方扩展4像素高度 防止下方边距太小
          }

          navBarHeight = (function() {
            let gap = rect.top - systemInfo.statusBarHeight;
            return systemInfo.statusBarHeight+ navBarExtendHeight + 2 * gap + rect.height;
          })();
          
        }
        console.log(navBarHeight)
        systemInfo.navBarHeight = navBarHeight; //导航栏高度不包括statusBarHeight
        systemInfo.capsulePosition = rect; //右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
        systemInfo.ios = ios; //是否ios

        app.globalSystemInfo = systemInfo; //将信息保存到全局变量中,后边再用就不用重新异步获取了

        console.log('systemInfo', systemInfo);
        return systemInfo;
      }
    },
    toHome(){
      wx.switchTab({
        url: '/pages/index/index'
      })
    },
    toSelectCity(){
      wx.navigateTo({
        url: '/pages/user/address/address'
      })
    }
  },


})