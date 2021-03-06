// components/dialog/dialog.js
Component({
  properties: {
    title: {
      type: String,
      value: '提示'
    },
    showbody:{
      type: Boolean,
      value: true
    },
    title2: {
      type: String,
      value: ''
    },
    title3: {
      type: String,
      value: ''
    },
    width: {
      type: String,
      value: '650rpx'
    },
    opacity: {
      type: Number,
      value: 0.4
    },
    closeOnClickModal: {
      type: Boolean,
      value: false
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
    confirmOpenType: {
      type: String,
      value: ''
    },
    cancelOpenType: {
      type: String,
      value: ''
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
    gatherFormId: {
      type: Boolean,
      value: false
    },
    appParameter: {
      type: String,
      value: ''
    },
    sessionFrom: {
      type: String,
      value: ''
    },
    position: {
      type: String,
      value: 'center'
    }
  },
  data: {
  },
  methods: {
    close() {
      this.triggerEvent('close')
    },
    cancel() {
      this.triggerEvent('cancel')
    },
    confirm() {
      this.triggerEvent('confirm')
    },
    touchMask() {
      if (this.data.closeOnClickModal) {
        this.close()
      }
    },
    formSubmit(e) {
      let formid = e.detail.formId
      if (/requestFormId:fail/.test(formid)) {
        return
      }
      this.triggerEvent('getFormId', {
        formId: formid
      })
    },
    getUserinfo(e) {
      this.triggerEvent('getuserinfo', e.detail)
    },
    contact(e) {
      this.triggerEvent('contact')
    },
    getphonenumber(e) {
      this.triggerEvent('getphonenumber', e.detail)
    },
    opensetting() {
      this.triggerEvent('opensetting')
    },
    launchapp() {
      this.triggerEvent('launchapp')
    }
  }
})