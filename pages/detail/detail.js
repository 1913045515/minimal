// pages/post/post.js
const app = getApp();
const {
  $Message
} = require('../../dist/base/index');
const request = require('../../utils/request.js');
const util = require("../../utils/util.js");
import {
  ModalView
} from '../../templates/modal-view/modal-view.js';
import config from '../../utils/config.js';
var Auth = require('../../utils/auth.js');
var Api = require('../../utils/api.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var imageCount = 0;
let isFocusing = false;
let pageCount = 5;
Page({
  data: {
    detailInfo: {},
    spinShowFlag: true,
    spinShowFunc: '',
    backUp: "返回",
    likeCount: 0,
    displayLike: 'block',
    likeList: [],
    enableComment: true,
    commentCount: "",
    isLoginPopup: false,
    userInfo: {},
    userid: "1",
    commentsList: [],
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    display: 'none',
    isLoading: false,
    isLastPage: false,
    enableComment: true,
    menuBackgroup: false,
    isShow: false, //控制menubox是否显示
    isLoad: true, //解决menubox执行一次  
    likeImag: "like.png",
    openid: "",
    userInfo: {},
    link: '',
    postID: null,
    total_comments: 0,
    system: '',
    page: 1,
    //article将用来存储towxml数据
    articleMD: {},
    createDate: "",
    backToTop: { // back-to-top组件参数定义
      flag: true,
      list: [{
        url: '../../images/back-to-top.png',
        name: '顶部'
      }]
    },
    subjectId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this; //不要漏了这句，很重要
    var url = app.globalData.URL + "/minimal/articleDetail";
    var token = "";
    that.data.postID = options.id
    that.data.subjectId = options.subjectId
    var params = {
      articleId: options.id,
      subjectId: options.subjectId
    };
    // 微信自带Loading效果
    wx.showLoading({
      title: '加载中',
    })
    //@todo 文章内容网络请求API数据
    request.requestGetApi(url, token, params, this, this.successFunPost, this.failFunPost);
    spinShowFunc: setTimeout(function () {
      that.setData({
        spinShowFlag: !that.data.spinShowFlag,
      });
    }, 2000);
    Auth.setUserInfoData(that);
    Auth.checkLogin(that);
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        that.setData({
          system: system
        });
      }
    })
    new ModalView;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let spinShowFunc = this.data.spinShowFunc;
    var that = this;
    clearInterval(spinShowFunc);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var self = this;
    if (!self.data.isLastPage) {
      self.fetchCommentData();
      self.setData({
        page: self.data.page + 1,
      });
    } else {
      console.log('评论已经是最后一页了');
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var shareTitle = this.data.article.article.title;
    var backImg = this.data.article.article.backImg;
    console.log("backImg:" + backImg);
    if (!shareTitle) {
      shareTitle = app.globalData.blogName;
    }
    return {
      title: shareTitle,
      imageUrl: app.globalData.URL + backImg
    }
  },


  /**
   * return返回上一页
   */
  returnPage() {
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
  },

  /**
   * 文章详情请求--接口调用成功处理
   */
  successFunPost: function (res, selfObj) {
    var that = this;
    var createTime = res.article.createTime;
    if (createTime) {
      res.article.createTime = util.formatTime(new Date(createTime));
    } else {
      res.article.createTime = util.formatTime(new Date());
    }
    let data = app.towxml.toJson(
      res.article.content, // `markdown`或`html`文本内容
      'markdown' // `markdown`或`html`
    );
    //设置文档显示主题，默认'light'
    data.theme = 'light';
    that.setData({
      article: res,
      link: res.article.link,
      postID: res.article.id,
      likeCount: res.likeCount,
      likeList: res.likeList,
      total_comments: res.commentNum,
      createDate: util.cutstr(res.article.createTime, 10, 1),
      commentCount: res.commentNum,
      articleMD: data,
      display: 'block',
      guessLikeList: res.guessLikeList,
    });

    //取消Loading效果
    wx.hideLoading();

    //动态设置当前页面的标题
    wx.setNavigationBarTitle({
      title: res.article.title,
    });
  },

  /**
   * 文章详情请求--接口调用失败处理
   */
  failFunPost: function (res, selfObj) {
    //取消Loading效果
    wx.hideLoading();
    console.log('failFunPosts', res)
  },

  //显示或隐藏功能菜单
  showHideMenu: function () {
    console.log("显示或隐藏功能菜单");
    this.setData({
      isShow: !this.data.isShow,
      isLoad: false,
      menuBackgroup: !this.data.false
    })
  },

  //点击非评论区隐藏功能菜单
  hiddenMenubox: function () {
    this.setData({
      isShow: false,
      menuBackgroup: false
    })
  },

  // 收藏功能
  clikeCollect: function (e) {
    var id = e.target.id;
    var self = this;
    if (id == 'likebottom') {
      this.showHideMenu();
    }

    if (self.data.openid) {
      var data = {
        openId: self.data.openid,
        articleId: self.data.postID
      };
      var url = app.globalData.URL + "/minimal/userCollect";
      var postLikeRequest = wxRequest.postRequest(url, data);
      postLikeRequest
        .then(response => {
          if (response.data.status == '200') {
            wx.showToast({
              title: '收藏成功',
              icon: 'success',
              duration: 900,
              success: function () { }
            })
          } else if (response.data.status == '501') {
            console.log(response.data.message);
            wx.showToast({
              title: '取消成功',
              icon: 'success',
              duration: 900,
              success: function () { }
            })
          } else {
            console.log(response.data.message);
          }
        })
    } else {
      Auth.checkSession(self, 'isLoginNow');
    }
  },

  //点赞功能
  clickLike: function (e) {
    var id = e.target.id;
    var self = this;
    if (id == 'likebottom') {
      this.showHideMenu();
    }

    if (self.data.openid) {
      var data = {
        openId: self.data.openid,
        articleId: self.data.postID
      };
      var url = app.globalData.URL + "/minimal/userLike";
      var postLikeRequest = wxRequest.postRequest(url, data);
      postLikeRequest
        .then(response => {
          if (response.data.status == '200') {
            var _likeList = []
            var _like = self.data.userInfo.avatarUrl;
            _likeList.push(_like);
            var tempLikeList = _likeList.concat(self.data.likeList);
            var _likeCount = parseInt(self.data.likeCount) + 1;
            self.setData({
              likeList: tempLikeList,
              likeCount: _likeCount,
              displayLike: 'block'
            });
            wx.showToast({
              title: '谢谢点赞',
              icon: 'success',
              duration: 900,
              success: function () { }
            })
          } else if (response.data.status == '501') {
            console.log(response.data.message);
            wx.showToast({
              title: '谢谢，已赞过',
              icon: 'success',
              duration: 900,
              success: function () { }
            })
          } else {
            console.log(response.data.message);
          }
          self.setData({
            likeImag: "like-on.png"
          });
        })
    } else {
      Auth.checkSession(self, 'isLoginNow');
    }
  },

  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, '0');
  },

  // 返回首页
  goHome: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 促发阅读原文事件
  gotowebpage: function () {
    this.showHideMenu();
    this.copyLink(this.data.link);
  },

  // 复制链接到内存中（微信自带API）
  copyLink: function (url) {
    if (!url) {
      wx.showToast({
        title: '无原文链接！',
        image: '../../images/link.png',
        duration: 2000
      })
      return;
    }
    wx.setClipboardData({
      data: url,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '链接已复制',
              image: '../../images/link.png',
              duration: 2000
            })
          }
        })
      }
    })
  },

  downimageTolocal: function () {
    var self = this;
    self.showHideMenu();
    var postid = self.data.article.article.id;
    var title = self.data.article.article.title;
    var path = "pages/detail/detail?id=" + postid;
    var excerpt = util.removeHTML(self.data.article.article.content);
    var postImageUrl = "";
    var posterImagePath = "";
    var qrcodeImagePath = "";
    var flag = false;
    var imageInlocalFlag = false;
    var domain = config.getDomain;
    var downloadFileDomain = config.getDownloadFileDomain;
    var fristImage = app.globalData.URL + self.data.article.article.backImg;
    //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
    if (fristImage) {
      var n = 0;
      for (var i = 0; i < downloadFileDomain.length; i++) {
        if (fristImage.indexOf(downloadFileDomain[i].domain) != -1) {
          n++;
          break;
        }
      }
      if (n > 0) {
        imageInlocalFlag = false;
        postImageUrl = fristImage;
      } else {
        postImageUrl = config.getPostImageUrl;
        posterImagePath = postImageUrl;
        imageInlocalFlag = true;
      }
    } else {
      postImageUrl = config.getPostImageUrl;
      posterImagePath = postImageUrl;
      imageInlocalFlag = true;
    }
    console.log(postImageUrl);
    var data = {
      path: path,
      articleId: postid
    };
    var url = app.globalData.URL + "/minimal/getwxacode";
    var postLikeRequest = wxRequest.getRequest(url, data);
    var posterQrcodeUrl = "https://www.wolzq.com/wechatCard.jpg";
    postLikeRequest
      .then(response => {
        if (response.statusCode == 200) {
          posterQrcodeUrl = app.globalData.URL + response.data;
          const downloadTaskQrcodeImage = wx.downloadFile({
            url: posterQrcodeUrl,
            success: res => {
              if (res.statusCode === 200) {
                qrcodeImagePath = res.tempFilePath;
                console.log("二维码图片本地位置：" + res.tempFilePath);
                if (!imageInlocalFlag) {
                  const downloadTaskForPostImage = wx.downloadFile({
                    url: postImageUrl,
                    success: res => {
                      if (res.statusCode === 200) {
                        posterImagePath = res.tempFilePath;
                        console.log("文章图片本地位置：" + res.tempFilePath);
                        flag = true;
                        if (posterImagePath && qrcodeImagePath) {
                          self.createPosterLocal(posterImagePath, qrcodeImagePath, title, excerpt);
                        }
                      } else {
                        console.log(res);
                        wx.hideLoading();
                        wx.showToast({
                          title: "生成海报失败...",
                          mask: true,
                          duration: 2000
                        });
                        return false;
                      }
                    }
                  });
                  downloadTaskForPostImage.onProgressUpdate((res) => {
                    console.log('下载文章图片进度：' + res.progress)
                  })
                } else {
                  if (posterImagePath && qrcodeImagePath) {
                    self.createPosterLocal(posterImagePath, qrcodeImagePath, title, excerpt);
                  }
                }
              } else {
                console.log(res);
                flag = false;
                wx.showToast({
                  title: "生成海报失败...",
                  mask: true,
                  duration: 2000
                });
                return false;
              }
            }
          });
          downloadTaskQrcodeImage.onProgressUpdate((res) => {
            console.log('下载二维码进度', res.progress)
          })
        }
      });
  },
  //将canvas转换为图片保存到本地，然后将路径传给image图片的src
  createPosterLocal: function (postImageLocal, qrcodeLoal, title, excerpt) {
    var that = this;
    wx.showLoading({
      title: "正在生成海报",
      mask: true,
    });
    var context = wx.createCanvasContext('mycanvas');
    context.setFillStyle('#ffffff'); //填充背景色
    context.fillRect(0, 0, 600, 970);
    context.drawImage(postImageLocal, 0, 0, 600, 400); //绘制首图
    context.drawImage(qrcodeLoal, 210, 670, 180, 180); //绘制二维码
    context.setFillStyle("#959595");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText("阅读文章，请长按识别二维码", 300, 900);
    context.setFillStyle("#959595");
    util.drawTitleExcerpt(context, title, excerpt); //文章标题
    context.draw();
    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          wx.hideLoading();
          console.log("海报图片路径：" + res.tempFilePath);
          that.modalView.showModal({
            title: '保存至相册可以分享到朋友圈',
            confirmation: false,
            confirmationText: '',
            inputFields: [{
              fieldName: 'posterImage',
              fieldType: 'Image',
              fieldPlaceHolder: '',
              fieldDatasource: res.tempFilePath,
              isRequired: false,
            }],
            confirm: function (res) {
              console.log(res)
              //用户按确定按钮以后会回到这里，并且对输入的表单数据会带回
            }
          })
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 900);
  },

  // 点击评论促发事件
  replay: function (e) {
    var self = this;
    var id = e.target.dataset.id;
    var name = e.target.dataset.name;
    var userid = e.target.dataset.userid;
    var toFromId = e.target.dataset.formid;
    var commentdate = e.target.dataset.commentdate;
    isFocusing = true;
    if (self.data.enableComment == "1") {
      self.setData({
        parentID: id,
        placeholder: "回复" + name + ":",
        focus: true,
        userid: userid,
        toFromId: toFromId,
        commentdate: commentdate
      });

    }
    console.log('toFromId', toFromId);
    console.log('replay', isFocusing);
  },

  // 获得焦点
  onRepleyFocus: function (e) {
    var self = this;
    isFocusing = false;
    console.log('onRepleyFocus', isFocusing);
    if (!self.data.focus) {
      self.setData({
        focus: true
      })
    }
  },

  // 获取评论输入的焦点
  onReplyBlur: function (e) {
    var self = this;
    console.log('onReplyBlur', isFocusing);
    if (!isFocusing) {
      {
        const text = e.detail.value.trim();
        if (text === '') {
          self.setData({
            parentID: "0",
            placeholder: "评论...",
            userid: "",
            toFromId: "",
            commentdate: ""
          });
        }
      }
    }
    console.log(isFocusing);
  },

  // 提示框确定按钮
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },

  //提交评论
  formSubmit: function (e) {
    var self = this;
    var comment = e.detail.value.inputComment;
    var parent = self.data.parentID;
    var postID = e.detail.value.inputPostID;
    var formId = e.detail.formId;
    if (formId == "the formId is a mock one") {
      formId = "";
    }
    var userid = self.data.userid;
    var toFromId = self.data.toFromId;
    var commentdate = self.data.commentdate;
    if (comment.length === 0) {
      self.setData({
        'dialog.hidden': false,
        'dialog.title': '提示',
        'dialog.content': '没有填写评论内容。'
      });
    } else {
      if (self.data.openid) {
        var name = self.data.userInfo.nickName;
        var author_url = self.data.userInfo.avatarUrl;
        var openid = self.data.openid;
        var fromUser = self.data.userInfo.nickName;
        var data = {
          articleId: postID,
          authorName: name,
          content: comment,
          authorUrl: author_url,
          parentId: parent,
          openId: openid,
          id: formId
        };
        var url = app.globalData.URL + "/minimal/postComment";
        var postCommentRequest = wxRequest.postRequest(url, data);
        postCommentRequest
          .then(res => {
            if (res.statusCode == 200) {
              if (res.data.status == '200') {
                self.setData({
                  content: '',
                  parentID: "0",
                  userid: 0,
                  placeholder: "评论...",
                  focus: false,
                  commentsList: []
                });
                console.log(res.data.message);
                var commentCounts = parseInt(self.data.total_comments) + 1;
                self.setData({
                  total_comments: commentCounts,
                  commentCount: "有" + commentCounts + "条评论"
                });
              } else if (res.data.status == '500') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '评论失败，请稍后重试。'
                });
              } else if (res.data.status == '501') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '内容过长，请重新输入！'
                });
              }
            } else {
              if (res.data.code == 'rest_comment_login_required') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '需要开启在WordPress rest api 的匿名评论功能！'
                });
              } else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': 'email填写错误！'
                });
              } else {
                console.log(res.data.code)
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '评论失败,' + res.data.message
                });
              }
            }
          }).then(response => {
            self.setData({
              page: 1,
              commentsList: [],
              isLastPage: false
            })
            self.onReachBottom();
            setTimeout(function () {
              wx.showToast({
                title: '评论发布成功',
                icon: 'success',
                duration: 900,
                success: function () { }
              })
            }, 900);
          }).catch(response => {
            console.log(response)
            self.setData({
              'dialog.hidden': false,
              'dialog.title': '提示',
              'dialog.content': '评论失败,' + response
            });
          })
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    }
  },

  //获取评论
  fetchCommentData: function () {
    var self = this;
    let args = {};
    args.postId = self.data.postID;
    args.limit = pageCount;
    args.page = self.data.page;
    self.setData({
      isLoading: true
    })
    var url = app.globalData.URL + "/minimal/selectArticleComments";
    var params = {
      articleId: args.postId,
      pageNo: args.page,
      pageSize: args.limit
    };
    var getCommentsRequest = wxRequest.getRequest(url, params);
    getCommentsRequest
      .then(response => {
        if (response.statusCode == 200) {
          if (response.data.data.length < pageCount) {
            self.setData({
              isLastPage: true
            });
          }
          if (response.data) {
            self.setData({
              commentsList: [].concat(self.data.commentsList, response.data.data)
            });
          }
        }
      })
      .catch(response => {
        console.log(response.data.message);
      }).finally(function () {
        self.setData({
          isLoading: false
        });
      });
  },

  //底部刷新
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchCommentData();
    } else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },

  // 图片点击放大功能
  __bind_tap: function (e) {
    imageCount++;
    if (imageCount === 2) {
      var that = this;
      let imagePath = "";
      if (e.target.dataset._el._e.attr.src){
         imagePath = e.target.dataset._el._e.attr.src;
      }

      if (typeof (imagePath) != 'undefined' && imagePath != "") {
        wx.previewImage({
          current: imagePath,
          urls: [imagePath]
        })
      }
      imageCount = 0;
    }
  },

  /**
   * 获取首页功能模块请求--接口调用成功处理
   */
  successFunHomeModule: function (res, selfObj) {
    var that = this;
    that.setData({
      likeList: res.data
    });
  },

  /**
   * 获取首页功能模块请求--接口调用失败处理
   */
  failFunHomeModule: function (res, selfObj) {
    console.log('failFunHomeModule', res)
  },

  // 右下角快捷操作
  rtCornerBarAction: function (e) {
    switch (e.detail.index) {
      case 0: // 回顶部
        this.pageScrollToParams(0, 300)
        break
    }
  },

  // onPageScroll: function (Object) {
  //   console.log("onPageScroll");
  //   let screenHeight = wx.getSystemInfoSync().windowHeight
  //   if (Object.scrollTop > screenHeight) {
  //     this.setData({
  //       // 'backToTop.flag': true,
  //       'backToTop.list': [{
  //         url: '../../images/back-to-top.png',
  //         name: '顶部'
  //       }]
  //     })
  //   } else {
  //     this.setData({
  //       'backToTop.list': []
  //     })
  //   }
  // },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = "../detail/detail?id=" + id + "&subjectId=" + this.data.subjectId;
    wx.navigateTo({
      url: url
    })
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

  __bind_touchmove: function () {

  },

  __bind_touchend: function () {

  },

  __bind_touchstart: function () {

  },
})