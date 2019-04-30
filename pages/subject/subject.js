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
    categoriesList: [],
    imageURL: app.globalData.URL,
    floatDisplay: "none",
    openid: "",
    isLoginPopup: false,
    userInfo: {},
    scrolltxts: true,
    text: "温馨提示:分享“迷你喵小程序”，用户成功注册后，推荐人可以获得积分哦！！！)",
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marquee_margin: 25,
    size: 14,
    interval: 35, // 时间间
    length:0,
    shareImg: "",
  },
  onLoad: function(options) {
    Auth.setUserInfoData(this);
    Auth.checkLogin(this);

    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    // var that = this;
    // var length = that.data.text.length * that.data.size;//文字长度
    // var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    // that.setData({
    //   length: length,
    //   windowWidth: windowWidth,
    //   shareImg: options.shareImg,
    // });
    // that.scrolltxt();// 第一个字消失后立即从右边出现
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
    var url = app.globalData.URL + "/minimal/selectSubjectByOpenId";
    let data = {
      openId: self.data.openid
    }
    var getCategoriesRequest = wxRequest.getRequest(url, data);
    getCategoriesRequest.then(response => {
        if (response.statusCode === 200) {
          self.setData({
            floatDisplay: "block",
            categoriesList: response.data.data.map(function(item) {
              if (item.isSubscription === 0) {
                item.subimg = "subscription.png";
                item.subflag = "0";
              } else {
                item.subimg = "subscription-on.png";
                item.subflag = "1";
              }
              return item;
            })
          });
        } else {
          console.log(response);
        }
      })
      .catch(function(response) {
        console.log(response);
      }).finally(function() {})
  },

  onShareAppMessage: function () {
    console.log("推荐分享：微信openId：" + this.data.openid);
    return {
      title: this.data.userInfo.nickName + "邀请您加入迷你喵",
      imageUrl: this.data.shareImg,
      path: 'pages/user/user?shareUserId=' + this.data.openid,
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
      var id = e.currentTarget.dataset.id;
      var name = e.currentTarget.dataset.item;
      var url = '../list/list?categoryID=' + id;
      wx.navigateTo({
        url: url
      });
    }
  },

  scrolltxt: function () {
    var that = this;
    var length = that.data.length;//滚动文字的宽度
    var windowWidth = that.data.windowWidth;//屏幕宽度
    if (length > windowWidth) {
      var interval = setInterval(function () {
        var maxscrollwidth = length + that.data.marquee_margin;//滚动的最大宽度，文字宽度+间距，如果需要一行文字滚完后再显示第二行可以修改marquee_margin值等于windowWidth即可
        var crentleft = that.data.marqueeDistance;
        if (crentleft < maxscrollwidth) {//判断是否滚动到最大宽度
          that.setData({
            marqueeDistance: crentleft + that.data.marqueePace
          })
        }
        else {
          //console.log("替换");
          that.setData({
            marqueeDistance: 0 // 直接重新滚动
          });
          clearInterval(interval);
          that.scrolltxt();
        }
      }, that.data.interval);
    }
    else {
      that.setData({ marquee_margin: "1000" });//只显示一条不滚动右边间距加大，防止重复显示
    }
  },


  // 取消头部提示
  cancelScrollTxt() {
    wx.setStorageSync('scrolltxts', "setFalse");
    this.setData({
      scrolltxts: false
    })
  },

  cancelSubject :function(e){
    var self = this;
    var id = e.currentTarget.dataset.id;
    var item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '温馨提示',
      content: "确定取消" + item  +"专题订阅",
      success: function (res) {
        if (res.confirm) {
          self.cancelSubjectPost(id);
        } else if (res.cancel) {
          return false;
        }
      }
    });
  },

   // 取消专题订阅功能
  cancelSubjectPost: function (id) {
    var self = this;
    if (self.data.openid) {
      var data = {
        openId: self.data.openid,
        id: id
      };
      var url = app.globalData.URL + "/minimal/cancelSubject";
      var postSubjectRequest = wxRequest.postRequest(url, data);
      postSubjectRequest
        .then(response => {
          if (response.data.data == '200') {
            self.fetchCategoriesData();
          } else {
            console.log(response.data.msg);
          }
        })
    } else {
      Auth.checkSession(self, 'isLoginNow');
    }
  },
})