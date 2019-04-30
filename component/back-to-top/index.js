// component/back-to-top/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    backToTop: {
      type: Array,
      value: [
        { url: '../../images/back-to-top.png', name: '顶部'}
      ]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    sendToParent: function (e) {
      this.triggerEvent('rtCornerBar', {index: e.currentTarget.dataset.index})
    }
  }
})