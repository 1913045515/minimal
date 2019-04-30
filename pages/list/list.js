var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
import config from '../../utils/config.js';
var Auth = require('../../utils/auth.js');
var pageCount = config.getTopPageCount;
var app = getApp();
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
    backToTop: { // back-to-top组件参数定义
      flag: true,
      list: []
    },
    openid: '',
    userInfo: {},
  },

  onLoad: function (options) {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    if (options.categoryID && options.categoryID != 0) {
      self.setData({
        categories: options.categoryID,
        isCategoryPage: "block"
      });
      self.fetchCategoriesData(options.categoryID);
    }
    if (options.search && options.search != '') {
      console.log("search");
      wx.setNavigationBarTitle({
        title: "搜索关键字：" + options.search,
        success: function (res) {
          // success
        }
      });
      self.setData({
        search: options.search,
        isSearchPage: "block",
        searchKey: options.search
      });

      // 只要分享带有id就更新缓存中的shareUserId
      if (options.shareUserId) {
        wx.setStorageSync('shareUserId', options.shareUserId);
      }
      this.fetchPostsData(self.data);
    }
  },

  formSubmit: function(e) {
    var url = '../list/list'
    if (e.detail.value.input != '') {
      url = url + '?search=' + e.detail.value.input;
    }
    wx.navigateTo({
      url: url
    })
  },

  onShareAppMessage: function() {
    console.log("推荐分享：微信openId：" + this.data.openid);
    var title = "分享“迷你喵”";
    var path = ""
    if (this.data.categories && this.data.categories != 0) {
      title += "的专题：" + this.data.categoriesList.name;
      path = 'pages/list/list?categoryID=' + this.data.categoriesList.id+
      "&shareUserId="+ this.data.openid;
    } else {
      title += "的搜索内容：" + this.data.searchKey;
      path = 'pages/list/list?search=' + this.data.searchKey+
      "&shareUserId=" + this.data.openid;
    }
    return {
      title: title,
      path: path,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  onReachBottom: function() {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      console.log('最后一页');
    }
  },

  reload: function(e) {
    var self = this;
    if (self.data.categories && self.data.categories != 0) {
      self.setData({
        isCategoryPage: "block",
        showallDisplay: "none",
        showerror: "none",
      });
      self.fetchCategoriesData(self.data.categories);
    }
    if (self.data.search && self.data.search != '') {
      self.setData({
        isSearchPage: "block",
        showallDisplay: "none",
        showerror: "none",
        searchKey: self.data.search
      })
    }
    self.fetchPostsData(self.data);
  },

  //加载分页
  loadMore: function(e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },

  //获取文章列表数据
  fetchPostsData: function(data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };

    wx.showLoading({
      title: '正在加载',
      mask: true
    });

    var params = {
      id: self.data.categories,
      key: self.data.search,
      pageNo: self.data.page,
      pageSize: pageCount
    };

    var postsUrl = app.globalData.URL + "/minimal/selectArticleBySubjectId";
    var getPostsRequest = wxRequest.getRequest(postsUrl, params);
    getPostsRequest.then(response => {
      let articles = response.data.data;
      if (response.statusCode === 200) {
        if (articles.length < pageCount) {
          self.setData({
            isLastPage: true
          });
        };
        self.setData({
          floatDisplay: "block",
          showallDisplay: "block",
          postsList: self.data.postsList.concat(articles)
        });
      } else {
        if (response.data.code == "rest_post_invalid_page_number") {
          self.setData({
            isLastPage: true
          });
        } else {
          wx.showToast({
            title: response.data.message,
            duration: 1500
          })
        }
      }
    }).catch(function() {
      if (data.page == 1) {
        self.setData({
          showerror: "block",
          floatDisplay: "none"
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
    }).finally(function() {
      wx.hideLoading();
    })
  },

  // 跳转至查看文章详情
  redictDetail: function(e) {
    var id = e.currentTarget.id;
    var redictUrl = '../detail/detail?id=' + id + '&subjectId=' + this.data.categoriesList.id;
    wx.navigateTo({
      url: redictUrl
    })
  },

  //获取分类列表
  fetchCategoriesData: function(id) {
    var self = this;
    var params = {
      id: id,
      openId: self.data.openid
    };
    var categoryUrl = app.globalData.URL + "/minimal/selectArticleSubjectById";
    var getCategoryRequest = wxRequest.getRequest(categoryUrl, params);
    getCategoryRequest.then(response => {
      let categoryResult = response.data.data;
      // 判断用户是否已经登录且已经订阅
      if (categoryResult.isSubscription === 0) {
        wx.showModal({
          title: '温馨提示',
          content: '您还未订阅此专题，请订阅后再阅读！',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../topic/topic'
              })
            }
          }
        });
      }
      categoryResult.backImg = self.data.imageUrl + categoryResult.backImg;
      self.setData({
        categoriesList: categoryResult,
      });
      wx.setNavigationBarTitle({
        title: categoryResult.name,
        success: function(res) {}
      });
      self.fetchPostsData(self.data);
    })
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

  // 取消头部提示
  cancelScrollTxt() {
    wx.setStorageSync('scrolltxts', "setFalse");
    this.setData({
      scrolltxts: false
    })
  },
})