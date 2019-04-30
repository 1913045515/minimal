var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var Auth = require('../../utils/auth.js');
import config from '../../utils/config.js';
var app = getApp();
var pageCount = config.getHotPageCount;

Page({
  data: {
    title: '文章列表',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    categoriesName: '',
    categoriesImage: "",
    showerror: "none",
    isCategoryPage: "none",
    isSearchPage: "none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey: "",
    imageUrl: app.globalData.URL,
    backToTop: {
      flag: true,
      list: []
    },
    openid: '',
    userInfo: {},
    shareImg: "",
  },

  onLoad: function (options) {
    var self = this;
    self.setData({
      page: 1,
      isLastPage: false,
      postsList: [],
      tab: options.openId,
      shareImg: options.shareImg,
    });
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);

    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    this.fetchPostsData(options.openId);
  },
  
  onShareAppMessage: function () {
    console.log("推荐分享：微信openId：" + this.data.openid);
    return {
      title: this.data.userInfo.nickName + "邀请您加入迷你喵",
      imageUrl: this.data.shareImg,
      path: 'pages/user/user?shareUserId=' + this.data.openid,
    }
  },

  reload: function(e) {
    var self = this;
    self.fetchPostsData(self.data.tab);
  },

  onShow: function() {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
  },

  cancelCollet: function(e) {
    var self = this;
    var id = e.currentTarget.id;
    wx.showModal({
      title: '温馨提示',
      content: '确定要取消收藏',
      success: function(res) {
        if (res.confirm) {
          self.clikeCollect(id);
        } else if (res.cancel) {
          return false;
        }
      }
    });
  },

  // 收藏功能
  clikeCollect: function (id) {
    var self = this;
    if (self.data.openid) {
      var data = {
        openId: self.data.openid,
        articleId: id
      };
      var url = app.globalData.URL + "/minimal/userCollect";
      var postLikeRequest = wxRequest.postRequest(url, data);
      postLikeRequest
        .then(response => {
         if (response.data.status == '501') {
           self.setData({
             page: 1,
             isLastPage: false,
             postsList: [],
           });
           self.fetchPostsData(self.data.tab);
          } else {
            console.log(response.data.message);
          }
        })
    } else {
      Auth.checkSession(self, 'isLoginNow');
    }
  },

  //获取文章列表数据
  fetchPostsData: function(tab) {
    var self = this;
    var collectPostsUrl = app.globalData.URL + "/minimal/selectCollectByOpenId";

    var params = {
      openId: tab,
      pageNo: self.data.page,
      pageSize: pageCount
    };
    var getTopHotPostsRequest = wxRequest.getRequest(collectPostsUrl, params);
    getTopHotPostsRequest.then(response => {
        if (response.statusCode === 200) {
          if (response.data.data.length < pageCount) {
            self.setData({
              isLastPage: true
            });
          };

          self.setData({
            showallDisplay: "block",
            floatDisplay: "block",
            postsList: self.data.postsList.concat(response.data.data.map(function(item) {
              var strdate = item.createTimeStr
              if (item.backImg == null || item.backImg == '') {
                item.backImg = '../../images/logo700.png';
              }
              item.createTimeStr = util.cutstr(strdate, 10, 1);
              return item;
            })),
          });
        } else if (response.statusCode === 404) {
          console.log('加载数据失败,可能缺少相应的数据');
        }
      })
      .catch(function() {
        if (data.page == 1) {
          self.setData({
            showerror: "block",
            floatDisplay: "block"
          });
        } else {
          wx.showModal({
            title: '加载失败',
            content: '加载数据失败,请重试.',
            showCancel: false,
          });
          self.setData({
            page: data.page - 1
          });
        }
      })
      .finally(function() {
        setTimeout(function() {
          wx.hideLoading();
        }, 1500);
      });
  },

  // 跳转至查看文章详情
  redictDetail: function(e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  onReachBottom: function() {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data.tab);
    } else {
      console.log('最后一页');
    }
  },

  // 右下角快捷操作
  rtCornerBarAction: function(e) {
    switch (e.detail.index) {
      case 0: // 回顶部
        this.pageScrollToParams(0, 300)
        break
    }
  },

  onPageScroll: function(Object) {
    let screenHeight = wx.getSystemInfoSync().windowHeight
    if (Object.scrollTop > screenHeight) {
      this.setData({
        // 'backToTop.flag': true,
        'backToTop.list': [{
          url: '../../images/back-to-top.png',
          name: '顶部'
        }]
      })
    } else {
      this.setData({
        'backToTop.list': []
      })
    }
  },

  // 页面滚动操作
  pageScrollToParams: function(scrollTop, duration) {
    var that = this;
    wx.pageScrollTo({
      scrollTop: scrollTop,
      duration: duration,
      success: function() {
        that.data.backToTop.flag = false
      }
    })
  },
})