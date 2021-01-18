Component({
  options:{
    styleIsolation:"apply-shared",
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: '提示'
    },
    showbody:{
      type: Boolean,
      value: true
    },
    width: {
      type: String,
      value: '630rpx'
    },
    closeOnClickModal: {
      type: Boolean,
      value: false
    },
    maskTouch: {
      type: Boolean,
      value: true
    },
    animation: {
      type: Boolean,
      value: true
    },
    confirmText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmColor: {
      type: String,
      value: '#333333'
    },
    cancelColor: {
      type: String,
      value: '#999999'
    },
    showConfirm: {
      type: Boolean,
      value: true
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    confirmBackgroundColor: {
      type: String,
      value: '#ffffff'
    },
    cancelBackgroundColor: {
      type: String,
      value: '#ffffff'
    },
    loading: {
      type: Boolean,
      value: false
    },
    position: {
      type: String,
      value: 'center'
    },
    popShow:{
      type: Boolean,
      value: false
    },
    unuse:{
      type: Boolean,
      value: true
    },
  },
  data: {
    
  },
  attached: function() {
    console.log(this.data.showCancel)
  },
  methods: {
    close() {
      this.triggerEvent('close')
      this.setData({
        popShow:false
      })
    },
    cancel() {
      this.triggerEvent('cancel')
    },
    confirm() {
      this.triggerEvent('confirm',this.data.unuse)
    },
    touchMask() {
      if(this.data.maskTouch){
        this.close()
      }
    }
  }
})