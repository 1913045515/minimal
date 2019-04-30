import config from '../../utils/config.js'
import Dialog from '../../vendor/VantUI/dialog/dialog'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js');
var app = getApp();
Page({
  data: {
    detail: [],
    imageURL: app.globalData.URL,
    floatDisplay: "none",
    openid: "",
    isLoginPopup: false,
    userInfo: {},
    //article将用来存储towxml数据
    articleMD: {},
    shareImg: "",
    shareTitle: "",
    videoTitle: "课程详情",
    spinShowFlag: true,
    spinShowFunc: '',
  },
  onLoad: function(options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '书籍详情',
      success: function(res) {}
    });

    // 微信自带Loading效果
    // wx.showLoading({
    //   title: '加载中',
    // });

    spinShowFunc: setTimeout(function () {
      that.setData({
        spinShowFlag: !that.data.spinShowFlag,
      });
    }, 2000);
    // setTimeout(function () {
    //   wx.hideLoading()
    // }, 3000)
    
    Auth.setUserInfoData(this);
    Auth.checkLogin(this);

    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    this.setData({
      shareImg: options.shareImg,
      shareTitle: options.shareTitle,
    });

    // let videoAd = null;

    // // 在页面onLoad回调事件中创建激励视频广告实例
    // if (wx.createRewardedVideoAd) {
    //   videoAd = wx.createRewardedVideoAd({
    //     adUnitId: 'adunit-53931fc61481e02e'
    //   })
    // }

    // // 用户触发广告后，显示激励视频广告
    // if (videoAd) {
    //   videoAd.show().catch(() => {
    //     // 失败重试
    //     videoAd.load()
    //       .then(() => videoAd.show())
    //       .catch(err => {
    //         console.log('激励视频 广告显示失败');
    //       })
    //   });
    //   videoAd.onClose((callback) => {
    //     if (!callback.isEnded){
    //       var url = '../video/video';
    //       wx.switchTab({
    //         url: url
    //       });
    //     }
    //   });
    // }
    let id = options.id;
    this.fetchCategoriesData(id);
  },

  onShow: function() {},

  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },

  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },

  confirm: function() {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let spinShowFunc = this.data.spinShowFunc;
    var that = this;
    clearInterval(spinShowFunc);
  },

  //获取分类列表
  fetchCategoriesData: function(id) {
    var self = this;
    var url = app.globalData.URL + "/minimal/selectVideoById";
    let data = {
      videoId: id,
      openId: self.data.openid
    }
    var getDetailRequest = wxRequest.getRequest(url, data);
    getDetailRequest.then(response => {
        if (response.statusCode === 200) {
          let resultData = response.data.data;
          if (resultData.status == "0") {
            Dialog.confirm({
              title: '温馨提示',
              message: resultData.msg,
              confirmButtonText: '获取积分',
              cancelButtonText: '返回上级',
            }).then(() => {
                let url = '../user/user';
                wx.switchTab({
                  url: url
                });
            }).catch(() => {
              let url = '../book/book';
              wx.switchTab({
                url: url
              });
            });
            // wx.showModal({
            //   title: '温馨提示',
            //   content: resultData.msg,
            //   cancelText: '返回上级',
            //   confirmText: '获取积分',
            //   success(res) {
            //     if (res.confirm) {
            //       let url = '../user/user';
            //       wx.switchTab({
            //         url: url
            //       });
            //     } else if (res.cancel) {
            //       let url = '../video/video';
            //       wx.switchTab({
            //         url: url
            //       });
            //     }
            //   }
            // });
            return;
          }
          let item = response.data.data.video;
          let strdate = util.formatTime(new Date(item.createTime));
          item.createTime = util.cutstr(strdate, 10, 1);
          let towxmlData = app.towxml.toJson(
            item.description, // `markdown`或`html`文本内容
            'markdown' // `markdown`或`html`
          );
          //设置文档显示主题，默认'light'
          towxmlData.theme = 'light';
          self.setData({
            floatDisplay: "block",
            articleMD: towxmlData,
            detail: item,
          });
          setTimeout(function () {
            // 积分消耗提示
            wx.showToast({
              title: resultData.msg,
              icon: 'success',
              duration: 1500
            });
          }, 1000)
        } else {
          console.log(response);
        }
      })
      .catch(function(response) {
        console.log(response);
      }).finally(function() {
        // wx.hideLoading();
      })
  },

  onShareAppMessage: function() {
    console.log("首页分享，微信openId:" + this.data.openid);
    return {
      title: this.data.shareTitle,
      path: 'pages/index/index?shareUserId=' + this.data.openid,
      imageUrl: this.data.shareImg
    }
  },

  // 登录成功
  agreeGetUser: function(e) {
    let self = this;
    Auth.checkAgreeGetTopicPromise(e, app, self, '0');
  },
  //跳转至某分类下的文章列表
  redictIndex: function(e) {

  },
})