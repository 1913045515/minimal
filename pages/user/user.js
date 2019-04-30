import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
const request = require('../../utils/request.js');
import Dialog from '../../vendor/VantUI/dialog/dialog';
var app = getApp();
var videoAd = null;
Page({
  data: {
    readLogs: [],
    tab: '1',
    showerror: "none",
    shownodata: "none",
    subscription: "",
    userInfo: {},
    type1: "https://www.wolzq.com/icon/sign.png",
    type2: "0",
    type3: "0",
    typeName1: "签到领10积分",
    typeName2: "关于作者",
    typeName3: "关于本站",
    openid: '',
    isLoginPopup: false,
    coin: 0,
    shareBackImg: "",
    shareImg: "",
    signStatus: "0",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    self.fetchPostsData('1');
    wx.setNavigationBarTitle({
      title: '个人中心',
      success: function(res) {}
    });

    // 获取配置信息
    var configUrl = app.globalData.URL + "/minimal/selectAllConfig";
    request.requestGetApi(configUrl, "", "", this, this.successFunConfig, this.failFunConfig);

    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-53931fc61481e02e'
      })
    }
  },

  refreshUserInfo: function(openid) {
    var self = this;
    var userUrl = app.globalData.URL + "/minimal/selectUserByOpenId";
    let params = {
      openId: self.data.openid
    }
    request.requestGetApi(userUrl, "", params, this, this.successFunUser, this.failFunUser);
  },

  /**
   * 获取配置请求--接口调用成功处理
   */
  successFunConfig: function(res, selfObj) {
    this.setData({
      type1: res.type1,
      type2: res.type2,
      type3: res.type3,
      typeName1: res.typeName1,
      typeName2: res.typeName2,
      typeName3: res.typeName3,
      shareBackImg: res.shareBackImg,
      shareImg: res.shareImg,
    });
  },

  /**
   * 获取配置请求--接口调用失败处理
   */
  failFunConfig: function(res, selfObj) {
    console.log('failFunConfig', res)
  },


  /**
   * 获取信息请求--接口调用成功处理
   */
  successFunUser: function(res, selfObj) {
    var self = this;
    var signCoin = 0;
    if (self.data.openid && res.data) {
      signCoin = res.data.coin
    }
    self.setData({
      coin: signCoin,
      signStatus: res.signStatus
    });
  },

  /**
   * 获取用户信息请求--接口调用失败处理
   */
  failFunUser: function(res, selfObj) {
    console.log('failFunUser', res)
  },


  onReady: function() {
    var self = this;
    Auth.checkSession(self, 'isLoginNow');
  },

  clickHead: function() {
    var self = this;
    console.log("openId:" + self.data.openid);
    if (!self.data.openid) {
      Auth.checkSession(self, 'isLoginNow');
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    wx.stopPullDownRefresh();
    // 获取用户信息
    if (self.data.openid) {
      var userUrl = app.globalData.URL + "/minimal/selectUserByOpenId";
      let params = {
        openId: self.data.openid
      }
      request.requestGetApi(userUrl, "", params, this, this.successFunUser, this.failFunUser);
    }
  },

  onShow: function() {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    Auth.checkSession(self, 'isLoginNow');
    // 获取用户信息
    if (self.data.openid) {
      self.refreshUserInfo(self.data.openid)
    }
  },

  // 登录成功后
  agreeGetUser: function(e) {
    let self = this;
    Auth.checkAgreeGetUserPromise(e, app, self, '0');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    console.log("推荐分享：微信openId：" + this.data.openid);
    return {
      title: this.data.userInfo.nickName + "邀请您加入迷你喵",
      imageUrl: this.data.shareImg,
      path: 'pages/user/user?shareUserId=' + this.data.openid,
    }
  },

  fetchPostsData: function(tab) {
    self = this;
    self.setData({
      showerror: 'none',
      shownodata: 'none'
    });
    var count = 0;
    var openid = "";
    if (tab == '1') {
      self.setData({
        readLogs: (wx.getStorageSync('readLogs') || []).map(function(log) {
          count++;
          return log;
        })
      });
      if (count == 0) {
        self.setData({
          shownodata: 'block'
        });
      }
    }
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

  /**
   * 获取首页功能模块请求--接口调用成功处理
   */
  successFunHomeModule: function(res, selfObj) {
    var that = this;
    that.setData({
      likeList: res.data
    });
  },

  /**
   * 获取首页功能模块请求--接口调用失败处理
   */
  failFunHomeModule: function(res, selfObj) {
    console.log('failFunHomeModule', res)
  },

  // 触发广告后
  clickAd: function(){
    var self = this;
    // 用户触发广告后，显示激励视频广告
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败');
          })
      });
      videoAd.onClose((callback) => {
        if (callback && callback.isEnded || callback===undefined) {
          console.log("正常播放结束"+callback.isEnded);
          // 正常播放结束
          self.signFun(3);
        }else{
          // 中途退出视频
          console.log("中途退出视频" + callback.isEnded);
        }
      });
    }
  },

  // 签到
  clickSign() {
    var self = this;
    if (!self.data.openid) {
      Auth.checkSession(self, 'isLoginNow');
      return;
    }

    if (self.data.signStatus == "1"){
      wx.showToast({
        title: "亲，今日已签到",
        duration: 1200
      })
      return;
    }

    Dialog.confirm({
      title: '今日签到',
      message: '每日签到可获得积分哦',
      confirmButtonText: '三倍签到',
      cancelButtonText: '正常签到',
    }).then(() => {
      // 三倍签到
      self.clickAd();
    }).catch(() => {
      // 一倍签到
      self.signFun(1);
    });
  },

  // 签到
  signFun: function(ratio) {
    var self = this;
    var url = app.globalData.URL + "/minimal/everydaySign";
    var data = {
      openId: self.data.openid,
      ratio: ratio
    };
    var postSignRequest = wxRequest.postRequest(url, data);
    postSignRequest
      .then(response => {
        if (response.data.status == 2) {
          wx.showToast({
            title: response.data.msg,
            icon: 'success',
            duration: 2000
          });
          // 获取用户信息
          if (self.data.openid) {
            self.refreshUserInfo(self.data.openid);
          }
        } else {
          wx.showToast({
            title: response.data.msg,
            duration: 2000
          })
        }
      });
  },

  // 跳转链接
  clickRedirect: function(e) {
    var self = this;
    if (!self.data.openid) {
      Auth.checkSession(self, 'isLoginNow');
      return;
    }
    let type = e.currentTarget.dataset.type;
    let url = "";
    let shareBackImg = self.data.shareBackImg;
    let shareImg = self.data.shareImg;
    if (type == "collect") {
      url = "../collect/collect?openId=" + self.data.openid + "&shareImg=" + shareImg;
    } else if (type == "subject") {
      url = "../subject/subject?openId=" + self.data.openid + "&shareImg=" + shareImg;
    } else if (type == "relationship") {
      url = "../relationship/relationship?openId=" + self.data.openid + "&shareBackImg=" + shareBackImg + "&shareImg=" + shareImg;
    }
    wx.navigateTo({
      url: url,
    });
  }
})