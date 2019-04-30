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
    topBarItems: [
      // id name selected 选中状态
      {
        id: '1',
        name: '评论数',
        selected: true
      },
      {
        id: '2',
        name: '浏览数',
        selected: false
      },
      {
        id: '3',
        name: '点赞数',
        selected: false
      },
      {
        id: '4',
        name: '收藏数',
        selected: false
      }
    ],
    tab: '1',
    imageUrl: app.globalData.URL,
    backToTop: {
      flag: true,
      list: []
    },
    openid: '',
    userInfo: {},
  },

  onShareAppMessage: function() {
    console.log("热门分享，微信openId:" + this.data.openid);
    var title = "分享“" + config.getWebsiteName + "”的文章排行。";
    var path = "pages/hot/hot?shareUserId=" + this.data.openid;
    return {
      title: title + '-排行榜',
      path: path,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  reload: function(e) {
    var self = this;
    self.fetchPostsData(self.data.tab);
  },

  onTapTag: function(e) {
    var self = this;
    var tab = e.currentTarget.id;
    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    self.setData({
      topBarItems: topBarItems,
      tab: tab,
      page: 1,
      isLastPage: false,
      postsList: []
    })
    if (tab !== 0) {
      this.fetchPostsData(tab);
    } else {
      this.fetchPostsData("1");
    }
  },

  onShow: function () {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
  },
  
  onLoad: function(options) {
    var self = this;
    self.setData({
      page: 1,
      isLastPage: false, 
      postsList:[]
    });
    
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    this.fetchPostsData("1");
  },
  //获取文章列表数据
  fetchPostsData: function(tab) {
    var self = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var topHotPostsUrl = app.globalData.URL + "/minimal/selectHotArticleByTypeId";

    var params = {
      typeId: tab,
      pageNo: self.data.page,
      pageSize: pageCount
    };
    var getTopHotPostsRequest = wxRequest.getRequest(topHotPostsUrl, params);
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
              var strdate = item.updateTimeStr
              if (item.backImg == null || item.backImg == '') {
                item.backImg = '../../images/logo700.png';
              }
              item.updateTimeStr = util.cutstr(strdate, 10, 1);
              return item;
            })),
          });

          wx.hideLoading();
        } else if (response.statusCode === 404) {
          console.log('加载数据失败,可能缺少相应的数据');
        }
      })
      .catch(function() {
        wx.hideLoading();
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
  rtCornerBarAction: function (e) {
    switch (e.detail.index) {
      case 0: // 回顶部
        this.pageScrollToParams(0, 300)
        break
    }
  },

  onPageScroll: function (Object) {
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
  pageScrollToParams: function (scrollTop, duration) {
    var that = this;
    wx.pageScrollTo({
      scrollTop: scrollTop,
      duration: duration,
      success: function () {
        that.data.backToTop.flag = false
      }
    })
  },
})