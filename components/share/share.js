// components/scratch/share/share.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sharedata: { // 属性名
      type: Object, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '' // 属性初始值（可选），如果未指定则会根据类型选择一个
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    'showmask': true,
    'showshare': true,
    'showshareimg': false,
    'sharedata': {},
  },
  
 
  /**
   * 组件的方法列表
   */
  methods: {



    // 关闭分享
    hideshare: function() {
      this.setData({
        'showmask': false,
        'showshare': false,
      })

      this.triggerEvent('myevent')
    },
    //朋友圈
    showimg: function() {
     
      this.setData({
        'showshare': false,
        'showshareimg': true,
        'sharedata': this.data.sharedata
      })
    },

    onMyEvent: function() {
      this.setData({
        'showmask': false,
      })
      this.triggerEvent('myevent')
    },
    





  },






})