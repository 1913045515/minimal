//index.js
//获取应用实例
const app = getApp();
const util = require("../../utils/util.js");
import config from '../../utils/config.js'
const jinrishici = require('../../utils/jinrishici.js');
const {
  $Message
} = require('../../dist/base/index');
const request = require('../../utils/request.js');
var wxRequest = require('../../utils/wxRequest.js');
var Auth = require('../../utils/auth.js');
var pageCount = config.getPageCount;
Page({
  data: {
    userInfo: {
      usreName: "林老师带你学编程",
      headPortrait: app.globalData.URL + "/lzq.png",
      contacts: [{
        id: 1,
        field: "邮箱",
        value: "1913045515@qq.com",
      }, {
        id: 2,
        field: "微信",
        value: "lzqcode",
      }],
    },
    appletInfo: {
      title: "林老师带你学编程",
      appletName: "Minimal",
      appletDetail: "我们只做最好的博客平台",
      bottomTip: "我也是有底线的",
      backImg: app.globalData.URL + "/backImg.png",
      titleBackImg: app.globalData.URL + "/backImg.png",
      shareTitle: "最简、最好的知识分享平台！"
    },
    page: 1,
    loadMoreFlag: false,
    isLoadMoreFlag: false,
    coverFlag: true,
    navFlag: true,
    articles: [],
    imageUrl: app.globalData.URL,
    postsShowSwiperList: [],
    search: '',
    likeList: [],
    isLastPage: false,
    backToTop: { // back-to-top组件参数定义
      flag: true,
      list: []
    },
    scrolltxts: true,
    text: "添加到我的小程序，快速获得最新动态↑↑↑",
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marquee_margin: 30,
    size: 14,
    interval: 35, // 时间间
    length: 0,
    openid: '',
    userInfo: {},
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    var that = this;
    var url = app.globalData.URL + "/minimal/homeArticles";
    var token = "";
    that.data.isLastPage = false;
    that.data.page = 1;
    var params = {
      pageNo: that.data.page,
      pageSize: pageCount
    };

    // 获取博客列表数据
    request.requestGetApi(url, token, params, this, this.successFunRefreshPosts, this.failFunRefreshPosts);
    var configUrl = app.globalData.URL + "/minimal/selectAllConfig";
    // 获取配置信息
    request.requestGetApi(configUrl, token, "", this, this.successFunConfig, this.failFunConfig);

    var homeModuleUrl = app.globalData.URL + "/minimal/selectAllHomeModule";
    // 获取配置信息
    request.requestGetApi(homeModuleUrl, token, "", this, this.successFunHomeModule, this.failFunHomeModule);
    that.fetchTopFivePosts();
    wx.stopPullDownRefresh();
  },

  /**
   * 事件处理函数
   */
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    Auth.setUserInfoData(that);
    Auth.checkLogin(that);

    wx.setNavigationBarTitle({
      title: '迷你喵',
      success: function (res) { }
    });

    // 只要分享带有id就更新缓存中的shareUserId
    if (options.shareUserId) {
      wx.setStorageSync('shareUserId', options.shareUserId);
    }

    let scrolltxts = wx.getStorageSync('scrolltxts');
    if (scrolltxts=="setFalse"){
      this.setData({
        scrolltxts: false
      })
    }
    var url = app.globalData.URL + "/minimal/homeArticles";
    var token = "";
    that.data.page = 1;
    that.data.isLastPage = false;
    var params = {
      pageNo: that.data.page,
      pageSize: pageCount
    };
    // //@todo 网络请求API数据
    request.requestGetApi(url, token, params, this, this.successFunPosts, this.failFunPosts);

    var configUrl = app.globalData.URL + "/minimal/selectAllConfig";
    // 获取配置信息
    //@todo 网络请求API数据
    request.requestGetApi(configUrl, token, "", this, this.successFunConfig, this.failFunConfig);

    var homeModuleUrl = app.globalData.URL + "/minimal/selectAllHomeModule";
    // 获取配置信息
    request.requestGetApi(homeModuleUrl, token, "", this, this.successFunHomeModule, this.failFunHomeModule);

    that.fetchTopFivePosts();
    // 微信自带Loading效果
    wx.showLoading({
      title: '加载中',
    });

    var that = this;
    var length = that.data.text.length * that.data.size;//文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    that.setData({
      length: length,
      windowWidth: windowWidth
    });
    that.scrolltxt();// 第一个字消失后立即从右边出现

    // 在页面中定义插屏广告
    let interstitialAd = null

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-814a7a7c63e41b19'
      })
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  },

  onShow: function () {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    this.showPost();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    console.log("首页分享，微信openId:" + this.data.openid);
    return {
      title: this.data.appletInfo.shareTitle,
      path: 'pages/index/index?shareUserId=' + this.data.openid,
      imageUrl: this.data.appletInfo.backImg
    }
  },

  /**
   * 加载更多
   */
  onReachBottom: function() {
    var that = this;
    if (!that.data.isLastPage) {
      that.setData({
        page: that.data.page + 1,
      });
      console.log('当前页' + that.data.page);
    } else {
      console.log('最后一页');
      return;
    }
    that.setData({
      loadMoreFlag: true,
    });
    wx.request({
      url: app.globalData.URL + '/minimal/homeArticles',
      method: 'GET',
      data: {
        pageNo: that.data.page,
        pageSize: pageCount
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.list.length < pageCount) {
            that.setData({
              isLastPage: true
            });
          };

          if (res.data.list.length > 0) {
            that.setData({
              articles: that.data.articles.concat(res.data.list),
              loadMoreFlag: false,
            });
          } else {
            that.setData({
              loadMoreFlag: false,
              isLoadMoreFlag: true,
            });
            $Message({
              content: '博主已经努力了，会坚持每周一更。',
              duration: 2
            });
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.closePost();
  },

  handleQrcode() {},

  /**
   * 防止冒泡
   */
  prevent() {
    var self = this;
    wx.setClipboardData({
      data: "qiang220316"
    });
  },

  // showMask() {
  //   this.setData({
  //     coverFlag: false,
  //   });
  //   var animation = wx.createAnimation({
  //     duration: 1000,
  //     timingFunction: 'ease',
  //     delay: 0
  //   });
  //   animation.opacity(1).translate(wx.getSystemInfoSync().windowWidth, 0).step()
  //   this.setData({
  //     ani: animation.export()
  //   })
  // },

  // closeMask() {
  //   var that = this;
  //   var animation = wx.createAnimation({
  //     duration: 1000,
  //     timingFunction: 'ease',
  //     delay: 0
  //   });
  //   animation.opacity(0).translate(-wx.getSystemInfoSync().windowWidth, 0).step()
  //   that.setData({
  //     ani: animation.export()
  //   });

  //   setTimeout(function() {
  //     that.setData({
  //       coverFlag: true,
  //     });
  //   }, 600);
  // },

  /**
   * Post淡入效果
   */
  showPost() {
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
      delay: 0
    });
    animation.opacity(1).step();
    this.setData({
      anp: animation.export()
    })
  },

  /**
   * Post淡出效果
   */
  closePost() {
    console.log("closePost");
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
      delay: 0
    });
    animation.opacity(0).step();
    this.setData({
      anp: animation.export()
    })
  },

  /**
   * 监听屏幕滚动 判断上下滚动
   */
  // onPageScroll: function(event) {
  //   var that = this;
  //   if (event.scrollTop > 100) {
  //     that.setData({
  //       navFlag: false
  //     });
  //   } else {
  //     that.setData({
  //       navFlag: true
  //     });
  //   }
  // },

  /**
   * 首頁文章列表请求--接口调用成功处理
   */
  successFunPosts: function(res, selfObj) {
    var that = this;
    var count = res.count;
    that.setData({
      isLoadMoreFlag: false,
      articles: res.list,
      imageUrl: app.globalData.URL,
      total: res.count,
    })
    //取消Loading效果
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    that.showPost();
  },

  /**
   * 首頁文章列表请求--接口调用失败处理
   */
  failFunPosts: function(res, selfObj) {
    //取消Loading效果
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    console.log('failFunPosts', res)
  },

  /**
   * 首頁文章列表下拉刷新请求--接口调用成功处理
   */
  successFunRefreshPosts: function(res, selfObj) {
    var that = this;
    that.setData({
      isLoadMoreFlag: false,
      articles: res.list,
      isLoadMoreFlag: false,
    });
    wx.hideLoading();
    wx.hideNavigationBarLoading();
  },

  /**
   * 首頁文章下拉刷新请求--接口调用失败处理
   */
  failFunRefreshPosts: function(res, selfObj) {
    //取消Loading效果
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    console.log('failFunRefreshPosts', res)
  },

  /**
   * 获取配置请求--接口调用成功处理
   */
  successFunConfig: function(res, selfObj) {
    var that = this;
    that.setData({
      userInfo: {
        usreName: res.appletUsreName,
        headPortrait: res.appletHeadPortrait,
      },
      appletInfo: {
        title: res.appletTitle,
        appletName: res.appletName,
        appletDetail: res.appletDetail,
        bottomTip: res.appletBottomTip,
        backImg: res.appletBackImg,
        titleBackImg: res.appletTitleBackImg,
        shareTitle: res.shareTitle,
      },
      imageUrl: res.appletImageUrl
    });
  },

  /**
   * 获取配置请求--接口调用失败处理
   */
  failFunConfig: function(res, selfObj) {
    console.log('failFunConfig', res)
  },

  //取置顶的文章
  fetchTopFivePosts: function() {
    var self = this;
    var url = app.globalData.URL + '/minimal/selectBanners';
    var getPostsRequest = wxRequest.getRequest(url);
    getPostsRequest.then(response => {
        if (response.data.banner.length > 0) {
          let result = response.data.banner;
          self.setData({
            postsShowSwiperList: result,
            displaySwiper: "block"
          });
        } else {
          self.setData({
            displaySwiper: "none"
          });
        }
      }).catch(function(response) {
        console.log(response);
        self.setData({
          showerror: "block",
          floatDisplay: "none"
        });
      })
      .finally(function() {});
  },

  // 跳转至查看小程序列表页面或文章详情页
  redictAppDetail: function(e) {
    var id = e.currentTarget.dataset.articleid;
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
    //跳转到内容页
    if (redicttype == '1') {
      url = '../detail/detail?id=' + id;
      wx.navigateTo({
        url: url
      })
    }
    //跳转到小程序内部页面     
    if (redicttype == '2') {
      wx.navigateTo({
        url: url
      })
    }
    //跳转到web-view内嵌的页面
    else if (redicttype == '0') {
      url = '../webpage/webpage?url=' + url;
      wx.navigateTo({
        url: url
      })
    }
    //跳转到其他app
    else if (redicttype == '3') {
      wx.navigateToMiniProgram({
        appId: appid,
        envVersion: 'release',
        path: url,
        success(res) {
          // 打开成功
        },
        fail: function(res) {
          console.log(res);
        }
      })
    }
  },

  formSubmit: function(e) {
    var url = '../list/list'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {
      key = e.detail.value.input;
    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.navigateTo({
        url: url
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        showCancel: false,
      });
    }
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
    wx.setStorageSync('scrolltxts',"setFalse");
    this.setData({
      scrolltxts: false
    })
  },
})