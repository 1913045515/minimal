class floatButton {
  constructor(page, pathKey, setting) {
    this.page = page;
    this.key = pathKey;
    this.image = setting.image;
    this.imageWidthRadio = setting.imageWidthRadio ? setting.imageWidthRadio : 0.1;
    this.imageRadio = setting.imageRadio ? setting.imageRadio : 1;
    this.onLeft = setting.onLeft;
    this.topPos = setting.topPos ? setting.topPos : 0.5;
    this.pageInX
    this.pageInY
    this.pageInLeft
    this.pageInTop
    this.screenHeight
    this.screenWidth
    this.fbHeight
    this.fbWidth
    this.fbLeft
    this.fbTop
    var that = this
    this.thisData = {
      _fb_image: this.image,
      _fb_touch_start: "_fb_touch_start" + "_" + this.key,
      _fb_touch_move: "_fb_touch_move" + "_" + this.key,
      _fb_touch_release: "_fb_touch_release" + "_" + this.key,
      _fb_tap: "_fb_tap" + "_" + this.key,
    };
    this.page[this.thisData._fb_touch_start] = this.onFBTouch.bind(this);
    this.page[this.thisData._fb_touch_move] = this.onFBMove.bind(this);
    this.page[this.thisData._fb_touch_release] = this.onFBRelease.bind(this);
    wx.getSystemInfo({
      success: function (res) {
        that.screenHeight = res.windowHeight
        that.screenWidth = res.windowWidth
        that.fbHeight = that.screenHeight * that.imageWidthRadio
        that.fbWidth = that.fbHeight * that.imageRadio
        if (that.onLeft) {
          that.fbLeft = -that.fbWidth / 2
        }
        else {
          that.fbLeft = that.screenWidth - that.fbWidth / 2 * 2
        }
        that.fbTop = that.screenHeight * that.topPos - that.fbHeight / 2

        that.thisData._fb_height = that.fbHeight;
        that.thisData._fb_width = that.fbWidth;
        that.thisData._fb_top = that.fbTop;
        that.thisData._fb_left = that.fbLeft;
        that.page.setData({
          [that.key]: that.thisData
        });
      },
    })
  }
  onFBTouch(e) {
    this.pageInX = e.touches[0].pageX;
    this.pageInY = e.touches[0].pageY;
    this.pageInLeft = this.fbLeft
    this.pageInTop = this.fbTop;
  }
  onFBMove(e) {
    var pageInX2 = e.touches[0].pageX;
    var pageInY2 = e.touches[0].pageY;
    var animation = wx.createAnimation({
      duration: 1,
      timingFunction: 'step-start',
    })
    this.fbLeft = this.pageInLeft + pageInX2 - this.pageInX
    this.fbTop = this.pageInTop + pageInY2 - this.pageInY

    if (this.fbTop < 0) {
      this.fbTop = 0;
    }
    if (this.fbTop + this.fbHeight > this.screenHeight) {
      this.fbTop = this.screenHeight - this.fbHeight
    }
    this.thisData._fb_left = this.fbLeft
    this.thisData._fb_top = this.fbTop
    animation.left(this.fbLeft).top(this.fbTop).step();
    this.thisData._fb_animation = animation.export();
    this.setData();
  }
  onFBRelease() {
    if (this.fbLeft > (this.screenWidth - this.fbWidth) / 2) {
      //toRight
      var animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out',
      })
      this.fbLeft = this.screenWidth - this.fbWidth / 2 * 2
      this.thisData._fb_left = this.fbLeft
      this.thisData._fb_top = this.fbTop
      animation.left(this.fbLeft).step();
      this.thisData._fb_animation = animation.export();
      this.setData();
    }
    else {
      // to left
      var animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out',
      })
      this.fbLeft = 0
      this.thisData._fb_left = this.fbLeft
      this.thisData._fb_top = this.fbTop
      animation.left(this.fbLeft).step();
      this.thisData._fb_animation = animation.export();
      this.setData();
    }
  }
  setData() {
    this.page.setData({
      [this.key]: this.thisData
    });
  }
}

module.exports = floatButton;