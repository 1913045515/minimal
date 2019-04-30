import config from '../../utils/config.js'
import Dialog from '../../vendor/VantUI/dialog/dialog'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js');
const request = require('../../utils/request.js');
var app = getApp();
Page({
  data: {
    categoriesList: [],
    imageURL: app.globalData.URL,
    floatDisplay: "none",
    openid: "",
    isLoginPopup: false,
    userInfo: {},
    shareImg: "",
    shareTitle: "",
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '书籍专区',
      success: function(res) {}
    });
    Auth.setUserInfoData(this);
    Auth.checkLogin(this);

    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    // 获取配置信息
    var configUrl = app.globalData.URL + "/minimal/selectAllConfig";
    request.requestGetApi(configUrl, "", "", this, this.successFunConfig, this.failFunConfig);
  },

  onShow: function() {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    this.fetchCategoriesData();
  },

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

  //获取分类列表
  fetchCategoriesData: function() {
    var self = this;
    var url = app.globalData.URL + "/minimal/selectVideos";
    let data = {
      openId: self.data.openid
    }
    var getCategoriesRequest = wxRequest.getRequest(url, data);
    getCategoriesRequest.then(response => {
        if (response.statusCode === 200) {
          self.setData({
            floatDisplay: "block",
            categoriesList: response.data.data.videos,
          });
        } else {
          console.log(response);
        }
      })
      .catch(function(response) {
        console.log(response);
      }).finally(function() {})
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
    var self = this;
    if (!self.data.openid) {
      Auth.checkSession(self, 'isLoginNow');
    } else {
      let shareImg = self.data.shareImg;
      let shareTitle = self.data.shareTitle;
      var id = e.currentTarget.dataset.id;
      var url = '../bdetail/bdetail?id=' + id + "&shareImg=" + shareImg
        + "&shareTitle=" + shareTitle;;
      wx.navigateTo({
        url: url
      });
    }
  },

  /**
  * 获取配置请求--接口调用成功处理
  */
  successFunConfig: function (res, selfObj) {
    this.setData({
      shareImg: res.shareImg,
      shareTitle: res.shareTitle,
    });
  },

  /**
   * 获取配置请求--接口调用失败处理
   */
  failFunConfig: function (res, selfObj) {
    console.log('failFunConfig', res)
  },
})